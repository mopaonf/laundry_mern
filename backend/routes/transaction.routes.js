const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const authMiddleware = require('../middleware/authMiddleware');
const protect = authMiddleware.protect;

// Create a transaction (for internal use, e.g. after payment)
router.post('/', protect, transactionController.createTransaction);

// Get all transactions for the logged-in user
router.get('/my', protect, transactionController.getUserTransactions);

// (Optional) Get all transactions (admin)
// router.get('/', authMiddleware, transactionController.getAllTransactions);

module.exports = router;
