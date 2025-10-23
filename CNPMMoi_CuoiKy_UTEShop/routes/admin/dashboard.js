const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/adminDashboardController');
const { authenticateToken, requireAdmin } = require('../../middleware/auth');

// Apply authentication and admin check to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard routes
router.get('/overview', dashboardController.getOverview);
router.get('/revenue-chart', dashboardController.getRevenueChart);
router.get('/top-products', dashboardController.getTopProducts);
router.get('/delivered-orders', dashboardController.getDeliveredOrders);
router.get('/cash-flow', dashboardController.getCashFlow);
router.get('/new-customers', dashboardController.getNewCustomers);

module.exports = router;
