import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), "uploads", "users");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, "user" + "-" + Date.now() + path.extname(file.originalname));
  },
});

// File filter configuration
const fileFilter = (req, file, cb) => {
  cb(null, true);
};

// Configure and export the multer upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

export default upload.single("image");
