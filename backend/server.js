const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const crypto = require("crypto");
const sharp = require("sharp");

const app = express();
app.use(express.json());

app.use(cors());

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadType = req.body.uploadType;
    let uploadPath = "uploads/";

    if (uploadType === "multiple") {
      const folderName = req.body.folderName || "default";
      uploadPath = `uploads/${folderName}`;
    }

    // Create folder if not exists
    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    cb(null, crypto.randomUUID() + path.extname(file.originalname));
  }
});

// Allowed MIME types and file extensions — must match on both sides for security
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/svg+xml"
];

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg"];

// File filter — checks both MIME type AND extension to prevent spoofing
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, WEBP, AVIF, and SVG are allowed."), false);
  }
};

const upload = multer({ storage, fileFilter });

// Route
app.post("/upload", upload.array("images"), async (req, res) => {
  // Guard: multer may pass 0 files if all were rejected by fileFilter
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No valid files were uploaded." });
  }

  const uploadType = req.body.uploadType;
  const folderName = req.body.folderName || "default";

  try {
    const urls = await Promise.all(
      req.files.map(async (file) => {
        const pathPart = uploadType === "multiple" ? `${folderName}/` : "";

        // SVG and WebP are kept as-is — no re-encoding needed
        // SVG: sharp can't convert vector, WebP: already optimal, re-encoding only degrades quality
        const skipConversion = file.mimetype === "image/svg+xml" || file.mimetype === "image/webp";

        if (skipConversion) {
          return `/images/${pathPart}${file.filename}`;
        }

        // JPEG / PNG / AVIF → convert to WebP
        const uuid = path.basename(file.filename, path.extname(file.filename));
        const webpFilename = uuid + ".webp";
        const webpPath = path.join(file.destination, webpFilename);

        await sharp(file.path)
          .webp({ quality: 85 })   // quality 85 is a good balance of size vs fidelity
          .toFile(webpPath);

        // Delete the original uploaded file (e.g. .jpg, .png) — keep only .webp
        fs.unlinkSync(file.path);

        return `/images/${pathPart}${webpFilename}`;
      })
    );

    res.json({ urls });
  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).json({ error: "Image conversion failed: " + err.message });
  }
});

// Multer error handler — must have 4 args to be recognised by Express as error middleware
// Catches fileFilter rejections and returns a clean 400 JSON response
app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

app.listen(5000, () => console.log("Server running on port 5000"));