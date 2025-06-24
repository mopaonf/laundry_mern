const express = require('express');
const app = express();

// Basic JSON middleware
app.use(express.json());

// Test routes
app.get('/', (req, res) => {
   res.send('Express test server is working!');
});

app.get('/debug', (req, res) => {
   res.json({ message: 'Debug route works!' });
});

app.post('/api/test', (req, res) => {
   res.json({
      message: 'POST endpoint works!',
      receivedData: req.body,
   });
});

// Start on different port to avoid conflicts
const PORT = 3000;
app.listen(PORT, () => {
   console.log(`Test server running on http://localhost:${PORT}`);
   console.log('Try these URLs:');
   console.log(`- http://localhost:${PORT}/`);
   console.log(`- http://localhost:${PORT}/debug`);
   console.log(`- POST to http://localhost:${PORT}/api/test with JSON body`);
});
