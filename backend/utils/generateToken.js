const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for authentication
 * @param {string} userId - The user's ID to encode in the token
 * @returns {string} The signed JWT token
 */
const generateToken = (userId) => {
   // Sign the token with user ID and secret, set to expire in 30 days (or adjust as needed)
   return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: '30d',
   });
};

module.exports = generateToken;
