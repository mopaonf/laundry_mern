const InventoryItem = require('../models/InventoryItem');

/**
 * @desc    Get all inventory items
 * @route   GET /api/inventory
 * @access  Private
 */
exports.getAllItems = async (req, res) => {
   try {
      const items = await InventoryItem.find().sort({ category: 1, name: 1 });

      res.status(200).json({
         success: true,
         count: items.length,
         data: items,
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: 'Error fetching inventory items',
         error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
};

/**
 * @desc    Bulk insert inventory items (seed data)
 * @route   POST /api/inventory/seed
 * @access  Admin
 */
exports.seedInventory = async (req, res) => {
   try {
      // Validate request body
      if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
         return res.status(400).json({
            success: false,
            message:
               'Invalid input: Please provide an array of inventory items',
         });
      }

      // Attempt to insert many items at once
      const result = await InventoryItem.insertMany(req.body, {
         ordered: false, // Continue processing even if some documents fail
         rawResult: true, // Get the raw result from MongoDB
      });

      return res.status(201).json({
         success: true,
         message: `Successfully added ${result.insertedCount} inventory items`,
         insertedCount: result.insertedCount,
         insertedIds: result.insertedIds,
      });
   } catch (error) {
      // Check for duplicate key error (code 11000)
      if (
         error.code === 11000 ||
         (error.writeErrors &&
            error.writeErrors.some((err) => err.code === 11000))
      ) {
         return res.status(409).json({
            success: false,
            message: 'Some items already exist in the inventory',
            error:
               process.env.NODE_ENV === 'development'
                  ? error.message
                  : undefined,
         });
      }

      // Handle validation errors
      if (error.name === 'ValidationError') {
         return res.status(400).json({
            success: false,
            message: 'Validation error: Please check your data format',
            error:
               process.env.NODE_ENV === 'development'
                  ? error.message
                  : undefined,
         });
      }

      // General server error
      res.status(500).json({
         success: false,
         message: 'Error seeding inventory data',
         error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
};
