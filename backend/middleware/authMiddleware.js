const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes that require authentication
 * Verifies the JWT token from the Authorization header
 */
const protect = async (req, res, next) => {
   try {
      let token;

      // Check if token exists in Authorization header
      if (
         req.headers.authorization &&
         req.headers.authorization.startsWith('Bearer')
      ) {
         // Extract token from Bearer token format
         token = req.headers.authorization.split(' ')[1];
      }

      // Check if token exists
      if (!token) {
         return res
            .status(401)
            .json({ message: 'Not authorized, no token provided' });
      }

      try {
         // Verify token
         const decoded = jwt.verify(token, process.env.JWT_SECRET);

         // Add user data to request object
         req.user = await User.findById(decoded.id).select('-password');

         if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
         }

         next();
      } catch (error) {
         return res
            .status(401)
            .json({ message: 'Not authorized, token failed' });
      }
   } catch (error) {
      res.status(500).json({ message: 'Server error in auth middleware' });
   }
};

/**
 * Middleware to restrict access based on user roles
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
   return (req, res, next) => {
      if (!req.user || !roles.includes(req.user.role)) {
         return res.status(403).json({
            message: `Access denied: Role '${
               req.user?.role || 'unknown'
            }' is not authorized to access this resource`,
         });
      }
      next();
   };
};

module.exports = { protect, authorize };
