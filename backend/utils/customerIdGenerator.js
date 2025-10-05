const Counter = require('../models/Counter');

/**
 * Generate next customer ID in format PL1, PL2, PL3, etc.
 * @returns {Promise<string>} Next customer ID
 */
const generateCustomerId = async () => {
   try {
      const nextNumber = await Counter.getNextSequence('customerId');
      return `PL${nextNumber}`;
   } catch (error) {
      console.error('Error generating customer ID:', error);
      throw new Error('Failed to generate customer ID');
   }
};

/**
 * Initialize customer ID counter with a starting value
 * @param {number} startValue - Starting value for the counter (default: 23)
 */
const initializeCustomerCounter = async (startValue = 23) => {
   try {
      const existingCounter = await Counter.findOne({ name: 'customerId' });
      if (!existingCounter) {
         await Counter.create({
            name: 'customerId',
            value: startValue,
         });
         console.log(
            `Customer ID counter initialized with value: ${startValue}`
         );
      }
   } catch (error) {
      console.error('Error initializing customer counter:', error);
   }
};

module.exports = {
   generateCustomerId,
   initializeCustomerCounter,
};
