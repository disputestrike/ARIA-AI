/**
 * File upload endpoint for ARIA chat attachments.
 * Accepts PDF, Word, text, images, and audio files.
 * Uploads to S3 and extracts text content where possible.
 */
import { Router } from "express";
import multer from "multer";
import { storagePut } from "./storage";
import { sdk } from "./_core/sdk";

const router = Router();

// Store files in memory (max 20MB per file, 50MB total)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/csv",
      "text/markdown",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "audio/mpeg",
      "audio/wav",
      "audio/webm",
      "audio/ogg",
      "audio/mp4",
    ];
    if (allowed.includes(file.mimetype) || file.mimetype.startsWith("text/")) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not supported`));
    }
  },
});

/**
 * Extract plain text from a file buffer based on MIME type.
 * For images, returns a placeholder (ARIA will describe them via vision).
 */
async function extractTextContent(
  buffer: Buffer,
  mimetype: string,
  filename: string
): Promise<string | null> {
  try {
    if (mimetype === "text/plain" || mimetype === "text/markdown" || mimetype === "text/csv") {
      return buffer.toString("utf-8").slice(0, 50000); // cap at 50k chars
    }
    if (mimetype.startsWith("image/")) {
      return null; // images are sent as URLs for vision
    }
    // For PDF and Word, return null — we'll pass the URL to ARIA
    // In a production setup you'd use pdf-parse or mammoth here
    return null;
  } catch {
    return null;
  }
}

router.post(
  "/api/upload/attachment",
  async (req, res, next) => {
    // Auth check
    try {
      await sdk.authenticateRequest(req);
      next();
    } catch {
      res.status(401).json({ error: "Unauthorized" });
    }
  },
  upload.array("files", 5),
  async (req, res) => {
    try {
      let user;
      try { user = await sdk.authenticateRequest(req); } catch { res.status(401).json({ error: "Unauthorized" }); return; }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: "No files uploaded" });
        return;
      }

      const results = await Promise.all(
        files.map(async (file) => {
          const ext = file.originalname.split(".").pop() ?? "bin";
          const key = `user-${user.id}/attachments/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { url } = await storagePut(key, file.buffer, file.mimetype);
          const content = await extractTextContent(file.buffer, file.mimetype, file.originalname);
          return {
            name: file.originalname,
            url,
            type: file.mimetype,
            size: file.size,
            content: content ?? undefined,
          };
        })
      );

      res.json({ attachments: results });
    } catch (err) {
      console.error("[Upload] Error:", err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

export { router as uploadRouter };
