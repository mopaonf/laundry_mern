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
         customerId: user.customerId,
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
         customerId: user.customerId,
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

/**
 * @desc    Update user profile
 * @route   PATCH /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res) => {
   try {
      // Get user from middleware
      const userId = req.user._id;

      // Fields that are allowed to be updated
      const { name, email, phone, address } = req.body;

      // Build update object with only provided fields
      const updateFields = {};
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (phone) updateFields.phone = phone;
      if (address && req.user.role === 'customer')
         updateFields.address = address;

      // Check if email already exists if trying to change it
      if (email && email !== req.user.email) {
         const existingUser = await User.findOne({ email });
         if (existingUser) {
            return res.status(400).json({
               success: false,
               message: 'Email already in use by another account',
            });
         }
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
         new: true,
         runValidators: true,
      });

      if (!updatedUser) {
         return res.status(404).json({
            success: false,
            message: 'User not found',
         });
      }

      res.status(200).json({
         success: true,
         data: {
            _id: updatedUser._id,
            customerId: updatedUser.customerId,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
            address: updatedUser.address,
         },
         message: 'Profile updated successfully',
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: 'Error updating profile',
         error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
};

/**
 * @desc    Update user by ID (admin only)
 * @route   PATCH /api/auth/users/:id
 * @access  Admin
 */
exports.updateUser = async (req, res) => {
   try {
      const userId = req.params.id;

      // Get allowed fields to update
      const { name, email, phone, role, address, isActive } = req.body;

      // Build update object
      const updateFields = {};
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (phone) updateFields.phone = phone;
      if (role) {
         // Validate role
         const validRoles = ['admin', 'receptionist', 'customer'];
         if (!validRoles.includes(role)) {
            return res.status(400).json({
               success: false,
               message: 'Invalid role specified',
            });
         }
         updateFields.role = role;
      }
      if (address) updateFields.address = address;
      if (isActive !== undefined) updateFields.isActive = isActive;

      // Check if email already exists
      if (email) {
         const existingUser = await User.findOne({
            email,
            _id: { $ne: userId },
         });
         if (existingUser) {
            return res.status(400).json({
               success: false,
               message: 'Email already in use by another account',
            });
         }
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
         new: true,
         runValidators: true,
      });

      if (!updatedUser) {
         return res.status(404).json({
            success: false,
            message: 'User not found',
         });
      }

      res.status(200).json({
         success: true,
         data: {
            _id: updatedUser._id,
            customerId: updatedUser.customerId,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
            isActive: updatedUser.isActive,
         },
         message: 'User updated successfully',
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: 'Error updating user',
         error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
};

/**
 * @desc    Delete user by ID
 * @route   DELETE /api/auth/users/:id
 * @access  Admin
 */
exports.deleteUser = async (req, res) => {
   try {
      const userId = req.params.id;

      // Check if user is trying to delete themselves
      if (req.user._id.toString() === userId) {
         return res.status(400).json({
            success: false,
            message: 'You cannot delete your own account',
         });
      }

      // Find and delete the user
      const deletedUser = await User.findByIdAndDelete(userId);

      if (!deletedUser) {
         return res.status(404).json({
            success: false,
            message: 'User not found',
         });
      }

      res.status(200).json({
         success: true,
         message: 'User deleted successfully',
         data: {
            _id: deletedUser._id,
            name: deletedUser.name,
            email: deletedUser.email,
         },
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: 'Error deleting user',
         error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
};
