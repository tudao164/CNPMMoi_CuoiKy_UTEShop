const express = require('express');
const router = express.Router();
const adminReviewController = require('../../controllers/admin/adminReviewController');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');

// Apply authentication and admin check
router.use(authenticateToken);
router.use(requireAdmin);

// Admin review management routes
router.get('/', adminReviewController.getAllReviews);
router.get('/stats', adminReviewController.getReviewStats);
router.get('/:id', adminReviewController.getReviewById);
router.put('/:id/approve', adminReviewController.approveReview);
router.put('/:id/reject', adminReviewController.rejectReview);
router.delete('/:id', adminReviewController.deleteReview);

module.exports = router;
