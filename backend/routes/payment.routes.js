const express = require('express');
const router = express.Router();
const campayService = require('../services/campayService');

// Initiate payment (collect)
router.post('/pay', async (req, res) => {
   const { amount, phoneNumber, description } = req.body;
   try {
      const result = await campayService.collect(
         amount,
         phoneNumber,
         description
      );
      res.json(result);
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

// Check transaction status
router.get('/status/:reference', async (req, res) => {
   const { reference } = req.params;
   try {
      const result = await campayService.checkTransactionStatus(reference);
      res.json(result);
   } catch (error) {
      res.status(500).json({ error: error.message });
   }
});

module.exports = router;
