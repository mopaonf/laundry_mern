const mongoose = require('mongoose');

const rewardCycleSchema = new mongoose.Schema({
   orderIds: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Order',
         required: true,
      },
   ],
   totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
   },
   averageAmount: {
      type: Number,
      required: true,
      min: [0, 'Average amount cannot be negative'],
   },
   discountApplied: {
      type: Number,
      required: true,
      min: [0, 'Discount cannot be negative'],
   },
   discountOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
   },
   completedAt: {
      type: Date,
      default: Date.now,
   },
});

const rewardSchema = new mongoose.Schema({
   customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
   },
   currentCycleOrders: [
      {
         orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
         },
         amount: {
            type: Number,
            required: true,
            min: [0, 'Order amount cannot be negative'],
         },
         createdAt: {
            type: Date,
            default: Date.now,
         },
      },
   ],
   totalOrdersCount: {
      type: Number,
      default: 0,
      min: [0, 'Order count cannot be negative'],
   },
   completedCycles: [rewardCycleSchema],
   isEligibleForDiscount: {
      type: Boolean,
      default: false,
   },
   nextDiscountAmount: {
      type: Number,
      default: 0,
      min: [0, 'Discount amount cannot be negative'],
   },
   totalRewardsEarned: {
      type: Number,
      default: 0,
      min: [0, 'Total rewards cannot be negative'],
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
   updatedAt: {
      type: Date,
      default: Date.now,
   },
});

// Update the updatedAt field before saving
rewardSchema.pre('save', function (next) {
   this.updatedAt = Date.now();
   next();
});

// Static method to get or create reward record for a customer
rewardSchema.statics.getOrCreateForCustomer = async function (customerId) {
   let reward = await this.findOne({ customerId });
   if (!reward) {
      reward = new this({ customerId });
      await reward.save();
   }
   return reward;
};

// Method to add an order to the current cycle
rewardSchema.methods.addOrder = function (orderId, amount) {
   this.currentCycleOrders.push({
      orderId,
      amount,
      createdAt: new Date(),
   });
   this.totalOrdersCount += 1;

   // Check if we've reached 10 orders
   if (this.currentCycleOrders.length === 10) {
      this.calculateDiscount();
   }
};

// Method to calculate discount after 10 orders
rewardSchema.methods.calculateDiscount = function () {
   if (this.currentCycleOrders.length !== 10) {
      throw new Error(
         'Cannot calculate discount: cycle must have exactly 10 orders'
      );
   }

   const totalAmount = this.currentCycleOrders.reduce(
      (sum, order) => sum + order.amount,
      0
   );
   const averageAmount = totalAmount / 10;

   this.isEligibleForDiscount = true;
   this.nextDiscountAmount = Math.round(averageAmount * 100) / 100; // Round to 2 decimal places

   return {
      totalAmount,
      averageAmount: this.nextDiscountAmount,
      discountAmount: this.nextDiscountAmount,
   };
};

// Method to apply discount and complete the cycle
rewardSchema.methods.applyDiscount = function (discountOrderId) {
   if (!this.isEligibleForDiscount) {
      throw new Error('Customer is not eligible for discount');
   }

   const totalAmount = this.currentCycleOrders.reduce(
      (sum, order) => sum + order.amount,
      0
   );
   const averageAmount = this.nextDiscountAmount;

   // Create completed cycle record
   const completedCycle = {
      orderIds: this.currentCycleOrders.map((order) => order.orderId),
      totalAmount,
      averageAmount,
      discountApplied: this.nextDiscountAmount,
      discountOrderId,
      completedAt: new Date(),
   };

   this.completedCycles.push(completedCycle);
   this.totalRewardsEarned += this.nextDiscountAmount;

   // Reset for next cycle
   this.currentCycleOrders = [];
   this.isEligibleForDiscount = false;
   this.nextDiscountAmount = 0;

   return {
      discountApplied: completedCycle.discountApplied,
      cycleCompleted: completedCycle,
   };
};

// Method to get customer's reward status
rewardSchema.methods.getRewardStatus = function () {
   return {
      customerId: this.customerId,
      currentCycleOrderCount: this.currentCycleOrders.length,
      ordersUntilDiscount: Math.max(0, 10 - this.currentCycleOrders.length),
      isEligibleForDiscount: this.isEligibleForDiscount,
      nextDiscountAmount: this.nextDiscountAmount,
      totalOrdersCount: this.totalOrdersCount,
      completedCycles: this.completedCycles.length,
      totalRewardsEarned: this.totalRewardsEarned,
      currentCycleTotal: this.currentCycleOrders.reduce(
         (sum, order) => sum + order.amount,
         0
      ),
   };
};

const Reward = mongoose.model('Reward', rewardSchema);

module.exports = Reward;
