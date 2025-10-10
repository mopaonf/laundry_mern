# Laundry App Reward System

## Overview

The reward system automatically tracks customer orders and applies discounts based on their order history. When a customer reaches their 10th order, they automatically receive a discount on their 11th order equal to the average amount of their previous 10 orders.

## How It Works

### 1. Order Tracking

-  Every order is automatically tracked for reward calculation
-  The system uses the original order total (before any discounts) for calculations
-  Orders are grouped into cycles of 10

### 2. Discount Calculation

-  After 10 orders, the system calculates:
   -  Total sum of all 10 orders
   -  Average amount of those 10 orders
-  The average becomes the discount amount for the 11th order

### 3. Discount Application

-  On the 11th order, the discount is automatically applied
-  The final total = original total - discount amount (minimum 0)
-  The cycle resets and counting starts over

### 4. Cycle Management

-  Each completed cycle is stored in the reward history
-  Customer can have multiple completed cycles
-  Current cycle tracks orders 1-10, then resets after discount application

## Database Schema

### Reward Model (`models/Reward.js`)

```javascript
{
  customerId: ObjectId,              // Reference to User
  currentCycleOrders: [{             // Orders in current cycle (max 10)
    orderId: ObjectId,
    amount: Number,
    createdAt: Date
  }],
  totalOrdersCount: Number,          // Total orders across all time
  completedCycles: [{                // History of completed cycles
    orderIds: [ObjectId],            // IDs of the 10 orders
    totalAmount: Number,             // Sum of 10 orders
    averageAmount: Number,           // Average of 10 orders
    discountApplied: Number,         // Discount given (equals average)
    discountOrderId: ObjectId,       // ID of order that received discount
    completedAt: Date
  }],
  isEligibleForDiscount: Boolean,    // True after 10th order
  nextDiscountAmount: Number,        // Amount of next discount
  totalRewardsEarned: Number,        // Total discounts earned
  createdAt: Date,
  updatedAt: Date
}
```

### Updated Order Model (`models/Order.js`)

Added reward-related fields:

```javascript
{
  // ... existing fields ...
  rewardDiscount: Number,            // Discount applied (0 if none)
  originalTotal: Number,             // Total before discount
  isRewardOrder: Boolean             // True if discount was applied
}
```

## API Endpoints

### Get Reward Status

```
GET /api/orders/reward-status
```

Returns current reward status for the authenticated customer.

**Response:**

```json
{
   "success": true,
   "data": {
      "customerId": "customer_id",
      "currentCycleOrderCount": 7,
      "ordersUntilDiscount": 3,
      "isEligibleForDiscount": false,
      "nextDiscountAmount": 0,
      "totalOrdersCount": 23,
      "completedCycles": 2,
      "totalRewardsEarned": 3200,
      "currentCycleTotal": 12500
   }
}
```

### Get Reward History

```
GET /api/orders/reward-history
```

Returns detailed reward history including all completed cycles.

**Response:**

```json
{
  "success": true,
  "data": {
    "customerId": "customer_id",
    "currentCycle": [
      {
        "orderId": "order_id",
        "amount": 1500,
        "createdAt": "2024-01-01T10:00:00Z"
      }
    ],
    "completedCycles": [
      {
        "orderIds": ["order1", "order2", ...],
        "totalAmount": 15000,
        "averageAmount": 1500,
        "discountApplied": 1500,
        "discountOrderId": "order11",
        "completedAt": "2024-01-01T12:00:00Z"
      }
    ],
    "summary": {
      "totalOrdersCount": 23,
      "totalRewardsEarned": 3200,
      "completedCyclesCount": 2
    }
  }
}
```

### Staff Access

Staff members (receptionists/admins) can check any customer's reward status by providing `customerId` as a query parameter:

```
GET /api/orders/reward-status?customerId=customer_id
GET /api/orders/reward-history?customerId=customer_id
```

