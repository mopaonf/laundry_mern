const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
   itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true,
   },
   name: {
      type: String,
      required: true,
   },
   price: {
      type: Number,
      required: true,
   },
   quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
   },
});

const orderSchema = new mongoose.Schema({
   customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
   },
   items: [orderItemSchema],
   pickupDate: {
      type: Date,
      required: true,
   },
   notes: {
      type: String,
   },
   total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative'],
   },
   status: {
      type: String,
      enum: ['In Progress', 'Ready for Pickup', 'Completed'],
      default: 'In Progress',
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
