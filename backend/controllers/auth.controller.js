const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new user (admin, receptionist, or customer)
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
   try {
      const { name, email, phone, password, role, address } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
         return res
            .status(400)
            .json({ message: 'User with this email already exists' });
      }

      // Validate role
      const validRoles = ['admin', 'receptionist', 'customer'];
      if (role && !validRoles.includes(role)) {
         return res.status(400).json({ message: 'Invalid role specified' });
      }

      // Create new user with appropriate role
      const userData = {
         name,
         email,
         phone,
         password, // Will be hashed by the pre-save hook
         role: role || 'customer', // Default to customer if not specified
      };

      // Add address for customers
      if (address && (role === 'customer' || !role)) {
         userData.address = address;
      }

      const user = await User.create(userData);

      // Generate JWT token
      const token = generateToken(user._id);

      // Return user data (without password) and token
      res.status(201).json({
         _id: user._id,
         name: user.name,
         email: user.email,
         phone: user.phone,
         role: user.role,
         token,
      });
   } catch (error) {
      res.status(500).json({
         message: 'Server error during registration',
         error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
};

/**
 * @desc    Login user and get token
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
   try {
      const { email, password } = req.body;

      // Check for user email
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
         return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if password matches
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
         return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Update last login timestamp
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });

      // Generate JWT token
      const token = generateToken(user._id);

      res.json({
         _id: user._id,
         name: user.name,
         email: user.email,
         phone: user.phone,
         role: user.role,
         token,
      });
   } catch (error) {
      res.status(500).json({
         message: 'Server error during login',
         error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
};
