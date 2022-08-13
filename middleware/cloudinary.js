const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { v2: cloudinary } = require("cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "xpaan-images",
  },
});

const uploadMiddleware = multer({
  storage,
});

module.exports = uploadMiddleware;
