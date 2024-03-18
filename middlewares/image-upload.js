const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/tmp'); // Use the temporary directory provided by the serverless runtime
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `${uuidv4()}-${uniqueSuffix}-${file.originalname}`);
    },
  }),
});

const configuredMulterMiddleware = upload.single('image');

module.exports = configuredMulterMiddleware;
