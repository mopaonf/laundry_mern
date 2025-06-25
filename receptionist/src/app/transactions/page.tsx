'use client';
import React, { useEffect, useState } from 'react';
import {
   FiDollarSign,
   FiSearch,
   FiLoader,
   FiAlertCircle,
   FiRefreshCw,
} from 'react-icons/fi';
import { useTransactionsStore } from '@/store/transactions';

export default function TransactionsPage() {
   // Use store for transactions, loading, error, fetchTransactions
   const { transactions, isLoading, error, fetchTransactions } =
      useTransactionsStore();
   const [search, setSearch] = useState('');

   useEffect(() => {
      fetchTransactions();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const filtered = transactions.filter((tx) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
         tx.description?.toLowerCase().includes(q) ||
         tx.status?.toLowerCase().includes(q) ||
         tx.userId?.name?.toLowerCase().includes(q) ||
         tx.amount?.toString().includes(q) ||
         tx.reference?.toLowerCase().includes(q)
      );
   });

   return (
      <div className="p-4 md:p-8 space-y-6">
         <div className="relative pb-2 mb-4 md:mb-6 mt-2 md:mt-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl text-gray-100 relative z-10 flex items-center gap-2">
               <FiDollarSign className="inline-block text-[#28B9F4]" />{' '}
               Transactions
            </h1>
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#28B9F4] to-transparent w-24 md:w-32"></div>
            <div className="absolute -bottom-1 left-0 h-[3px] bg-gray-100 w-full"></div>
         </div>
         <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            <div className="relative w-full md:w-64">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
               </div>
               <input
                  type="text"
                  className="pl-10 p-2 w-full border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#28B9F4] text-sm"
                  placeholder="Search transaction, user, or status..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
               />
            </div>
         </div>
         {/* Loading state */}
         {isLoading && (
            <div className="bg-white rounded-xl shadow p-12 flex flex-col items-center justify-center">
               <FiLoader className="w-12 h-12 text-[#28B9F4] animate-spin mb-4" />
               <p className="text-gray-600 text-lg">Loading transactions...</p>
            </div>
         )}
         {/* Error state */}
         {error && !isLoading && (
            <div className="bg-white rounded-xl shadow p-12 flex flex-col items-center justify-center">
               <FiAlertCircle className="w-12 h-12 text-red-500 mb-4" />
               <p className="text-gray-700 text-lg mb-4">
                  Failed to load transactions
               </p>
               <p className="text-gray-500 mb-6">{error}</p>
               <button
                  onClick={() => fetchTransactions()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#28B9F4] text-white rounded-lg hover:bg-[#1a9fd8] transition-all"
               >
                  <FiRefreshCw /> Try Again
               </button>
            </div>
         )}
         {/* Table view */}
         {!isLoading && !error && filtered.length === 0 && (
            <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
               No transactions found.
            </div>
         )}
         {!isLoading && !error && filtered.length > 0 && (
            <div className="overflow-x-auto bg-white rounded-xl shadow">
               <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                     <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Reference
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Categories
                        </th>
                     </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {filtered.map((tx) => (
                        <tr key={tx._id} className="hover:bg-gray-50">
                           <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                              {tx.reference}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                              {tx.userId?.name || tx.userId}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap font-bold text-[#28B9F4]">
                              {tx.amount} F
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                 className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    tx.status === 'SUCCESSFUL'
                                       ? 'bg-green-100 text-green-700 border border-green-200'
                                       : tx.status === 'PENDING'
                                       ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                       : 'bg-red-100 text-red-700 border border-red-200'
                                 }`}
                              >
                                 {tx.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                              {new Date(tx.createdAt).toLocaleString()}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                              {tx.orderId && tx.orderId.items
                                 ? tx.orderId.items
                                      .map((i: any) => i.name)
                                      .join(', ')
                                 : '-'}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
   );
}
