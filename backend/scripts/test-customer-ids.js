const mongoose = require('mongoose');
const User = require('../models/User');
const Counter = require('../models/Counter');

/**
 * Test script to verify customer ID generation
 */
const testCustomerIdGeneration = async () => {
   try {
      console.log('🧪 Testing Customer ID Generation...\n');

      // Check current counter state
      const counter = await Counter.findOne({ name: 'customerId' });
      console.log(
         `Current counter value: ${counter ? counter.value : 'Not initialized'}`
      );

      if (counter) {
         console.log(`Next customer ID will be: PL${counter.value + 1}\n`);
      }

      // Test creating a new customer
      console.log('Creating test customer...');
      const testCustomer = await User.create({
         name: 'Test Customer',
         email: `test-${Date.now()}@example.com`,
         phone: `+237${Math.floor(Math.random() * 100000000)}`,
         password: 'testpassword',
         role: 'customer',
      });

      console.log('✅ Test customer created successfully!');
      console.log(`Customer ID: ${testCustomer.customerId}`);
      console.log(`Name: ${testCustomer.name}`);
      console.log(`Email: ${testCustomer.email}\n`);

      // Check updated counter
      const updatedCounter = await Counter.findOne({ name: 'customerId' });
      console.log(`Updated counter value: ${updatedCounter.value}`);
      console.log(`Next customer ID will be: PL${updatedCounter.value + 1}\n`);

      // Clean up test customer
      await User.findByIdAndDelete(testCustomer._id);
      console.log('🗑️ Test customer cleaned up');

      // Reset counter to previous value
      await Counter.findOneAndUpdate(
         { name: 'customerId' },
         { value: counter.value }
      );
      console.log('🔄 Counter reset to original value');

      console.log('\n✅ Customer ID generation test completed successfully!');
   } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
   }
};

module.exports = { testCustomerIdGeneration };

// If running this script directly
if (require.main === module) {
   require('dotenv').config();
   mongoose
      .connect(
         process.env.MONGODB_URI || 'mongodb://localhost:27017/laundry_app',
         {
            useNewUrlParser: true,
            useUnifiedTopology: true,
         }
      )
      .then(async () => {
         console.log('Connected to MongoDB');
         await testCustomerIdGeneration();
         process.exit(0);
      })
      .catch((error) => {
         console.error('Database connection failed:', error);
         process.exit(1);
      });
}
