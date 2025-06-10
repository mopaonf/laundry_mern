const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/authMiddleware');
const Order = require('../models/Order');

// POST /api/orders - Create a new order
router.post(
   '/',
   protect,
   authorize('receptionist', 'admin'),
   orderController.createOrder
);

// GET /api/orders - Get all orders
router.get(
   '/',
   protect,
   authorize('receptionist', 'admin'),
   orderController.getAllOrders
);

// GET /api/orders/dashboard-stats - Get dashboard statistics
router.get(
   '/dashboard-stats',
   protect,
   authorize('receptionist', 'admin'),
   orderController.getDashboardStats
);

// Update order status
router.put('/:id/status', async (req, res, next) => {
   try {
      const { status } = req.body;

      if (!status) {
         return res.status(400).json({
            success: false,
            message: 'Status is required',
         });
      }

      const updatedOrder = await Order.findByIdAndUpdate(
         req.params.id,
         { status },
         { new: true, runValidators: true }
      );

      if (!updatedOrder) {
         return res.status(404).json({
            success: false,
            message: 'Order not found',
         });
      }

      res.status(200).json({
         success: true,
         data: updatedOrder,
      });
   } catch (error) {
      next(error);
   }
});

module.exports = router;
