const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect, authorize } = require('../middleware/authMiddleware');

// Debug route to verify router is working
router.get('/test', (req, res) => {
   res.json({
      message: 'Auth router is working',
      timestamp: new Date().toISOString(),
   });
});

// Public auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected user routes
router.patch('/profile', protect, authController.updateProfile);

// Admin only routes for managing users
router.patch(
   '/users/:id',
   protect,
   authorize('admin'),
   authController.updateUser
);
router.delete(
   '/users/:id',
   protect,
   authorize('admin'),
   authController.deleteUser
);

// Export the router
module.exports = router;
