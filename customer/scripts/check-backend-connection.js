/**
 * This script helps find the correct IP for the backend server.
 *
 * Run this script before starting your app to verify connectivity
 * to the backend server and update the API URLs if needed.
 */
const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const http = require('http');
const https = require('https');
const readline = require('readline');

// Path to the api.ts file
const API_FILE_PATH = path.resolve(__dirname, '../utils/api.ts');

// Function to get all IPv4 addresses on the machine
function getLocalIpAddresses() {
   const interfaces = os.networkInterfaces();
   const ipAddresses = [];

   Object.keys(interfaces).forEach((interfaceName) => {
      interfaces[interfaceName].forEach((iface) => {
         // Skip over non-IPv4 and internal (loopback) addresses
         if (iface.family === 'IPv4' && !iface.internal) {
            ipAddresses.push(iface.address);
         }
      });
   });

   return ipAddresses;
}

// Function to check if a server is responding on a given URL
function checkServerConnection(url) {
   return new Promise((resolve) => {
      console.log(`Checking ${url}...`);

      const client = url.startsWith('https') ? https : http;
      const timeout = 3000; // 3 seconds timeout

      const req = client.get(url, { timeout }, (res) => {
         console.log(`${url} responded with status code: ${res.statusCode}`);
         let data = '';

         res.on('data', (chunk) => {
            data += chunk;
         });

         res.on('end', () => {
            resolve({
               url,
               status: res.statusCode,
               isSuccess: res.statusCode >= 200 && res.statusCode < 400,
               data: data.substring(0, 100), // Just get a snippet of the response
            });
         });
      });

      req.on('error', (err) => {
         console.log(`${url} error: ${err.message}`);
         resolve({
            url,
            status: 0,
            isSuccess: false,
            error: err.message,
         });
      });

      req.on('timeout', () => {
         req.destroy();
         console.log(`${url} timed out`);
         resolve({
            url,
            status: 0,
            isSuccess: false,
            error: 'Request timed out',
         });
      });
   });
}

// Function to update the API_URL in api.ts file
function updateApiFile(newIp) {
   try {
      const fileContent = fs.readFileSync(API_FILE_PATH, 'utf8');

      // Update the DEVICE_API_URL and EMULATOR_API_URL constants
      const updatedContent = fileContent
         .replace(
            /export const DEVICE_API_URL = ['"]http:\/\/[^:]+:(\d+)['"]/,
            `export const DEVICE_API_URL = 'http://${newIp}:$1'`
         )
         .replace(
            /export const EMULATOR_API_URL = ['"]http:\/\/[^:]+:(\d+)['"]/,
            `export const EMULATOR_API_URL = 'http://${newIp}:$1'`
         );

      fs.writeFileSync(API_FILE_PATH, updatedContent);
      console.log(`\nUpdated API URLs in ${API_FILE_PATH} to use IP: ${newIp}`);
      return true;
   } catch (err) {
      console.error(`\nError updating API file: ${err.message}`);
      return false;
   }
}

// Function to ask a question and get user input
function askQuestion(query) {
   const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
   });

   return new Promise((resolve) =>
      rl.question(query, (ans) => {
         rl.close();
         resolve(ans);
      })
   );
}

