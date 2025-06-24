// Simple backend connectivity checker that uses the built-in https module
const http = require('http');
const https = require('https');
const os = require('os');

// Get the local IP address
function getLocalIpAddress() {
   const interfaces = os.networkInterfaces();
   const addresses = [];

   Object.keys(interfaces).forEach((interfaceName) => {
      interfaces[interfaceName].forEach((iface) => {
         // Skip internal and non-ipv4 addresses
         if (iface.family === 'IPv4' && !iface.internal) {
            addresses.push(iface.address);
         }
      });
   });

   return addresses;
}

// Test if a URL is reachable
function testUrl(url) {
   return new Promise((resolve) => {
      const options = {
         timeout: 5000,
         method: 'GET',
      };

      const handleResponse = (response) => {
         console.log(`✅ ${url} - ${response.statusCode}`);
         resolve(true);
      };

      const handleError = (error) => {
         console.log(`❌ ${url} - Failed: ${error.message}`);
         resolve(false);
      };

      try {
         const isHttps = url.startsWith('https:');
         const requester = isHttps ? https : http;

         const req = requester.request(url, options, handleResponse);
         req.on('error', handleError);
         req.on('timeout', () => {
            req.destroy();
            console.log(`❌ ${url} - Timed out`);
            resolve(false);
         });

         req.end();
      } catch (error) {
         handleError(error);
      }
   });
}

// Main function
async function main() {
   console.log('🔍 Checking backend server connectivity...');

   // Get local IP addresses
   const localIps = getLocalIpAddress();
   console.log('📱 Your device IP addresses:');
   localIps.forEach((ip) => console.log(`   - ${ip}`));

   const port = 5000; // Default backend port
   const endpoints = [
      'https://laundry-app-backend.vercel.app',
      `http://localhost:${port}`,
      `http://127.0.0.1:${port}`,
      `http://10.0.2.2:${port}`, // Android emulator -> host localhost
      ...localIps.map((ip) => `http://${ip}:${port}`),
   ];

   console.log('\n🔗 Testing connectivity to possible backend URLs:');
   const results = {};

   for (const baseUrl of endpoints) {
      console.log(`\nTesting ${baseUrl}...`);

      // Test different endpoints on each base URL
      const urlsToTest = [
         `${baseUrl}/`,
         `${baseUrl}/health`,
         `${baseUrl}/api/health`,
         `${baseUrl}/api`,
      ];

      let success = false;
      for (const url of urlsToTest) {
         success = await testUrl(url);
         if (success) break;
      }

      results[baseUrl] = success;
   }

   console.log('\n📊 Results summary:');
   let anySuccess = false;

   for (const [url, success] of Object.entries(results)) {
      console.log(`   ${success ? '✅' : '❌'} ${url}`);
      if (success) anySuccess = true;
   }

   if (!anySuccess) {
      console.log('\n❗ Could not connect to any backend server.');
      console.log(
         '   Please make sure the backend server is running and accessible.'
      );
      console.log(
         '   Check if your backend is running on the correct port (default: 5000).'
      );
   } else {
      console.log('\n✅ Found at least one working backend connection.');
      console.log('   You can update the API URLs in utils/api.ts if needed.');
   }

   console.log('\n📝 Recommendations:');
   console.log('1. Make sure your backend server is running');
   console.log('2. Check firewall settings if using a remote backend');
   console.log('3. If using an emulator, use 10.0.2.2 instead of localhost');
   console.log(
      '4. If using a real device, make sure your device is on the same network as the backend server'
   );
}

main().catch((error) => {
   console.error('Error running connectivity check:', error);
});
