const multer = require('multer');
const path = require('path');
const fs = require('fs');

function makeStorage(subfolder) {
  const dir = path.join(__dirname, '..', 'uploads', subfolder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, unique);
    },
  });
}

const imageFilter = (req, file, cb) => {
  if (/^image\//.test(file.mimetype)) return cb(null, true);
  cb(new Error('Only image files are allowed'));
};

const uploadPhotos = multer({
  storage: makeStorage('photos'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadSignature = multer({
  storage: makeStorage('signatures'),
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

module.exports = { uploadPhotos, uploadSignature };
