// Import AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for custom API URL
export const CUSTOM_API_URL_KEY = 'laundry_app_custom_api_url';

// API URL configuration - adaptive for different environments
const isProduction = process.env.NODE_ENV === 'production';
// Use console.log to debug environment variables in development
if (__DEV__) {
   console.log('Environment:', process.env.NODE_ENV);
   console.log('Expo Device Type:', process.env.EXPO_DEVICE_TYPE);
}

// Use constants to avoid bundling issues
// Production URL - updated based on connectivity test
export const PRODUCTION_API_URL = 'https://laundry-app-backend.vercel.app';

// Common backend port
const BACKEND_PORT = '5000';

// Based on connectivity test results, we found working IPs
// These are working IP patterns for local development
export const DEVICE_API_URL = 'http://172.20.10.5:5000';
export const FALLBACK_IPS = [
   `http://localhost:${BACKEND_PORT}`,
   `http://127.0.0.1:${BACKEND_PORT}`,
   `http://172.20.10.5:${BACKEND_PORT}`,
   `http://192.168.137.1:${BACKEND_PORT}`,
   `http://10.0.2.2:${BACKEND_PORT}`, // Android emulator -> host localhost
];

// For emulators, default to localhost with fallbacks
export const EMULATOR_API_URL = `http://172.20.10.5:${BACKEND_PORT}`;

// Determine API URL based on environment
export const API_URL = isProduction
   ? PRODUCTION_API_URL
   : process.env.EXPO_DEVICE_TYPE === 'device'
   ? DEVICE_API_URL
   : EMULATOR_API_URL;

// Track which API URL is currently being used
let currentApiUrl = API_URL;
let apiUrlFallbackIndex = -1;

