import { Router, type Request, type Response } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { createReadStream, existsSync } from "fs";
import { mkdir } from "fs/promises";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");

// Ensure uploads directory exists
mkdir(UPLOADS_DIR, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    cb(null, allowed.includes(file.mimetype));
  },
});

// For the frontend useUpload hook: request a "presigned URL"
// We simulate this by returning an upload URL pointing to our own endpoint
router.post("/storage/uploads/request-url", requireAdmin, (req: Request, res: Response): void => {
  const { name, size, contentType } = req.body;
  if (!name || !size || !contentType) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const objectPath = `/objects/${randomUUID()}${path.extname(name)}`;
  // The "upload URL" is our own PUT endpoint
  const uploadURL = `/api/storage/upload-direct${objectPath}`;

  res.json({ uploadURL, objectPath, metadata: { name, size, contentType } });
});

// Handle the actual file upload (PUT from the frontend)
router.put("/storage/upload-direct/objects/:filename", requireAdmin, (req: Request, res: Response): void => {
  const filename = req.params.filename;
  const ext = path.extname(filename);
  const finalName = `${randomUUID()}${ext}`;
  const dest = path.join(UPLOADS_DIR, finalName);

  const chunks: Buffer[] = [];
  req.on("data", (chunk: Buffer) => chunks.push(chunk));
  req.on("end", async () => {
    const { writeFile } = await import("fs/promises");
    await writeFile(dest, Buffer.concat(chunks));
    res.status(200).end();
  });
  req.on("error", () => res.status(500).end());
});

// Serve uploaded files
router.get("/storage/objects/:filename", (req: Request, res: Response): void => {
  const filename = path.basename(req.params.filename); // prevent path traversal
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!existsSync(filePath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }
  createReadStream(filePath).pipe(res);
});

export default router;
