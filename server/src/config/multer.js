// src/config/multer.config.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// ─── Ensure upload directories exist at startup ───────────────────────────────
const photoDir = path.join(__dirname, '../../uploads/photos');
const docDir   = path.join(__dirname, '../../uploads/documents');
[photoDir, docDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ─── Storage engine ─────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Route to a different folder depending on the upload type
    const dest = file.fieldname === 'profilePhoto' ? photoDir : docDir;
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // NEVER trust the original filename — it's attacker-controlled input.
    // A filename like "../../etc/passwd.jpg" or "<script>.png" must never
    // reach the filesystem unsanitized.
    const ext = path.extname(file.originalname).toLowerCase();
    const randomName = crypto.randomBytes(16).toString('hex');
    // Result: a1b2c3d4...{ext} — no relation to user input, collision-proof
    cb(null, `${randomName}${ext}`);
  },
});

// ─── File type validation ───────────────────────────────────────────────────
const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const documentTypes = [...imageTypes, 'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const fileFilter = (req, file, cb) => {
  const allowed = file.fieldname === 'profilePhoto' ? imageTypes : documentTypes;

  if (!allowed.includes(file.mimetype)) {
    // Pass an error to cb — Multer surfaces this as err in the route handler
    return cb(new Error(
      `Invalid file type. Allowed: ${allowed.join(', ')}`
    ), false);
  }
  cb(null, true);
};

// ─── Multer instances — separate configs for separate use cases ─────────────
const uploadPhoto = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB — profile photos don't need to be huge
  },
}).single('profilePhoto'); // expects ONE file under field name "profilePhoto"

const uploadDocuments = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file — documents can be larger
    files: 5, // max 5 files per request
  },
}).array('documents', 5); // expects up to 5 files under field name "documents"

module.exports = { uploadPhoto, uploadDocuments };