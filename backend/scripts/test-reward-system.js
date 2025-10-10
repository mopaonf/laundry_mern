const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const Reward = require('../models/Reward');
const RewardService = require('../services/rewardService');

// Test configuration
const TEST_CONFIG = {
   customerName: 'Test Reward Customer',
   customerPhone: '+237600000000',
   customerPassword: 'password123',
   orderAmounts: [1000, 1500, 2000, 1200, 1800, 2500, 1300, 1700, 2200, 1600], // 10 orders
   eleventhOrderAmount: 3000,
};

async function connectDB() {
   try {
      await mongoose.connect(
         process.env.MONGODB_URI || 'mongodb://localhost:27017/laundry_app'
      );
      console.log('✅ Connected to MongoDB');
   } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
   }
}

async function createTestCustomer() {
   try {
      // Check if test customer already exists
      let customer = await User.findOne({ phone: TEST_CONFIG.customerPhone });

      if (customer) {
         console.log('📱 Test customer already exists:', customer.name);
         return customer;
      }

      // Create new test customer
      customer = await User.create({
         name: TEST_CONFIG.customerName,
         phone: TEST_CONFIG.customerPhone,
         password: TEST_CONFIG.customerPassword,
         role: 'customer',
      });

      console.log(
         '👤 Created test customer:',
         customer.name,
         'ID:',
         customer._id
      );
      return customer;
   } catch (error) {
      console.error('❌ Error creating test customer:', error);
      throw error;
   }
}

async function createTestOrders(customerId) {
   try {
      const orders = [];

      console.log('\n🛒 Creating 10 test orders...');

      for (let i = 0; i < TEST_CONFIG.orderAmounts.length; i++) {
         const amount = TEST_CONFIG.orderAmounts[i];

         const order = await Order.create({
            customerId: customerId,
            items: [
               {
                  itemId: new mongoose.Types.ObjectId(),
                  name: `Test Item ${i + 1}`,
                  price: amount,
                  quantity: 1,
               },
            ],
            pickupDate: new Date(),
            notes: `Test order ${i + 1} for reward system`,
            total: amount,
            pickupLocation: {
               address: 'Test Pickup Address',
               coordinates: { latitude: 3.848, longitude: 11.5021 },
            },
            dropoffLocation: {
               address: 'Test Dropoff Address',
               coordinates: { latitude: 3.848, longitude: 11.5021 },
            },
         });

         // Track the order for rewards
         await RewardService.trackOrder(customerId, order._id, amount);

         orders.push(order);
         console.log(
            `   Order ${i + 1}: ${amount} FCFA - Order ID: ${order._id}`
         );
      }

      return orders;
   } catch (error) {
      console.error('❌ Error creating test orders:', error);
      throw error;
   }
}

async function create11thOrder(customerId) {
   try {
      console.log('\n🎁 Creating 11th order (should get discount)...');

      const amount = TEST_CONFIG.eleventhOrderAmount;

      // Check discount eligibility before creating order
      const eligibility = await RewardService.checkDiscountEligibility(
         customerId
      );
      console.log('💰 Discount eligibility:', eligibility);

      if (!eligibility.isEligible) {
         throw new Error(
            'Customer should be eligible for discount at this point'
         );
      }

      const discountAmount = eligibility.discountAmount;
      const finalAmount = Math.max(0, amount - discountAmount);

      const order = await Order.create({
         customerId: customerId,
         items: [
            {
               itemId: new mongoose.Types.ObjectId(),
               name: 'Test Item 11 (Reward Order)',
               price: amount,
               quantity: 1,
            },
         ],
         pickupDate: new Date(),
         notes: 'Test order 11 - should receive reward discount',
         total: finalAmount,
         originalTotal: amount,
         rewardDiscount: discountAmount,
         isRewardOrder: true,
         pickupLocation: {
            address: 'Test Pickup Address',
            coordinates: { latitude: 3.848, longitude: 11.5021 },
         },
         dropoffLocation: {
            address: 'Test Dropoff Address',
            coordinates: { latitude: 3.848, longitude: 11.5021 },
         },
      });

      // Apply the reward discount
      await RewardService.applyRewardDiscount(customerId, order._id, amount);

      console.log(
         `   Order 11: ${amount} FCFA (Original) - ${discountAmount} FCFA (Discount) = ${finalAmount} FCFA (Final)`
      );
      console.log(`   Order ID: ${order._id}`);

      return order;
   } catch (error) {
      console.error('❌ Error creating 11th order:', error);
      throw error;
   }
}

