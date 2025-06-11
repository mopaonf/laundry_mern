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

/**
 * @desc    Create a new customer
 * @route   POST /api/customers
 * @access  Private (Receptionist/Admin)
 */
exports.createCustomer = async (req, res) => {
   try {
      const { name, email, phone, address } = req.body;

      // Validate required fields
      if (!name || !phone) {
         return res.status(400).json({
            success: false,
            message: 'Name and phone are required fields',
         });
      }
      // Check if customer with same email already exists (if email is provided)
      if (email && email.trim() !== '') {
         const existingEmail = await User.findOne({
            email: email.toLowerCase(),
         });
         if (existingEmail) {
            return res.status(400).json({
               success: false,
               message: 'A customer with this email already exists',
            });
         }
      }

      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
         return res.status(400).json({
            success: false,
            message: 'A customer with this phone number already exists',
         });
      }

      // Generate a random temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      // Create the customer object without email first
      const customerData = {
         name,
         phone,
         password: tempPassword, // Set temp password
         role: 'customer', // Ensure role is set to customer
      };

      // Only add email and address if they are provided
      if (email && email.trim() !== '') {
         customerData.email = email;
      }

      if (address) {
         customerData.address = address;
      }

      // Create the new customer
      const newCustomer = await User.create(customerData);

      // Remove password from response
      const customerResponse = newCustomer.toObject();
      delete customerResponse.password;

      res.status(201).json({
         success: true,
         message: 'Customer created successfully',
         data: customerResponse,
      });
   } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({
         success: false,
         message: 'Error creating customer',
         error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
};
