import { create } from 'zustand';
import { apiRequest } from '../utils/api';

export type OrderItem = {
   name: string;
   quantity: number;
   price: number | string;
   _id?: string;
   itemId?: string;
};

export type Order = {
   id: string;
   _id: string;
   customer: string;
   customerId?: {
      _id: string;
      name: string;
      email: string;
      phone: string;
   };
   phone?: string;
   status: string;
   dropOffDate: string;
   createdAt: string;
   pickupDate?: string;
   total: number | string;
   items?: OrderItem[];
   notes?: string;
};

type OrderStore = {
   orders: Order[];
   isLoading: boolean;
   error: string | null;
   fetchOrders: () => Promise<void>;
   updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
};

export const useOrderStore = create<OrderStore>((set) => ({
   orders: [],
   isLoading: false,
   error: null,

   fetchOrders: async () => {
      set({ isLoading: true, error: null });
      try {
         // Use the apiRequest utility which already handles auth tokens
         const response = await apiRequest('orders'); // Handle different response formats from the backend
         let ordersData: Record<string, unknown>[] = [];

         if (response && Array.isArray(response)) {
            ordersData = response;
         } else if (response && response.data && Array.isArray(response.data)) {
            ordersData = response.data;
         } else if (
            response &&
            response.success &&
            Array.isArray(response.data)
         ) {
            ordersData = response.data;
         } else {
            console.log('Unexpected response format:', response);
            throw new Error('Invalid response format from API');
         } // Transform the API response to match our Order type
         const transformedOrders = ordersData.map(
            (orderData: Record<string, unknown>) => {
               // Type safety for customerId object
               const customerId = orderData.customerId as
                  | {
                       _id?: string;
                       name?: string;
                       phone?: string;
                       email?: string;
                    }
                  | undefined;

               return {
                  id: orderData._id as string,
                  _id: orderData._id as string,
                  // If customerId is an object with name property, use that, otherwise use a default
                  customer: customerId?.name || 'Unknown Customer',
                  customerId: customerId as Order['customerId'],
                  phone: customerId?.phone || '',
                  status: (orderData.status as string) || 'In Progress',
                  // Use createdAt as dropOffDate if not available
                  dropOffDate: orderData.createdAt as string,
                  createdAt: orderData.createdAt as string,
                  pickupDate: orderData.pickupDate as string | undefined,
                  total:
                     typeof orderData.total === 'number'
                        ? `FCFA ${orderData.total.toLocaleString()}`
                        : (orderData.total as string | number),
                  items: orderData.items as OrderItem[] | undefined,
                  notes: orderData.notes as string | undefined,
               };
            }
         );

         set({ orders: transformedOrders, isLoading: false });
      } catch (error: unknown) {
         console.error('Error fetching orders:', error);
         set({
            isLoading: false,
            error:
               error instanceof Error
                  ? error.message
                  : 'Failed to fetch orders',
         });
         throw error;
      }
   },

   updateOrderStatus: async (orderId: string, newStatus: string) => {
      set({ isLoading: true, error: null });
      try {
         // Use the apiRequest utility for updating order status
         const response = await apiRequest(`orders/${orderId}/status`, {
            method: 'PUT',
            data: { status: newStatus },
         });

         // Handle the response
         if (response && (response.success || response.data)) {
            // Update the local state as well for immediate UI updates
            set((state) => ({
               orders: state.orders.map((order) =>
                  order.id === orderId ? { ...order, status: newStatus } : order
               ),
               isLoading: false,
            }));
         } else {
            throw new Error('Failed to update order status');
         }
      } catch (error: unknown) {
         console.error('Error updating order status:', error);
         set({
            isLoading: false,
            error:
               error instanceof Error
                  ? error.message
                  : 'Failed to update order status',
         });
         throw error;
      }
   },
}));
