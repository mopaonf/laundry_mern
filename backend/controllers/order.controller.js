const Order = require('../models/Order');
const User = require('../models/User');

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private (Customer/Receptionist/Admin)
 */
exports.createOrder = async (req, res) => {
   try {
      const { items, pickupDate, notes, total } = req.body;
      let customerId;

      // If the request is from a customer, use their own ID
      if (req.user.role === 'customer') {
         customerId = req.user._id;
      } else if (
         req.user.role === 'receptionist' ||
         req.user.role === 'admin'
      ) {
         // If from staff, use the provided customerId
         customerId = req.body.customerId;

         // Validate customer exists when staff is creating an order
         const customerExists = await User.findOne({
            _id: customerId,
            role: 'customer',
         });
         if (!customerExists) {
            return res.status(404).json({
               success: false,
               message: 'Customer not found',
            });
         }
      } else {
         return res.status(403).json({
            success: false,
            message: 'Not authorized to create orders',
         });
      }

      // Validate each item has required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
         return res.status(400).json({
            success: false,
            message: 'Order must include at least one item',
         });
      }

      // Transform items to match our schema (convert id to itemId)
      const transformedItems = items.map((item) => ({
         itemId: item.id,
         name: item.name,
         price: item.price,
         quantity: item.quantity,
      }));

      // Create the order
      const order = await Order.create({
         customerId,
         items: transformedItems,
         pickupDate,
         notes,
         total,
      });

      res.status(201).json({
         success: true,
         message: 'Order created successfully',
         data: order,
      });
   } catch (error) {
      console.error('Error creating order:', error);

      // Handle validation errors
      if (error.name === 'ValidationError') {
         return res.status(400).json({
            success: false,
            message: 'Validation error: Please check your data format',
            error:
               process.env.NODE_ENV === 'development'
                  ? error.message
                  : undefined,
         });
      }

      res.status(500).json({
         success: false,
         message: 'Error creating order',
         error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
};

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private (Receptionist/Admin)
 */
exports.getAllOrders = async (req, res) => {
   try {
      // Find all orders and populate customer information
      const orders = await Order.find()
         .populate('customerId', 'name email phone')
         .sort({ createdAt: -1 });

      res.status(200).json({
         success: true,
         count: orders.length,
         data: orders,
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: 'Error fetching orders',
         error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
};

/**
 * @desc    Get customer's own orders
 * @route   GET /api/orders/my-orders
 * @access  Private (Customer)
 */
exports.getMyOrders = async (req, res) => {
   try {
      // Find orders for the current customer
      const orders = await Order.find({ customerId: req.user._id }).sort({
         createdAt: -1,
      });

      res.status(200).json({
         success: true,
         count: orders.length,
         data: orders,
      });
   } catch (error) {
      res.status(500).json({
         success: false,
         message: 'Error fetching your orders',
         error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/orders/dashboard-stats
 * @access  Private (Receptionist/Admin)
 */
exports.getDashboardStats = async (req, res) => {
   try {
      // Get today's date range (start of day to end of day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get total orders today
      const totalOrdersToday = await Order.countDocuments({
         createdAt: { $gte: today, $lt: tomorrow },
      });

      // Get orders in progress count
      const ordersInProgress = await Order.countDocuments({
         status: 'In Progress',
      });

      // Get orders ready for pickup
      const ordersReadyForPickup = await Order.countDocuments({
         status: 'Ready for Pickup',
      });

      // Get earnings today (sum of total field for today's orders)
      const earningsResult = await Order.aggregate([
         {
            $match: {
               createdAt: { $gte: today, $lt: tomorrow },
            },
         },
         {
            $group: {
               _id: null,
               total: { $sum: '$total' },
            },
         },
      ]);

      const earningsToday =
         earningsResult.length > 0 ? earningsResult[0].total : 0;

      // Get recent orders (limit to 5 most recent)
      const recentOrders = await Order.find()
         .populate('customerId', 'name')
         .sort({ createdAt: -1 })
         .limit(5);

      // Transform recent orders for frontend
      const formattedRecentOrders = recentOrders.map((order) => ({
         id: order._id,
         customer: order.customerId?.name || 'Unknown Customer',
         status: order.status,
         date: new Date(order.createdAt).toISOString().split('T')[0],
         total: `${order.total.toLocaleString()} FCFA`,
      }));

      res.status(200).json({
         success: true,
         data: {
            totalOrdersToday,
            ordersInProgress,
            ordersReadyForPickup,
            earningsToday,
            recentOrders: formattedRecentOrders,
         },
      });
   } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({
         success: false,
         message: 'Error fetching dashboard statistics',
         error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
};
