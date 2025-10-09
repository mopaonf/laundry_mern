# Laundry App API Connectivity Fixes

## Problem Summary

The app was encountering a "JSON Parse error: Unexpected character: <" when trying to connect to the backend API server. This is typically caused by:

1. The server returning HTML or an error page instead of JSON
2. Network connectivity issues between the app and the server
3. Incorrect API URL configuration

## Changes Made

### 1. API URL Path Construction

-  Fixed path handling in `getApiUrl()` to properly construct API endpoint URLs
-  Removed duplicate '/api' prefixes in URLs to avoid '/api/api/' paths
-  Added safeguards to handle various endpoint formats

### 2. Fallback URL Mechanism

-  Implemented a fallback URL system that tries multiple server URLs if the primary one fails
-  Added tracking of which URL is currently being used
-  Created a retry mechanism that cycles through possible URLs

### 3. API Request Enhancements

-  Improved error handling for non-JSON responses
-  Added timeout prevention for hanging requests
-  Enhanced error reporting with more detailed messages

### 4. Health Check & Connectivity Testing

-  Added a '/health' endpoint to the backend server for connectivity testing
-  Created `checkApiConnectivity()` function to test server availability
-  Implemented `tryNextApiUrl()` to cycle through available servers

### 5. Diagnostic Tools

-  Created a `ServerConfigScreen` for runtime server URL configuration
-  Created an `ApiTestScreen` to diagnose connectivity issues
-  Added a script to check server connectivity from the development environment
-  Updated the backend to provide a proper health check endpoint

### 6. Custom Server Configuration

-  Added support for storing and retrieving custom server URLs via AsyncStorage
-  Created UI for users to input and save custom server URLs
-  Added functionality to test connectivity to configured URLs

## How to Use the New Features

### For Developers

1. Run `npm run check-api` to test backend connectivity from your development environment
2. Use the `ApiTestScreen` to diagnose API issues from within the app
3. Use the `ServerConfigScreen` to configure custom API URLs without rebuilding

### For Users

1. Navigate to "More" -> "Server Configuration" to set a custom backend URL
2. Navigate to "More" -> "API Diagnostics" to test API connectivity

### Testing a Custom Backend

1. Run your backend server on your local machine
2. Find your machine's IP address (shown in the check-api script output)
3. Enter that IP address with port (e.g., http://172.20.10.500:5000) in the Server Configuration screen
4. Test the connectivity before saving
5. The app will now use your local backend server

## Troubleshooting

If you still experience API connectivity issues:

1. Make sure the backend server is running
2. Check if the server is accessible from your device's network
3. Verify that the proper port is open and not blocked by firewalls
4. If using an emulator, use 10.0.2.2 instead of localhost
5. If using a real device, make sure your device and backend are on the same network
