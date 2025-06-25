const Transaction = require('../models/Transaction');

// Create a new transaction
exports.createTransaction = async (req, res) => {
   try {
      const tx = await Transaction.create(req.body);
      res.status(201).json({ success: true, data: tx });
   } catch (error) {
      res.status(500).json({ success: false, error: error.message });
   }
};

// Get all transactions for a user
exports.getUserTransactions = async (req, res) => {
   try {
      const userId = req.user._id;
      const txs = await Transaction.find({ userId }).sort({ createdAt: -1 });
      res.json({ success: true, data: txs });
   } catch (error) {
      res.status(500).json({ success: false, error: error.message });
   }
};

// (Optional) Get all transactions (admin)
exports.getAllTransactions = async (req, res) => {
   try {
      const txs = await Transaction.find().sort({ createdAt: -1 });
      res.json({ success: true, data: txs });
   } catch (error) {
      res.status(500).json({ success: false, error: error.message });
   }
};
