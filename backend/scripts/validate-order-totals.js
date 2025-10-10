// Script to test order total calculations and fix any inconsistencies

const mongoose = require('mongoose');
const Order = require('../models/Order');

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

async function validateAndFixOrderTotals() {
   try {
      console.log('🔍 Finding orders with potential calculation issues...');

      // Find all orders
      const orders = await Order.find({}).sort({ createdAt: -1 });

      console.log(`📋 Found ${orders.length} orders to check`);

      let fixedCount = 0;

      for (const order of orders) {
         // Calculate what the total should be based on items
         const calculatedTotal = order.items.reduce((sum, item) => {
            return sum + item.price * item.quantity;
         }, 0);

         let shouldBeTotal = calculatedTotal;

         // If it's a reward order, subtract the discount
         if (order.isRewardOrder && order.rewardDiscount) {
            shouldBeTotal = Math.max(0, calculatedTotal - order.rewardDiscount);
         }

         // Check if there's a mismatch
         if (Math.abs(order.total - shouldBeTotal) > 1) {
            // Allow 1 FCFA tolerance
            console.log(`❌ Order ${order._id} has incorrect total:`);
            console.log(`   Current total: ${order.total} FCFA`);
            console.log(`   Should be: ${shouldBeTotal} FCFA`);
            console.log(`   Items total: ${calculatedTotal} FCFA`);
            console.log(
               `   Reward discount: ${order.rewardDiscount || 0} FCFA`
            );
            console.log(
               `   Original total: ${order.originalTotal || 'N/A'} FCFA`
            );

            // Fix the order
            const updateData = {
               total: shouldBeTotal,
            };

            // If it's a reward order, ensure originalTotal is set correctly
            if (order.isRewardOrder && !order.originalTotal) {
               updateData.originalTotal = calculatedTotal;
            }

            await Order.findByIdAndUpdate(order._id, updateData);
            console.log(`   ✅ Fixed order ${order._id}`);
            fixedCount++;
         } else {
            console.log(
               `✅ Order ${order._id} has correct total: ${order.total} FCFA`
            );
         }
      }

      console.log(`\n📊 Summary:`);
      console.log(`   Total orders checked: ${orders.length}`);
      console.log(`   Orders fixed: ${fixedCount}`);
      console.log(`   Orders already correct: ${orders.length - fixedCount}`);
   } catch (error) {
      console.error('❌ Error validating orders:', error);
   }
}

async function runValidation() {
   try {
      console.log('🚀 Starting Order Validation\n');

      await connectDB();
      await validateAndFixOrderTotals();

      console.log('\n✅ Validation completed!');
   } catch (error) {
      console.error('❌ Validation failed:', error);
   } finally {
      await mongoose.connection.close();
      console.log('\n📡 Database connection closed');
   }
}

// Run if this file is executed directly
if (require.main === module) {
   runValidation();
}

module.exports = { runValidation };
