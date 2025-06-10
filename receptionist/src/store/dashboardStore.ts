import { create } from 'zustand';
import { apiRequest } from '../utils/api';

export type RecentOrder = {
   id: string;
   customer: string;
   status: string;
   date: string;
   total: string;
};

export type DashboardStats = {
   totalOrdersToday: number;
   ordersInProgress: number;
   ordersReadyForPickup: number;
   earningsToday: number | string;
   recentOrders: RecentOrder[];
};

type DashboardStore = {
   stats: DashboardStats | null;
   isLoading: boolean;
   error: string | null;
   fetchDashboardStats: () => Promise<void>;
};

// Initial state with default values
const initialStats: DashboardStats = {
   totalOrdersToday: 0,
   ordersInProgress: 0,
   ordersReadyForPickup: 0,
   earningsToday: 0,
   recentOrders: [],
};

export const useDashboardStore = create<DashboardStore>((set) => ({
   stats: null,
   isLoading: false,
   error: null,

   fetchDashboardStats: async () => {
      set({ isLoading: true, error: null });
      try {
         const response = await apiRequest('orders/dashboard-stats');

         // Handle different response formats
         let statsData: DashboardStats = initialStats;

         if (response && response.data) {
            statsData = response.data;
         } else if (response && response.success && response.data) {
            statsData = response.data;
         } else {
            console.log('Unexpected response format:', response);
            throw new Error('Invalid response format from API');
         }

         // Format earnings if it's a number
         if (typeof statsData.earningsToday === 'number') {
            statsData.earningsToday = `${statsData.earningsToday.toLocaleString()} FCFA`;
         }

         set({ stats: statsData, isLoading: false });
      } catch (error: any) {
         console.error('Error fetching dashboard stats:', error);
         set({
            isLoading: false,
            error:
               error instanceof Error
                  ? error.message
                  : 'Failed to fetch dashboard statistics',
            stats: initialStats, // Set default stats on error
         });
      }
   },
}));
