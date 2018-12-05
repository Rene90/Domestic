const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: 'dyhogihtx',
  api_key: '638729578657571',
  api_secret: 'pRWzX5BZhuCW0YAULD3SNNny-k4',
  
});
var storage = cloudinaryStorage({
  cloudinary,
  folder: "Domestic",
  allowedFormats: ["jpg", "png", "jpeg", "gif", "pdf"],
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const uploadCloud = multer({ storage: storage });
module.exports = uploadCloud;