async function displayRewardStatus(customerId) {
   try {
      console.log('\n📊 Final Reward Status:');

      const statusResult = await RewardService.getCustomerRewardStatus(
         customerId
      );
      const status = statusResult.rewardStatus;

      console.log(`   Customer ID: ${status.customerId}`);
      console.log(`   Total Orders: ${status.totalOrdersCount}`);
      console.log(
         `   Current Cycle Orders: ${status.currentCycleOrderCount}/10`
      );
      console.log(
         `   Orders Until Next Discount: ${status.ordersUntilDiscount}`
      );
      console.log(`   Eligible for Discount: ${status.isEligibleForDiscount}`);
      console.log(`   Next Discount Amount: ${status.nextDiscountAmount} FCFA`);
      console.log(`   Completed Cycles: ${status.completedCycles}`);
      console.log(`   Total Rewards Earned: ${status.totalRewardsEarned} FCFA`);
      console.log(`   Current Cycle Total: ${status.currentCycleTotal} FCFA`);

      // Get detailed history
      const historyResult = await RewardService.getCustomerRewardHistory(
         customerId
      );
      const history = historyResult.rewardHistory;

      console.log('\n📈 Reward History:');
      console.log(`   Completed Cycles: ${history.completedCycles.length}`);

      history.completedCycles.forEach((cycle, index) => {
         console.log(`   Cycle ${index + 1}:`);
         console.log(`     - Orders: ${cycle.orderIds.length}`);
         console.log(`     - Total Amount: ${cycle.totalAmount} FCFA`);
         console.log(`     - Average: ${cycle.averageAmount} FCFA`);
         console.log(`     - Discount Applied: ${cycle.discountApplied} FCFA`);
         console.log(
            `     - Completed: ${new Date(cycle.completedAt).toLocaleString()}`
         );
      });
   } catch (error) {
      console.error('❌ Error displaying reward status:', error);
      throw error;
   }
}

async function cleanupTestData() {
   try {
      console.log('\n🧹 Cleaning up test data...');

      // Find test customer
      const customer = await User.findOne({ phone: TEST_CONFIG.customerPhone });
      if (customer) {
         // Delete orders
         await Order.deleteMany({ customerId: customer._id });
         console.log('   ✅ Deleted test orders');

         // Delete reward record
         await Reward.deleteOne({ customerId: customer._id });
         console.log('   ✅ Deleted reward record');

         // Delete customer
         await User.deleteOne({ _id: customer._id });
         console.log('   ✅ Deleted test customer');
      }
   } catch (error) {
      console.error('❌ Error cleaning up test data:', error);
   }
}

async function runRewardSystemTest() {
   try {
      console.log('🚀 Starting Reward System Test\n');

      // Connect to database
      await connectDB();

      // Clean up any existing test data
      await cleanupTestData();

      // Create test customer
      const customer = await createTestCustomer();

      // Create 10 orders
      const orders = await createTestOrders(customer._id);

      // Check reward status after 10 orders
      console.log('\n📋 Reward status after 10 orders:');
      const midStatus = await RewardService.getCustomerRewardStatus(
         customer._id
      );
      console.log(
         `   Eligible for discount: ${midStatus.rewardStatus.isEligibleForDiscount}`
      );
      console.log(
         `   Next discount amount: ${midStatus.rewardStatus.nextDiscountAmount} FCFA`
      );

      // Create 11th order with discount
      const eleventhOrder = await create11thOrder(customer._id);

      // Display final status
      await displayRewardStatus(customer._id);

      console.log('\n✅ Reward System Test Completed Successfully!');

      // Calculate expected values for verification
      const totalFirst10 = TEST_CONFIG.orderAmounts.reduce(
         (sum, amount) => sum + amount,
         0
      );
      const expectedAverage = totalFirst10 / 10;
      console.log('\n🔍 Verification:');
      console.log(`   Total of first 10 orders: ${totalFirst10} FCFA`);
      console.log(`   Expected average: ${expectedAverage} FCFA`);
      console.log(
         `   11th order original: ${TEST_CONFIG.eleventhOrderAmount} FCFA`
      );
      console.log(
         `   Expected final amount: ${
            TEST_CONFIG.eleventhOrderAmount - expectedAverage
         } FCFA`
      );
   } catch (error) {
      console.error('❌ Test failed:', error);
   } finally {
      // Close database connection
      await mongoose.connection.close();
      console.log('\n📡 Database connection closed');
   }
}

// Run the test if this file is executed directly
if (require.main === module) {
   runRewardSystemTest();
}

module.exports = {
   runRewardSystemTest,
   cleanupTestData,
   TEST_CONFIG,
};
