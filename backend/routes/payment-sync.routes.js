const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const campayService = require('../services/campayService');

// Endpoint to sync payment status and update order/transaction
router.post('/sync-status/:reference', async (req, res) => {
   const { reference } = req.params;
   try {
      // 1. Check status from Campay
      const result = await campayService.checkTransactionStatus(reference);
      const normalizedStatus = result.status?.toUpperCase();
      // 2. Update transaction
      const tx = await Transaction.findOneAndUpdate(
         { reference },
         { status: normalizedStatus },
         { new: true }
      );
      // 3. Update order if paid
      if (tx && tx.orderId && normalizedStatus === 'SUCCESSFUL') {
         await Order.findByIdAndUpdate(tx.orderId, {
            paymentStatus: 'SUCCESSFUL',
         });
      }
      res.json({ success: true, status: normalizedStatus, transaction: tx });
   } catch (error) {
      res.status(500).json({ success: false, error: error.message });
   }
});

module.exports = router;
