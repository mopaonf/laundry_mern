const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Debug route to verify router is working
router.get('/test', (req, res) => {
   res.json({
      message: 'Auth router is working',
      timestamp: new Date().toISOString(),
   });
});

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Export the router
module.exports = router;
