import { apiRequest } from '../utils/api';

// Define Customer interface based on User model
export interface Customer {
   _id: string;
   customerId?: string;
   name: string;
   email: string;
   phone: string;
   address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
   };
   createdAt: string;
   lastLogin?: string;
}

/**
 * Fetches all customers from the API
 * @returns Array of customers
 */
export const fetchCustomers = async (): Promise<Customer[]> => {
   try {
      // Use our apiRequest utility which already handles auth tokens
      const response = await apiRequest('customers');

      // Handle different response formats from the backend
      let customers: Customer[] = [];
      if (response && Array.isArray(response)) {
         customers = response;
      } else if (response && response.data && Array.isArray(response.data)) {
         customers = response.data;
      } else if (response && response.success && Array.isArray(response.data)) {
         customers = response.data;
      } else {
         console.log('Unexpected response format:', response);
         return [];
      }

      // Sort customers by creation date (oldest first) to show PL1, PL2, PL3... in order
      return customers.sort((a, b) => {
         const dateA = new Date(a.createdAt).getTime();
         const dateB = new Date(b.createdAt).getTime();
         return dateA - dateB;
      });
   } catch (error) {
      console.error('Error fetching customers:', error);
      const errorMessage =
         error instanceof Error ? error.message : 'Failed to fetch customers';
      throw new Error(errorMessage);
   }
};

/**
 * Creates a new customer
 * @param customerData The customer data to create
 * @returns The created customer
 */
export const createCustomer = async (
   customerData: Omit<Customer, '_id' | 'createdAt'>
): Promise<Customer> => {
   try {
      const response = await apiRequest('customers', {
         method: 'POST',
         data: customerData,
      });

      if (response && response.success && response.data) {
         return response.data;
      } else if (response && !response.success) {
         throw new Error(response.message || 'Failed to create customer');
      } else {
         return response;
      }
   } catch (error) {
      console.error('Error creating customer:', error);
      const errorMessage =
         error instanceof Error ? error.message : 'Failed to create customer';
      throw new Error(errorMessage);
   }
};
