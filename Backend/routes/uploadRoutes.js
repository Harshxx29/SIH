const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/', authMiddleware, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        res.json({ success: true, url: req.file.path });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Image upload failed' });
    }
});

module.exports = router;
