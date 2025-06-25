const Transaction = require('../models/Transaction');

// Call this after payment initiation in order.controller.js
exports.createTransactionForOrder = async ({
   userId,
   orderId,
   reference,
   amount,
   phoneNumber,
   status,
   operator,
   ussd_code,
   description,
}) => {
   try {
      await Transaction.create({
         userId,
         orderId,
         reference,
         amount,
         phoneNumber,
         status,
         operator,
         ussd_code,
         description,
      });
   } catch (error) {
      console.error('Failed to create transaction:', error);
   }
};