// Main function
async function main() {
   console.log('=============================================');
   console.log('Backend Server Connection Checker & IP Updater');
   console.log('=============================================\n');

   // First, read the current API file to extract the current URLs
   let currentDeviceUrl = '';
   let currentEmulatorUrl = '';
   let currentPort = '5000'; // Default port

   try {
      const apiFileContent = fs.readFileSync(API_FILE_PATH, 'utf8');

      const deviceUrlMatch = apiFileContent.match(
         /DEVICE_API_URL = ['"]http:\/\/([^:]+):(\d+)['"]/
      );
      if (deviceUrlMatch) {
         currentDeviceUrl = deviceUrlMatch[1];
         currentPort = deviceUrlMatch[2];
      }

      const emulatorUrlMatch = apiFileContent.match(
         /EMULATOR_API_URL = ['"]http:\/\/([^:]+):(\d+)['"]/
      );
      if (emulatorUrlMatch) {
         currentEmulatorUrl = emulatorUrlMatch[1];
      }

      console.log(
         `Current device API URL IP: ${currentDeviceUrl || 'Not found'}`
      );
      console.log(
         `Current emulator API URL IP: ${currentEmulatorUrl || 'Not found'}`
      );
      console.log(`Current port: ${currentPort}\n`);
   } catch (err) {
      console.error(`Error reading API file: ${err.message}\n`);
   }

   // Get available IP addresses
   const ipAddresses = getLocalIpAddresses();
   console.log('Available local IP addresses:');
   ipAddresses.forEach((ip, index) => {
      console.log(`[${index + 1}] ${ip}`);
   });
   console.log('[0] Enter a different IP manually');
   console.log('\n');

   // Generate URLs to test
   const backend_port = currentPort;
   const urlsToTest = [
      `http://localhost:${backend_port}`,
      `http://127.0.0.1:${backend_port}`,
      ...ipAddresses.map((ip) => `http://${ip}:${backend_port}`),
      'https://laundry-app-backend.vercel.app',
   ];

   // Add current URLs if they exist and aren't already in the list
   if (
      currentDeviceUrl &&
      !urlsToTest.includes(`http://${currentDeviceUrl}:${backend_port}`)
   ) {
      urlsToTest.push(`http://${currentDeviceUrl}:${backend_port}`);
   }

   console.log('Testing connectivity to possible backend URLs...\n');

   const results = await Promise.all(
      urlsToTest.map((url) => checkServerConnection(`${url}/health`))
   );

   // Print results
   console.log('\nResults:');
   results.forEach((result, index) => {
      const status = result.isSuccess
         ? `✅ Connected (Status: ${result.status})`
         : `❌ Failed (${result.error || `Status: ${result.status}`})`;
      console.log(`[${index + 1}] ${result.url}: ${status}`);
   });

   // Find working URLs
   const workingUrls = results.filter((result) => result.isSuccess);

   if (workingUrls.length === 0) {
      console.log('\n❌ No working backend server found.');
      console.log(
         'Make sure your backend server is running on one of these addresses.'
      );
   } else {
      console.log(
         `\n✅ Found ${workingUrls.length} working backend server(s).`
      );
   }

   // Ask if user wants to update API URLs
   const answer = await askQuestion(
      '\nDo you want to update the API URLs in api.ts? (y/n): '
   );

   if (answer.toLowerCase() === 'y') {
      let selectedIp = '';

      if (workingUrls.length > 0) {
         // Suggest the first working URL by default
         const suggestedUrl = workingUrls[0].url;
         const suggestedIp = suggestedUrl.replace(
            /^https?:\/\/([^:/]+).*$/,
            '$1'
         );

         console.log(
            `\nSuggested IP: ${suggestedIp} (from working URL: ${suggestedUrl})`
         );
         const useThisIp = await askQuestion('Use this IP? (y/n): ');

         if (useThisIp.toLowerCase() === 'y') {
            selectedIp = suggestedIp;
         }
      }

      if (!selectedIp) {
         // Let user pick from available IPs or enter manually
         const selection = await askQuestion(
            `\nEnter the number of the IP to use (1-${ipAddresses.length}) or 0 to enter manually: `
         );
         const selectionNum = parseInt(selection, 10);

         if (selectionNum > 0 && selectionNum <= ipAddresses.length) {
            selectedIp = ipAddresses[selectionNum - 1];
         } else {
            selectedIp = await askQuestion('\nEnter IP address manually: ');
         }
      }

      if (selectedIp) {
         // Update the api.ts file
         updateApiFile(selectedIp);
         console.log(`\n✅ API URLs updated to use IP: ${selectedIp}`);
         console.log('Please restart your app after this update.');
      } else {
         console.log('\nNo IP selected. API URLs not updated.');
      }
   } else {
      console.log('\nAPI URLs not updated.');
   }

   console.log('\nDone!');
}

main().catch((err) => {
   console.error('Error:', err);
});
