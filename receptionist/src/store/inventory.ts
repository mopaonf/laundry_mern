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
         // Cast each item to ensure it has the required InventoryItem properties
         return response.map((item: Record<string, unknown>) => {
            const inventoryItem: InventoryItem = {
               _id: item._id as string,
               name: item.name as string,
               category: item.category as string,
               serviceType: item.serviceType as string,
               basePrice: item.basePrice as number,
               id: item._id as string,
               price: item.basePrice as number,
               image: item.image as string | undefined,
               createdAt: item.createdAt as string | undefined,
            };
            return inventoryItem;
         });
      } else if (response && response.data && Array.isArray(response.data)) {
         return response.data.map((item: Record<string, unknown>) => {
            const inventoryItem: InventoryItem = {
               _id: item._id as string,
               name: item.name as string,
               category: item.category as string,
               serviceType: item.serviceType as string,
               basePrice: item.basePrice as number,
               id: item._id as string,
               price: item.basePrice as number,
               image: item.image as string | undefined,
               createdAt: item.createdAt as string | undefined,
            };
            return inventoryItem;
         });
      } else if (response && response.success && Array.isArray(response.data)) {
         return response.data.map((item: Record<string, unknown>) => {
            const inventoryItem: InventoryItem = {
               _id: item._id as string,
               name: item.name as string,
               category: item.category as string,
               serviceType: item.serviceType as string,
               basePrice: item.basePrice as number,
               id: item._id as string,
               price: item.basePrice as number,
               image: item.image as string | undefined,
               createdAt: item.createdAt as string | undefined,
            };
            return inventoryItem;
         });
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
