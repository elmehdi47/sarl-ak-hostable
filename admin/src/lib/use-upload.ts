import { useState } from "react";

interface UploadResponse {
  objectPath: string;
}

interface UseUploadOptions {
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: Error) => void;
}

export function useUpload(opts?: UseUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function uploadFile(file: File) {
    setIsUploading(true);
    setProgress(0);
    try {
      // Request a presigned upload path from our backend
      const res = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await res.json();

      // Upload the file via PUT
      setProgress(30);
      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      setProgress(100);
      opts?.onSuccess?.({ objectPath });
    } catch (err) {
      opts?.onError?.(err instanceof Error ? err : new Error("Upload failed"));
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }

  return { uploadFile, isUploading, progress };
}
