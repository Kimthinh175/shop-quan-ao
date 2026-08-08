const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shop-quan-ao', // Folder in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif', 'gif'],
    public_id: (req, file) => {
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext);
      return `${name}-${Date.now()}`;
    },
  },
});

const uploadCloud = multer({ storage });

module.exports = {
  cloudinary,
  uploadCloud,
};
