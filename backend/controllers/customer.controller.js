const User = require('../models/User');

/**
 * @desc    Get all customers
 * @route   GET /api/customers
 * @access  Private (Receptionist/Admin)
 */
exports.getAllCustomers = async (req, res) => {
   try {
      // Find all users with role 'customer' and sort by createdAt (newest first)
      const customers = await User.find({ role: 'customer' })
         .select('-password') // Exclude password field
         .sort({ createdAt: -1 });

      res.status(200).json({
         success: true,
         count: customers.length,
         data: customers,
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: 'Error fetching customers',
         error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
};
