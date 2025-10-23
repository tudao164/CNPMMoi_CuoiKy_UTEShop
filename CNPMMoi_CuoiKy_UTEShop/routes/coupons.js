const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// User coupon routes
router.post('/validate', couponController.validateCoupon);
router.get('/available', couponController.getAvailableCoupons);
router.get('/:code', couponController.getCouponByCode);

module.exports = router;
