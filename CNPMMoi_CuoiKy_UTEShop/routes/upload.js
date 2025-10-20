const express = require('express');
const router = express.Router();
const { uploadSingle, uploadMultiple } = require('../middleware/upload');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// POST /api/upload/single - Upload single image
router.post('/single', authenticateToken, requireAdmin, uploadSingle, (req, res) => {
    try {
        if (!req.file) {
            return errorResponse(res, 'Không có file nào được upload', 400);
        }

        const imageUrl = `/images/${req.file.filename}`;
        
        return successResponse(res, {
            image_url: imageUrl,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype
        }, 'Upload ảnh thành công');

    } catch (error) {
        console.error('❌ Upload single image error:', error);
        return errorResponse(res, 'Lỗi upload ảnh', 500);
    }
});

// POST /api/upload/multiple - Upload multiple images
router.post('/multiple', authenticateToken, requireAdmin, uploadMultiple, (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return errorResponse(res, 'Không có file nào được upload', 400);
        }

        const images = req.files.map(file => ({
            image_url: `/images/${file.filename}`,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype
        }));

        return successResponse(res, {
            images: images,
            count: images.length
        }, `Upload ${images.length} ảnh thành công`);

    } catch (error) {
        console.error('❌ Upload multiple images error:', error);
        return errorResponse(res, 'Lỗi upload ảnh', 500);
    }
});

// DELETE /api/upload/:filename - Delete uploaded image
router.delete('/:filename', authenticateToken, requireAdmin, (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const filename = req.params.filename;
        const filePath = path.join(__dirname, '../images', filename);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return errorResponse(res, 'File không tồn tại', 404);
        }

        // Delete file
        fs.unlinkSync(filePath);

        return successResponse(res, null, 'Xóa ảnh thành công');

    } catch (error) {
        console.error('❌ Delete image error:', error);
        return errorResponse(res, 'Lỗi xóa ảnh', 500);
    }
});

module.exports = router;
