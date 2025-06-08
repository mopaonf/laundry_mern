const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
   name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
   },
   category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
   },
   serviceType: {
      type: String,
      required: [true, 'Service type is required'],
      enum: ['Wash & Iron', 'Dry Clean'],
   },
   basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative'],
   },
   image: {
      type: String,
      trim: true,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

// Add compound index to help prevent duplicates
inventoryItemSchema.index({ name: 1, serviceType: 1 }, { unique: true });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

module.exports = InventoryItem;
