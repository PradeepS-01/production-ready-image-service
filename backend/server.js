const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const crypto = require("crypto");

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

const upload = multer({ storage });

// Route
app.post("/upload", upload.array("images"), (req, res) => {
  const uploadType = req.body.uploadType;
  const folderName = req.body.folderName || "default";

  const urls = req.files.map(file => {
    const pathPart = uploadType === "multiple" ? `${folderName}/` : "";
    return `/images/${pathPart}${file.filename}`;
  });

  res.json({ urls });
});

app.listen(5000, () => console.log("Server running on port 5000"));