import { create } from 'zustand';
import { apiRequest } from '../utils/api';

interface Transaction {
   _id: string;
   reference: string;
   userId: any;
   amount: number;
   status: string;
   createdAt: string;
   orderId?: any;
   description?: string;
   // add other fields as needed
}

interface TransactionsStore {
   transactions: Transaction[];
   isLoading: boolean;
   error: string | null;
   fetchTransactions: () => Promise<void>;
}

export const useTransactionsStore = create<TransactionsStore>((set) => ({
   transactions: [],
   isLoading: false,
   error: null,
   fetchTransactions: async () => {
      set({ isLoading: true, error: null });
      try {
         const res = await apiRequest('transactions');
         if (res.success && Array.isArray(res.data?.data)) {
            set({ transactions: res.data.data, isLoading: false });
         } else {
            set({ transactions: [], isLoading: false, error: 'No data found' });
         }
      } catch (err: any) {
         set({
            isLoading: false,
            error: err?.message || 'Failed to fetch transactions',
         });
      }
   },
}));