// Helper to append API URL to endpoint
export const getApiUrl = (endpoint: string): string => {
   // Log the URL being used
   if (__DEV__) {
      console.log(`Using API URL: ${currentApiUrl} for endpoint: ${endpoint}`);
   }

   // Handle API path construction correctly - all endpoints should start with /api/...
   const apiPath = endpoint.startsWith('/api/')
      ? endpoint
      : endpoint.startsWith('api/')
      ? `/${endpoint}`
      : `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

   return `${currentApiUrl}${apiPath}`;
};

// Try the next fallback URL if the current one fails
export const tryNextApiUrl = (): boolean => {
   if (isProduction) return false; // No fallbacks in production

   apiUrlFallbackIndex++;
   if (apiUrlFallbackIndex < FALLBACK_IPS.length) {
      currentApiUrl = FALLBACK_IPS[apiUrlFallbackIndex];
      console.log(`Trying next API URL: ${currentApiUrl}`);
      return true;
   }

   console.log('No more API URLs to try');
   return false;
};

// Helper to check API connectivity before attempting operations
export const checkApiConnectivity = async (): Promise<boolean> => {
   // Try up to 3 times with different URLs if needed
   let attemptCount = 0;
   const maxAttempts = 3;

   // Different endpoints to try for health checks
   const healthEndpoints = ['/health', '/api/health', '/', '/api'];

   while (attemptCount < maxAttempts) {
      try {
         attemptCount++;

         // Try different health check endpoints
         let responded = false;
         for (const endpoint of healthEndpoints) {
            if (responded) break;

            try {
               // Construct URL directly to avoid getApiUrl issues
               const url = `${currentApiUrl}${endpoint}`;
               console.log(
                  `Checking API connectivity at: ${url} (Attempt ${attemptCount}/${maxAttempts})`
               );

               const controller = new AbortController();
               // Set a timeout of 5 seconds
               const timeoutId = setTimeout(() => controller.abort(), 5000);

               const response = await fetch(url, {
                  method: 'GET',
                  signal: controller.signal as any,
               });

               clearTimeout(timeoutId);

               // Any response means the API is reachable
               console.log(
                  `API connectivity check result: ${response.status} from ${url}`
               );
               responded = true;
               return true;
            } catch (endpointError: any) {
               console.log(
                  `Failed to connect to ${endpoint}:`,
                  endpointError?.message || 'Unknown error'
               );
               // Continue to next endpoint
            }
         }

         // If we get here, none of the endpoints worked, try next URL
         console.error(
            `API connectivity check failed for all endpoints (Attempt ${attemptCount}/${maxAttempts})`
         );

         // Try next URL if available
         if (!tryNextApiUrl() || attemptCount >= maxAttempts) {
            console.log('No more API URLs to try or max attempts reached');
            return false;
         }

         // Otherwise continue the loop with the next URL
      } catch (error) {
         console.error(
            `API connectivity check failed (Attempt ${attemptCount}/${maxAttempts}):`,
            error
         );

         // Try next URL if available
         if (!tryNextApiUrl() || attemptCount >= maxAttempts) {
            console.log('No more API URLs to try or max attempts reached');
            return false;
         }
      }
   }

   return false;
};

// Custom API error
export class ApiError extends Error {
   status: number;

   constructor(message: string, status: number = 500) {
      super(message);
      this.status = status;
      this.name = 'ApiError';
   }
}

// Generic request handler
export const apiRequest = async <T>(
   endpoint: string,
   method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
   data: any = null,
   token: string | null = null
): Promise<T> => {
   // Reset to initial API URL for the first attempt
   apiUrlFallbackIndex = -1;

   // Try sending the request with each available URL
   const maxAttempts = 3;
   let attemptCount = 0;

   while (attemptCount < maxAttempts) {
      attemptCount++;

      try {
         const url = getApiUrl(endpoint);
         console.log(
            `API Request (Attempt ${attemptCount}/${maxAttempts}): ${method} ${url}`
         );

         const headers: Record<string, string> = {
            'Content-Type': 'application/json',
         };

         if (token) {
            headers['Authorization'] = `Bearer ${token}`;
         }

         const config: RequestInit = {
            method,
            headers,
            body: data ? JSON.stringify(data) : undefined,
         };

         // Use timeout to prevent hanging requests
         const controller = new AbortController();
         const timeoutId = setTimeout(() => controller.abort(), 10000);
         config.signal = controller.signal as any;

         const response = await fetch(url, config);
         clearTimeout(timeoutId);

         // Check content type before trying to parse as JSON
         const contentType = response.headers.get('content-type');

         if (!contentType || !contentType.includes('application/json')) {
            // Handle non-JSON response
            const text = await response.text();
            console.error(
               `API Error: Non-JSON response received from ${url}`,
               text.substring(0, 500)
            );
            throw new ApiError(
               `Server returned a non-JSON response: ${text.substring(
                  0,
                  100
               )}...`,
               response.status
            );
         }

         // Parse JSON response
         const responseData = (await response.json()) as any;

         if (!response.ok) {
            // If the response includes an error message, use it
            const errorMsg =
               responseData?.message ||
               `Request failed with status ${response.status}`;
            console.error(`API Error: ${errorMsg}`);
            throw new ApiError(errorMsg, response.status);
         }

         console.log(`API Response: ${method} ${url} - success`);
         return responseData as T;
      } catch (error: any) {
         if (error instanceof ApiError) {
            // If it's an API error, we got a response from server, don't retry with another URL
            throw error;
         } else if (
            error instanceof SyntaxError &&
            error.message.includes('JSON')
         ) {
            // Specific handling for JSON parse errors - this indicates the server responded but with malformed JSON
            console.error('JSON Parse Error:', error);
            throw new ApiError(
               'Invalid response format from server. The server might be returning HTML instead of JSON.',
               500
            );
         } else if (error?.name === 'AbortError') {
            console.error('Request timed out');
         } else {
            // It might be a connection error, try with next URL
            console.error(
               `API Request failed: ${error?.message || 'Unknown error'}`
            );
         }

         // Try next URL if available and we have attempts left
         if (attemptCount < maxAttempts && tryNextApiUrl()) {
            console.log(`Retrying with next URL...`);
            continue;
         }

         // No more URLs to try or max attempts reached
         throw new ApiError(
            'Unable to connect to the server after multiple attempts. Please check your internet connection and try again.',
            0
         );
      }
   }

   throw new ApiError(
      'Unable to connect to the server after multiple attempts.',
      0
   );
};

// Authentication API calls
export const login = async (email: string, password: string) => {
   try {
      // Check connectivity first
      const isConnected = await checkApiConnectivity();
      if (!isConnected) {
         throw new ApiError(
            'Cannot connect to the server. Please check your internet connection and try again.'
         );
      }

      const response = await fetch(getApiUrl('/auth/login'), {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
         console.error('Received non-JSON response:', await response.text());
         throw new ApiError(
            'Server returned an invalid response. Please try again later.'
         );
      }

      const data = (await response.json()) as any;

      if (!response.ok) {
         console.error('Login error:', data);
         throw new ApiError(data?.message || 'Login failed');
      }

      return data;
   } catch (error: any) {
      console.error('Login error:', error);

      // Check if it's a JSON parse error
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
         throw new ApiError(
            'Server returned an invalid response format. Please check if the backend server is running correctly.'
         );
      }

      // Check if it's an abort error (timeout)
      if (error?.name === 'AbortError') {
         throw new ApiError('Request timed out. Please try again later.');
      }

      throw error instanceof ApiError
         ? error
         : new ApiError(error?.message || 'An unexpected error occurred');
   }
};

export const register = async (userData: {
   name: string;
   email: string;
   password: string;
   phoneNumber: string;
}) => {
   try {
      // Check connectivity first
      const isConnected = await checkApiConnectivity();
      if (!isConnected) {
         throw new ApiError(
            'Cannot connect to the server. Please check your internet connection and try again.'
         );
      }

      const response = await fetch(getApiUrl('/auth/register'), {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
         },
         body: JSON.stringify(userData),
      });

      console.log('Register response status:', response.status);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
         console.error('Received non-JSON response:', await response.text());
         throw new ApiError(
            'Server returned an invalid response. Please try again later.'
         );
      }

      const data = (await response.json()) as any;

      if (!response.ok) {
         console.error('Register error:', data);
         throw new ApiError(data?.message || 'Registration failed');
      }

      return data;
   } catch (error: any) {
      console.error('Register error:', error);

      // Check if it's a JSON parse error
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
         throw new ApiError(
            'Server returned an invalid response format. Please check if the backend server is running correctly.'
         );
      }

      // Check if it's an abort error (timeout)
      if (error?.name === 'AbortError') {
         throw new ApiError('Request timed out. Please try again later.');
      }

      throw error instanceof ApiError
         ? error
         : new ApiError(error?.message || 'An unexpected error occurred');
   }
};

// Protected API request helper (includes auth token)
export const protectedRequest = async <T>(
   endpoint: string,
   method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
   data: any = null,
   token: string
): Promise<T> => {
   return apiRequest<T>(endpoint, method, data, token);
};

// Customer-specific API functions
export const fetchCustomerProfile = async (token: string) => {
   return protectedRequest('/customer/profile', 'GET', null, token);
};

export const fetchCustomerOrders = async (token: string) => {
   return protectedRequest('/order/customer', 'GET', null, token);
};

export const updateCustomerProfile = async (
   token: string,
   profileData: any
) => {
   return protectedRequest('/customer/profile', 'PUT', profileData, token);
};

// Initialize API URL with saved custom URL if available
export const initializeApiUrl = async (): Promise<void> => {
   try {
      const customUrl = await AsyncStorage.getItem(CUSTOM_API_URL_KEY);
      if (customUrl) {
         console.log('Using custom API URL from storage:', customUrl);
         currentApiUrl = customUrl;
      } else {
         console.log('Using default API URL:', API_URL);
      }
   } catch (error) {
      console.error('Error loading custom API URL:', error);
   }
};

// Call this when app starts
if (__DEV__) {
   initializeApiUrl().catch((error) =>
      console.error('Failed to initialize API URL:', error)
   );
}
