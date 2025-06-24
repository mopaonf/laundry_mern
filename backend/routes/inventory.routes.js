const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory.controller');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/inventory - Get all inventory items (customer/receptionist/admin)
router.get(
   '/',
   protect,
   authorize('customer', 'receptionist', 'admin'),
   inventoryController.getAllItems
);

// POST /api/inventory/seed - Seed inventory data (admin only)
router.post(
   '/seed',
   protect,
   authorize('admin'),
   inventoryController.seedInventory
);

module.exports = router;
