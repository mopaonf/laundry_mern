const mongoose = require('mongoose');
const User = require('../models/User');
const Counter = require('../models/Counter');
const { initializeCustomerCounter } = require('../utils/customerIdGenerator');

/**
 * Migration script to assign customer IDs to existing customers
 * This should be run once after deploying the customer ID feature
 */
const migrateExistingCustomers = async () => {
   try {
      console.log('Starting migration of existing customers...');

      // Initialize the counter (starting from 23 as mentioned)
      await initializeCustomerCounter(0); // Start from 0, will increment to 1 for first customer

      // Find all customers without customerId, sorted by creation date
      const customersWithoutId = await User.find({
         role: 'customer',
         customerId: { $exists: false },
      }).sort({ createdAt: 1 });

      console.log(
         `Found ${customersWithoutId.length} customers without customer IDs`
      );

      let assignedCount = 0;
      for (const customer of customersWithoutId) {
         try {
            // Get next customer ID number
            const counter = await Counter.findOneAndUpdate(
               { name: 'customerId' },
               { $inc: { value: 1 } },
               { new: true, upsert: true }
            );

            const customerId = `PL${counter.value}`;

            // Update the customer
            await User.findByIdAndUpdate(
               customer._id,
               { customerId: customerId },
               { new: true }
            );

            assignedCount++;
            console.log(
               `Assigned ${customerId} to customer: ${customer.name} (${customer.email})`
            );
         } catch (error) {
            console.error(
               `Failed to assign ID to customer ${customer._id}:`,
               error.message
            );
         }
      }

      console.log(
         `Migration completed. Assigned customer IDs to ${assignedCount} customers.`
      );

      // Display current counter value
      const finalCounter = await Counter.findOne({ name: 'customerId' });
      console.log(`Next customer ID will be: PL${finalCounter.value + 1}`);
   } catch (error) {
      console.error('Migration failed:', error);
      throw error;
   }
};

/**
 * Verify migration results
 */
const verifyMigration = async () => {
   try {
      const totalCustomers = await User.countDocuments({ role: 'customer' });
      const customersWithId = await User.countDocuments({
         role: 'customer',
         customerId: { $exists: true, $ne: null },
      });
      const customersWithoutId = await User.countDocuments({
         role: 'customer',
         customerId: { $exists: false },
      });

      console.log('=== Migration Verification ===');
      console.log(`Total customers: ${totalCustomers}`);
      console.log(`Customers with ID: ${customersWithId}`);
      console.log(`Customers without ID: ${customersWithoutId}`);

      if (customersWithoutId === 0) {
         console.log('✅ All customers have been assigned customer IDs');
      } else {
         console.log('❌ Some customers are still missing customer IDs');
      }

      // Show some examples
      const sampleCustomers = await User.find({
         role: 'customer',
         customerId: { $exists: true },
      })
         .limit(5)
         .select('name email customerId createdAt');

      console.log('\n=== Sample Customer IDs ===');
      sampleCustomers.forEach((customer) => {
         console.log(
            `${customer.customerId}: ${customer.name} (${customer.email})`
         );
      });
   } catch (error) {
      console.error('Verification failed:', error);
   }
};

module.exports = {
   migrateExistingCustomers,
   verifyMigration,
};

// If running this script directly
if (require.main === module) {
   // Connect to database
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
         await migrateExistingCustomers();
         await verifyMigration();
         process.exit(0);
      })
      .catch((error) => {
         console.error('Database connection failed:', error);
         process.exit(1);
      });
}
