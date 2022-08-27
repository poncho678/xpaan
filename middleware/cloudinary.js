const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { v2: cloudinary } = require("cloudinary");

const { cloudinaryFolder } = require("../utils/consts");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: cloudinaryFolder,
  },
});

const uploadMiddleware = multer({
  storage,
});

module.exports = uploadMiddleware;
