const Reward = require('../models/Reward');
const Order = require('../models/Order');

class RewardService {
   /**
    * Track an order for reward calculation
    * @param {ObjectId} customerId - The customer ID
    * @param {ObjectId} orderId - The order ID
    * @param {Number} orderAmount - The order total amount
    */
   static async trackOrder(customerId, orderId, orderAmount) {
      try {
         // Get or create reward record for customer
         const reward = await Reward.getOrCreateForCustomer(customerId);

         // Add the order to the current cycle
         reward.addOrder(orderId, orderAmount);

         // Save the updated reward record
         await reward.save();

         console.log(
            `Order ${orderId} tracked for customer ${customerId}. Current cycle: ${reward.currentCycleOrders.length}/10 orders`
         );

         return {
            success: true,
            rewardStatus: reward.getRewardStatus(),
            message: `Order tracked. ${reward.currentCycleOrders.length}/10 orders in current cycle.`,
         };
      } catch (error) {
         console.error('Error tracking order for rewards:', error);
         throw new Error(`Failed to track order for rewards: ${error.message}`);
      }
   }

   /**
    * Calculate and apply reward discount to an order
    * @param {ObjectId} customerId - The customer ID
    * @param {ObjectId} orderId - The order ID for the 11th order
    * @param {Number} originalTotal - The original order total
    */
   static async applyRewardDiscount(customerId, orderId, originalTotal) {
      try {
         // Get the customer's reward record
         const reward = await Reward.findOne({ customerId });

         if (!reward) {
            return {
               success: false,
               discountApplied: 0,
               message: 'No reward record found for customer',
            };
         }

         if (!reward.isEligibleForDiscount) {
            return {
               success: false,
               discountApplied: 0,
               message: 'Customer is not eligible for discount',
            };
         }

         // Calculate the discount amount
         const discountAmount = reward.nextDiscountAmount;
         const finalTotal = Math.max(0, originalTotal - discountAmount);

         // Apply the discount and complete the cycle
         const result = reward.applyDiscount(orderId);
         await reward.save();

         // Update the order with reward information
         await Order.findByIdAndUpdate(orderId, {
            originalTotal: originalTotal,
            rewardDiscount: discountAmount,
            total: finalTotal,
            isRewardOrder: true,
         });

         console.log(
            `Reward discount of ${discountAmount} applied to order ${orderId} for customer ${customerId}`
         );

         return {
            success: true,
            discountApplied: discountAmount,
            originalTotal: originalTotal,
            finalTotal: finalTotal,
            cycleCompleted: result.cycleCompleted,
            message: `Reward discount of ${discountAmount} applied! Cycle completed.`,
         };
      } catch (error) {
         console.error('Error applying reward discount:', error);
         throw new Error(`Failed to apply reward discount: ${error.message}`);
      }
   }

   /**
    * Get customer's current reward status
    * @param {ObjectId} customerId - The customer ID
    */
   static async getCustomerRewardStatus(customerId) {
      try {
         const reward = await Reward.findOne({ customerId });

         if (!reward) {
            return {
               success: true,
               rewardStatus: {
                  customerId,
                  currentCycleOrderCount: 0,
                  ordersUntilDiscount: 10,
                  isEligibleForDiscount: false,
                  nextDiscountAmount: 0,
                  totalOrdersCount: 0,
                  completedCycles: 0,
                  totalRewardsEarned: 0,
                  currentCycleTotal: 0,
               },
            };
         }

         return {
            success: true,
            rewardStatus: reward.getRewardStatus(),
         };
      } catch (error) {
         console.error('Error getting customer reward status:', error);
         throw new Error(`Failed to get reward status: ${error.message}`);
      }
   }

   /**
    * Get detailed reward history for a customer
    * @param {ObjectId} customerId - The customer ID
    */
   static async getCustomerRewardHistory(customerId) {
      try {
         const reward = await Reward.findOne({ customerId })
            .populate('currentCycleOrders.orderId')
            .populate('completedCycles.orderIds')
            .populate('completedCycles.discountOrderId');

         if (!reward) {
            return {
               success: true,
               rewardHistory: {
                  customerId,
                  currentCycle: [],
                  completedCycles: [],
                  summary: {
                     totalOrdersCount: 0,
                     totalRewardsEarned: 0,
                     completedCyclesCount: 0,
                  },
               },
            };
         }

         return {
            success: true,
            rewardHistory: {
               customerId: reward.customerId,
               currentCycle: reward.currentCycleOrders,
               completedCycles: reward.completedCycles,
               summary: {
                  totalOrdersCount: reward.totalOrdersCount,
                  totalRewardsEarned: reward.totalRewardsEarned,
                  completedCyclesCount: reward.completedCycles.length,
               },
            },
         };
      } catch (error) {
         console.error('Error getting customer reward history:', error);
         throw new Error(`Failed to get reward history: ${error.message}`);
      }
   }

   /**
    * Check if customer should receive discount on new order
    * @param {ObjectId} customerId - The customer ID
    */
   static async checkDiscountEligibility(customerId) {
      try {
         const reward = await Reward.findOne({ customerId });

         if (!reward) {
            return {
               isEligible: false,
               discountAmount: 0,
               message: 'No reward record found',
            };
         }

         return {
            isEligible: reward.isEligibleForDiscount,
            discountAmount: reward.nextDiscountAmount,
            ordersInCurrentCycle: reward.currentCycleOrders.length,
            message: reward.isEligibleForDiscount
               ? `Customer is eligible for discount of ${reward.nextDiscountAmount}`
               : `Customer needs ${
                    10 - reward.currentCycleOrders.length
                 } more orders for discount`,
         };
      } catch (error) {
         console.error('Error checking discount eligibility:', error);
         throw new Error(
            `Failed to check discount eligibility: ${error.message}`
         );
      }
   }
}

module.exports = RewardService;