## Service Layer

### RewardService (`services/rewardService.js`)

#### Main Methods:

1. **`trackOrder(customerId, orderId, orderAmount)`**

   -  Adds order to current cycle
   -  Increments total order count
   -  Calculates discount when 10th order is reached

2. **`applyRewardDiscount(customerId, orderId, originalTotal)`**

   -  Applies discount to 11th order
   -  Completes current cycle
   -  Resets for next cycle

3. **`getCustomerRewardStatus(customerId)`**

   -  Returns current reward status
   -  Shows progress toward next discount

4. **`getCustomerRewardHistory(customerId)`**

   -  Returns complete reward history
   -  Includes all completed cycles

5. **`checkDiscountEligibility(customerId)`**
   -  Checks if customer is eligible for discount
   -  Returns discount amount if eligible

## Integration with Order Creation

The reward system is automatically integrated into the order creation process:

1. **Before Order Creation:**

   -  Check if customer is eligible for discount
   -  Calculate discount amount if eligible

2. **Order Creation:**

   -  Apply discount to order total
   -  Set reward-related fields on order

3. **After Order Creation:**
   -  Track order for rewards (if not a discount order)
   -  Apply discount and complete cycle (if discount order)
   -  Update reward status

## Example Usage

### Creating Orders with Automatic Reward Tracking

```javascript
// Order creation automatically handles rewards
const orderResponse = await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    items: [...],
    total: 2000,
    // ... other order fields
  })
});

const result = await orderResponse.json();

// Response includes reward information
console.log(result.rewardInfo);
// {
//   discountApplied: 1500,
//   originalTotal: 2000,
//   finalTotal: 500,
//   isRewardOrder: true,
//   rewardStatus: { ... }
// }
```

### Checking Reward Status

```javascript
const statusResponse = await fetch('/api/orders/reward-status', {
   headers: {
      Authorization: `Bearer ${token}`,
   },
});

const status = await statusResponse.json();
console.log(`${status.data.ordersUntilDiscount} orders until next discount`);
```

## Testing

### Automated Test Script

Run the comprehensive test script to verify the reward system:

```bash
cd backend
node scripts/test-reward-system.js
```

The test script:

1. Creates a test customer
2. Creates 10 orders with different amounts
3. Creates an 11th order that receives the discount
4. Verifies all calculations
5. Displays complete reward history
6. Cleans up test data

### Manual Testing

1. Create a customer account
2. Place 10 orders with various amounts
3. Check reward status after 10th order (should be eligible)
4. Place 11th order (should automatically receive discount)
5. Verify discount amount equals average of first 10 orders
6. Continue placing orders to test cycle reset

## Example Calculation

**Orders 1-10:**

-  Order amounts: [1000, 1500, 2000, 1200, 1800, 2500, 1300, 1700, 2200, 1600]
-  Total: 16,800 FCFA
-  Average: 1,680 FCFA

**Order 11:**

-  Original amount: 3000 FCFA
-  Discount applied: 1,680 FCFA
-  Final amount: 1,320 FCFA

**Result:**

-  Customer saves 1,680 FCFA
-  Cycle resets, counting starts over for next 10 orders

## Error Handling

The reward system includes comprehensive error handling:

-  Order creation continues even if reward processing fails
-  Detailed logging for debugging
-  Graceful degradation if reward service is unavailable
-  Validation to prevent negative discounts or totals

## Performance Considerations

-  Reward calculations are performed asynchronously during order creation
-  Database indexes on `customerId` for efficient reward lookups
-  Minimal impact on order creation performance
-  Batch operations for handling multiple orders

## Future Enhancements

Potential improvements to consider:

1. Configurable reward thresholds (instead of fixed 10 orders)
2. Different reward tiers based on customer loyalty
3. Time-based rewards (monthly/quarterly bonuses)
4. Referral rewards
5. Special promotional multipliers
6. Export reward reports for business analytics
