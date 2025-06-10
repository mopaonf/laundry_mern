/**
 * API client for LaundryPro receptionist app
 */
const API_BASE =
   process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';

/**
 * Makes an API request to the backend
 * @param endpoint The API endpoint to request (without leading slash)
 * @param options The fetch options
 * @returns The fetch response parsed as JSON
 */
interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
   data?: Record<string, unknown>;
   headers?: Record<string, string>;
}

export async function apiRequest(
   endpoint: string,
   options: ApiRequestOptions = {}
) {
   try {
      // Ensure the endpoint doesn't start with a slash
      const cleanEndpoint = endpoint.startsWith('/')
         ? endpoint.slice(1)
         : endpoint;

      // Build the complete URL
      const url = `${API_BASE}/${cleanEndpoint}`;

      console.log(`Making API request to: ${url}`);

      // Get auth token if available (client-side only)
      let authHeaders: Record<string, string> = {};
      if (typeof window !== 'undefined') {
         const token = localStorage.getItem('auth_token');
         if (token) {
            authHeaders = { Authorization: `Bearer ${token}` };
         }
      }

      // Set default headers if not provided
      const headers = {
         'Content-Type': 'application/json',
         ...authHeaders,
         ...(options.headers || {}),
      };

      // Extract 'data' property from options to handle as JSON body
      const { data, ...fetchOptions } = options;

      // Prepare request options
      const requestOptions: RequestInit = {
         ...fetchOptions,
         headers,
      };

      // Add body if data is present for methods like POST, PUT, PATCH
      if (data) {
         requestOptions.body = JSON.stringify(data);
      }

      // Make the request
      const response = await fetch(url, requestOptions);

      // Handle HTTP errors
      if (!response.ok) {
         const errorData = await response.json().catch(() => ({}));
         const errorMessage =
            errorData.message || `API error: ${response.status}`;
         throw new Error(errorMessage);
      }

      // Parse and return the JSON response
      return await response.json();
   } catch (error) {
      console.error('API request failed:', error);
      throw error;
   }
}
