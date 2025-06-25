const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const customerRoutes = require('./routes/customer.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const orderRoutes = require('./routes/order.routes');
const paymentRoutes = require('./routes/payment.routes');
const transactionRoutes = require('./routes/transaction.routes');
const paymentSyncRoutes = require('./routes/payment-sync.routes');

// Initialize Express app
const app = express();

// Middleware (MUST come before routes)
app.use(express.json());
app.use(cors());

// Connect to database
connectDB();

// Try a different port since 5000 is already in use
const PORT = process.env.PORT || 5000;

// Debug route to test basic Express functionality
app.get('/debug', (req, res) => {
   res.json({
      message: 'Debug endpoint working',
      timestamp: new Date().toISOString(),
   });
});

// Routes
app.get('/', (req, res) => {
   res.send('Laundry backend is running');
});

// Health check endpoint for API connectivity testing
app.get('/health', (req, res) => {
   res.status(200).json({
      status: 'ok',
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
   });
});

// Log routes for debugging
console.log('Mounting API routes...');
console.log('Auth routes path:', '/api/auth');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payment-sync', paymentSyncRoutes);

// Route not found handler - make sure this comes AFTER your routes
app.use((req, res, next) => {
   console.log(`Route not found: ${req.method} ${req.originalUrl}`);
   res.status(404).json({
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      availableEndpoints: [
         'GET /',
         'GET /health',
         'GET /debug',
         'POST /api/auth/login',
         'POST /api/auth/register',
         // Add other important routes here
      ],
   });
});

// Error handling middleware
app.use((err, req, res, next) => {
   console.error('Error caught by middleware:', err.stack);
   res.status(500).json({
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
   });
});

// Start server
const server = app.listen(PORT, () => {
   const serverUrl = `http://localhost:${PORT}`;
   console.log(`Server is running on ${serverUrl}`);
   console.log(`Try the debug endpoint at ${serverUrl}/debug`);
   console.log(`Try the health check at ${serverUrl}/health`);
   console.log(`Try the login endpoint at ${serverUrl}/api/auth/login (POST)`);

   // Print a simpler list of routes for debugging
   console.log('\nRegistered Routes:');
   console.log('- GET /');
   console.log('- GET /debug');
   console.log('- GET /health');
   console.log('- Routes under /api/auth');
   console.log('- Routes under /api/customers');
   console.log('- Routes under /api/inventory');
   console.log('- Routes under /api/orders');
   console.log('- Routes under /api/payment');
   console.log('- Routes under /api/transactions');
   console.log('- Routes under /api/payment-sync');
});

// Handle server errors
server.on('error', (error) => {
   if (error.code === 'EADDRINUSE') {
      console.error(
         `Port ${PORT} is already in use. Close other applications using this port or choose a different port.`
      );
   } else {
      console.error(`Server error: ${error.message}`);
   }
   process.exit(1);
});
