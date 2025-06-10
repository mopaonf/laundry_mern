/**
 * Authentication utility for LaundryPro receptionist app
 */
import { apiRequest } from '../utils/api';

/**
 * Authenticates a receptionist user
 * @param email The receptionist's email address
 * @param password The receptionist's password
 * @returns A promise that resolves to the user object with role and token
 */
export async function loginReceptionist(
   email: string,
   password: string
): Promise<{
   token: string;
   role: string;
   _id: string;
   name: string;
   email: string;
}> {
   try {
      // Use our API client for consistent requests
      const response = await apiRequest('auth/login', {
         method: 'POST',
         data: { email, password },
      });

      // Return the full response which includes token and user info
      return response;
   } catch (error: Error | unknown) {
      // Re-throw with a more descriptive message if it's a network error
      const errorObj = error as Error;
      if (errorObj.message && errorObj.message.includes('Failed to fetch')) {
         throw new Error(
            'Unable to connect to the server. Please check your internet connection.'
         );
      }

      // Otherwise re-throw the original error
      throw error;
   }
}

/**
 * Checks if the user is authenticated
 * @returns boolean indicating authentication status
 */
export function isAuthenticated(): boolean {
   if (typeof window === 'undefined') return false;

   const token = localStorage.getItem('auth_token');
   return !!token;
}

/**
 * Checks if the current user has a specific role
 * @param allowedRoles Array of roles that are allowed
 * @returns boolean indicating if user has one of the allowed roles
 */
export function hasRole(allowedRoles: string[]): boolean {
   if (typeof window === 'undefined') return false;

   const userRole = localStorage.getItem('user_role');
   return userRole ? allowedRoles.includes(userRole) : false;
}

/**
 * Logs out the current user
 */
export function logout(): void {
   if (typeof window === 'undefined') return;

   localStorage.removeItem('auth_token');
   localStorage.removeItem('user_role');
   localStorage.removeItem('user_name');

   // Redirect to login page
   window.location.href = '/login';
}

/**
 * Gets the authentication token
 * @returns The authentication token or null if not authenticated
 */
export function getToken(): string | null {
   if (typeof window === 'undefined') return null;

   return localStorage.getItem('auth_token');
}
