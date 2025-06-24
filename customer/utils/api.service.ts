import { getApiConfig } from './api.config';

// Response type for better type safety
interface ApiResponse<T = any> {
   success: boolean;
   data?: T;
   error?: string;
   status?: number;
}

// Main API service class
export class ApiService {
   static async get<T = any>(
      endpoint: string,
      token?: string
   ): Promise<ApiResponse<T>> {
      return this.request<T>('GET', endpoint, undefined, token);
   }

   static async post<T = any>(
      endpoint: string,
      data?: any,
      token?: string
   ): Promise<ApiResponse<T>> {
      return this.request<T>('POST', endpoint, data, token);
   }

   static async put<T = any>(
      endpoint: string,
      data?: any,
      token?: string
   ): Promise<ApiResponse<T>> {
      return this.request<T>('PUT', endpoint, data, token);
   }

   static async delete<T = any>(
      endpoint: string,
      token?: string
   ): Promise<ApiResponse<T>> {
      return this.request<T>('DELETE', endpoint, undefined, token);
   }

   // General request method with error handling
   private static async request<T = any>(
      method: string,
      endpoint: string,
      data?: any,
      token?: string
   ): Promise<ApiResponse<T>> {
      try {
         const config = await getApiConfig();
         const url = `${config.baseURL}${endpoint}`;

         console.log(`[API] ${method} ${url}`);

         const headers: HeadersInit = {
            ...config.headers,
         };

         if (token) {
            headers['Authorization'] = `Bearer ${token}`;
         }

         const options: RequestInit = {
            method,
            headers,
         };

         if (data) {
            options.body = JSON.stringify(data);
         }

         const response = await fetch(url, options);
         const responseData = await response.json().catch(() => ({}));

         console.log(`[API] Response:`, response.status, responseData);

         if (response.ok) {
            return {
               success: true,
               data: responseData,
               status: response.status,
            };
         }

         return {
            success: false,
            error: responseData.message || 'Unknown error occurred',
            status: response.status,
         };
      } catch (error) {
         console.error(`[API] Error:`, error);
         return {
            success: false,
            error:
               error instanceof Error
                  ? error.message
                  : 'Network error occurred',
         };
      }
   }
}
