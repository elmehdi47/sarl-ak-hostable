import "dotenv/config";
import app from "./app.js";
import { autoSeed } from "./auto-seed.js";

const port = parseInt(process.env.PORT || "3000", 10);

autoSeed()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Auto-seed failed, starting server anyway:", err);
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  });
