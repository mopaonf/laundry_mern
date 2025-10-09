const Order = require('../models/Order');
const User = require('../models/User');
const campayService = require('../services/campayService');
const { createTransactionForOrder } = require('./transaction.util');

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private (Customer/Receptionist/Admin)
 */
exports.createOrder = async (req, res) => {
   try {
      const {
         items,
         pickupDate,
         notes,
         total,
         payWithMobile,
         phoneNumber,
         pickupLocation,
         dropoffLocation,
      } = req.body;
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

      // Validate required location data
      if (
         !pickupLocation ||
         !pickupLocation.address ||
         !pickupLocation.coordinates
      ) {
         return res.status(400).json({
            success: false,
            message: 'Pickup location with address and coordinates is required',
         });
      }

      if (
         !dropoffLocation ||
         !dropoffLocation.address ||
         !dropoffLocation.coordinates
      ) {
         return res.status(400).json({
            success: false,
            message:
               'Dropoff location with address and coordinates is required',
         });
      }

      // Validate coordinates
      const validateCoordinates = (coords, locationType) => {
         if (!coords.latitude || !coords.longitude) {
            throw new Error(`${locationType} coordinates are incomplete`);
         }
         if (coords.latitude < -90 || coords.latitude > 90) {
            throw new Error(
               `${locationType} latitude must be between -90 and 90`
            );
         }
         if (coords.longitude < -180 || coords.longitude > 180) {
            throw new Error(
               `${locationType} longitude must be between -180 and 180`
            );
         }
      };

      validateCoordinates(pickupLocation.coordinates, 'Pickup');
      validateCoordinates(dropoffLocation.coordinates, 'Dropoff');

      // Validate each item has required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
         return res.status(400).json({
            success: false,
            message: 'Order must include at least one item',
         });
      } // Transform items to match our schema (handle both id and itemId formats)
      const transformedItems = items.map((item) => ({
         itemId: item.itemId || item.id, // Accept either itemId or id
         name: item.name,
         price: item.price,
         quantity: item.quantity,
      }));

      let paymentStatus = 'NOT_REQUIRED';
      let paymentReference = undefined;
      // If payment is requested, initiate Campay collection
      if (payWithMobile && phoneNumber) {
         try {
            const paymentResult = await campayService.collect(
               total,
               phoneNumber,
               'Laundry Order Payment'
            );
            paymentReference =
               paymentResult.reference || paymentResult.external_reference;
            paymentStatus = 'PENDING';
            // Create transaction record
            await createTransactionForOrder({
               userId: customerId,
               orderId: null, // Will update after order is created
               reference: paymentReference,
               amount: total,
               phoneNumber,
               status: 'PENDING',
               operator: paymentResult.operator,
               ussd_code: paymentResult.ussd_code,
               description: 'Laundry Order Payment',
            });
         } catch (err) {
            return res.status(500).json({
               success: false,
               message: 'Payment initiation failed',
               error: err.message,
            });
         }
      }

      // Create the order
      const order = await Order.create({
         customerId,
         items: transformedItems,
         pickupDate,
         notes,
         total,
         paymentStatus,
         paymentReference,
         pickupLocation: {
            address: pickupLocation.address,
            coordinates: {
               latitude: pickupLocation.coordinates.latitude,
               longitude: pickupLocation.coordinates.longitude,
            },
            placeId: pickupLocation.placeId,
            instructions: pickupLocation.instructions || '',
         },
         dropoffLocation: {
            address: dropoffLocation.address,
            coordinates: {
               latitude: dropoffLocation.coordinates.latitude,
               longitude: dropoffLocation.coordinates.longitude,
            },
            placeId: dropoffLocation.placeId,
            instructions: dropoffLocation.instructions || '',
         },
      });
      // If paymentReference exists, update transaction with orderId
      if (paymentReference) {
         const Transaction = require('../models/Transaction');
         await Transaction.findOneAndUpdate(
            { reference: paymentReference },
            { orderId: order._id }
         );
      }

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
         .populate('customerId', 'name customerId')
         .sort({ createdAt: -1 })
         .limit(5);

      // Transform recent orders for frontend
      const formattedRecentOrders = recentOrders.map((order) => ({
         id: order._id,
         customer: order.customerId?.name || 'Unknown Customer',
         customerId: order.customerId?.customerId || 'N/A',
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

/**
 * @desc    Mark order as picked up
 * @route   PUT /api/orders/:id/pickup
 * @access  Private (Receptionist/Admin/Runner)
 */
exports.markAsPickedUp = async (req, res) => {
   try {
      const { id } = req.params;
      const { runnerId, runnerLocation } = req.body;

      const order = await Order.findById(id);
      if (!order) {
         return res.status(404).json({
            success: false,
            message: 'Order not found',
         });
      }

      // Update order status and pickup information
      order.status = 'Picked Up';
      order.pickedUpAt = new Date();
      if (runnerId) {
         order.assignedRunner = runnerId;
      }
      if (runnerLocation) {
         order.runnerLocation = runnerLocation;
      }

      await order.save();

      res.status(200).json({
         success: true,
         message: 'Order marked as picked up',
         data: order,
      });
   } catch (error) {
      console.error('Error marking order as picked up:', error);
      res.status(500).json({
         success: false,
         message: 'Error updating order status',
         error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
};

/**
 * @desc    Mark order as delivered
 * @route   PUT /api/orders/:id/deliver
 * @access  Private (Receptionist/Admin/Runner)
 */
exports.markAsDelivered = async (req, res) => {
   try {
      const { id } = req.params;
      const { runnerLocation } = req.body;

      const order = await Order.findById(id);
      if (!order) {
         return res.status(404).json({
            success: false,
            message: 'Order not found',
         });
      }

      // Update order status and delivery information
      order.status = 'Delivered';
      order.deliveredAt = new Date();
      if (runnerLocation) {
         order.runnerLocation = runnerLocation;
      }

      await order.save();

      res.status(200).json({
         success: true,
         message: 'Order marked as delivered',
         data: order,
      });
   } catch (error) {
      console.error('Error marking order as delivered:', error);
      res.status(500).json({
         success: false,
         message: 'Error updating order status',
         error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
};

/**
 * @desc    Update runner location for real-time tracking
 * @route   PUT /api/orders/:id/runner-location
 * @access  Private (Runner)
 */
exports.updateRunnerLocation = async (req, res) => {
   try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;

      if (!latitude || !longitude) {
         return res.status(400).json({
            success: false,
            message: 'Latitude and longitude are required',
         });
      }

      const order = await Order.findById(id);
      if (!order) {
         return res.status(404).json({
            success: false,
            message: 'Order not found',
         });
      }

      // Update runner location
      order.runnerLocation = { latitude, longitude };
      await order.save();

      res.status(200).json({
         success: true,
         message: 'Runner location updated',
         data: {
            orderId: order._id,
            runnerLocation: order.runnerLocation,
         },
      });
   } catch (error) {
      console.error('Error updating runner location:', error);
      res.status(500).json({
         success: false,
         message: 'Error updating runner location',
         error:
            process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
   }
};
