const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const s3 = require('../config/s3');

const bucket = process.env.AWS_S3_BUCKET;

function makeStorage(subfolder) {
  return multerS3({
    s3,
    bucket,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, `${subfolder}/${unique}`);
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
