const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// User review routes
router.post('/', reviewController.createReview);
router.get('/my-reviews', reviewController.getMyReviews);
router.get('/product/:productId', reviewController.getProductReviews);
router.get('/can-review/:productId/:orderId', reviewController.checkCanReview);
router.get('/:id', reviewController.getReviewById);
router.put('/:id', reviewController.updateReview);
router.delete('/:id', reviewController.deleteReview);
router.post('/:id/helpful', reviewController.markHelpful);

module.exports = router;
