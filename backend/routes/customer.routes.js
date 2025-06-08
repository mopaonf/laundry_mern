const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/customers - Get all customers (receptionist and admin only)
router.get(
   '/',
   protect,
   authorize('receptionist', 'admin'),
   customerController.getAllCustomers
);

module.exports = router;
