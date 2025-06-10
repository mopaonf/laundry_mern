import { apiRequest } from '../utils/api';

// Define InventoryItem interface based on backend model
export interface InventoryItem {
   _id: string;
   id?: string; // For frontend compatibility
   name: string;
   category: string;
   serviceType: string;
   basePrice: number;
   price?: number; // For frontend compatibility
   image?: string;
   createdAt?: string;
}

/**
 * Fetches all inventory items from the API
 * @returns Array of inventory items
 */
export const fetchInventoryItems = async (): Promise<InventoryItem[]> => {
   try {
      // Use our apiRequest utility which already handles auth tokens
      const response = await apiRequest('inventory');

      // Handle different response formats from the backend
      if (response && Array.isArray(response)) {
         return response.map((item) => ({
            ...item,
            id: item._id, // Ensure compatibility with frontend
            price: item.basePrice, // Map basePrice to price for frontend
         }));
      } else if (response && response.data && Array.isArray(response.data)) {
         return response.data.map((item) => ({
            ...item,
            id: item._id,
            price: item.basePrice,
         }));
      } else if (response && response.success && Array.isArray(response.data)) {
         return response.data.map((item) => ({
            ...item,
            id: item._id,
            price: item.basePrice,
         }));
      } else {
         console.log('Unexpected response format:', response);
         return [];
      }
   } catch (error) {
      console.error('Error fetching inventory items:', error);
      const errorMessage =
         error instanceof Error
            ? error.message
            : 'Failed to fetch inventory items';
      throw new Error(errorMessage);
   }
};
