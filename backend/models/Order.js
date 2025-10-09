const mongoose = require('mongoose');

// Location schema for both pickup and dropoff
const locationSchema = new mongoose.Schema(
   {
      address: {
         type: String,
         required: true,
      },
      coordinates: {
         latitude: {
            type: Number,
            required: true,
            min: [-90, 'Latitude must be between -90 and 90'],
            max: [90, 'Latitude must be between -90 and 90'],
         },
         longitude: {
            type: Number,
            required: true,
            min: [-180, 'Longitude must be between -180 and 180'],
            max: [180, 'Longitude must be between -180 and 180'],
         },
      },
      placeId: {
         type: String, // Google Places ID for reference
      },
      instructions: {
         type: String, // Special delivery/pickup instructions
      },
   },
   { _id: false }
);

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
      enum: [
         'Pending Pickup',
         'Picked Up',
         'In Progress',
         'Ready for Pickup',
         'Out for Delivery',
         'Delivered',
         'Completed',
      ],
      default: 'Pending Pickup',
   },
   // Pickup location (where to collect laundry from customer)
   pickupLocation: {
      type: locationSchema,
      required: true,
   },
   // Dropoff location (where to deliver clean laundry to customer)
   dropoffLocation: {
      type: locationSchema,
      required: true,
   },
   // Actual pickup and delivery times
   pickedUpAt: {
      type: Date,
   },
   deliveredAt: {
      type: Date,
   },
   // Runner/driver information
   assignedRunner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Could be a delivery person
   },
   runnerLocation: {
      latitude: Number,
      longitude: Number,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
   paymentStatus: {
      type: String,
      enum: ['PENDING', 'SUCCESSFUL', 'FAILED', 'NOT_REQUIRED'],
      default: 'PENDING',
   },
   paymentReference: {
      type: String,
   },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
