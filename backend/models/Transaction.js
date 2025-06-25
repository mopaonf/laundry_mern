const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
   userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
   },
   orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
   reference: { type: String, required: true },
   amount: { type: Number, required: true },
   phoneNumber: { type: String },
   status: {
      type: String,
      enum: ['PENDING', 'SUCCESSFUL', 'FAILED'],
      default: 'PENDING',
   },
   operator: { type: String },
   ussd_code: { type: String },
   description: { type: String },
   createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', transactionSchema);
