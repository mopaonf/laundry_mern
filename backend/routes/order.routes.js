const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, authorize } = require('../middleware/authMiddleware');
const Order = require('../models/Order');

// POST /api/orders - Create a new order
router.post('/', protect, orderController.createOrder);

// GET /api/orders - Get all orders
router.get(
   '/',
   protect,
   authorize('receptionist', 'admin'),
   orderController.getAllOrders
);

// GET /api/orders/my-orders - Get customer's own orders
router.get(
   '/my-orders',
   protect,
   authorize('customer'),
   orderController.getMyOrders
);

// GET /api/orders/dashboard-stats - Get dashboard statistics
router.get(
   '/dashboard-stats',
   protect,
   authorize('receptionist', 'admin'),
   orderController.getDashboardStats
);

// PUT /api/orders/:id/pickup - Mark order as picked up
router.put(
   '/:id/pickup',
   protect,
   authorize('receptionist', 'admin', 'runner'),
   orderController.markAsPickedUp
);

// PUT /api/orders/:id/deliver - Mark order as delivered
router.put(
   '/:id/deliver',
   protect,
   authorize('receptionist', 'admin', 'runner'),
   orderController.markAsDelivered
);

// PUT /api/orders/:id/runner-location - Update runner location
router.put(
   '/:id/runner-location',
   protect,
   authorize('runner', 'receptionist', 'admin'),
   orderController.updateRunnerLocation
);

// GET /api/orders/reward-status - Get customer's reward status
router.get('/reward-status', protect, orderController.getRewardStatus);

// GET /api/orders/reward-history - Get customer's reward history
router.get('/reward-history', protect, orderController.getRewardHistory);

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
