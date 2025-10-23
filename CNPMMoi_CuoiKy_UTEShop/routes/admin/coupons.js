const express = require('express');
const router = express.Router();
const adminCouponController = require('../../controllers/admin/adminCouponController');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');

// Apply authentication and admin check
router.use(authenticateToken);
router.use(requireAdmin);

// Admin coupon management routes
router.post('/', adminCouponController.createCoupon);
router.get('/', adminCouponController.getAllCoupons);
router.get('/statistics/overview', adminCouponController.getOverviewStats);
router.get('/:id', adminCouponController.getCouponById);
router.get('/:id/stats', adminCouponController.getCouponStats);
router.put('/:id', adminCouponController.updateCoupon);
router.delete('/:id', adminCouponController.deleteCoupon);

module.exports = router;
