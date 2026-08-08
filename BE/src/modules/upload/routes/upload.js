const express = require('express');
const router = express.Router();
const { uploadCloud, cloudinary } = require('../../../core/utils/cloudinary');
const { authenticateToken } = require('../../../core/middlewares/auth');

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload an image to Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/', authenticateToken, uploadCloud.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  res.json({
    success: true,
    url: req.file.path,
    public_id: req.file.filename,
  });
});

/**
 * @swagger
 * /api/upload:
 *   delete:
 *     summary: Delete an image from Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    // Extract public_id from Cloudinary URL
    // Format: https://res.cloudinary.com/<cloud_name>/image/upload/v<version>/<public_id>.<ext>
    // We want to extract <public_id> which may contain folders.
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      return res.status(400).json({ success: false, message: 'Invalid Cloudinary URL' });
    }

    // Usually after 'upload' comes the version (v123456) or the folder directly.
    // If the part starts with 'v' and is numeric-ish, skip it
    let pathParts = urlParts.slice(uploadIndex + 1);
    if (pathParts[0].match(/^v\d+$/)) {
      pathParts.shift();
    }

    const publicIdWithExt = pathParts.join('/');
    const publicId = publicIdWithExt.split('.').slice(0, -1).join('.'); // Remove extension

    if (!publicId) {
      return res.status(400).json({ success: false, message: 'Could not extract public_id' });
    }

    await cloudinary.uploader.destroy(publicId);

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
