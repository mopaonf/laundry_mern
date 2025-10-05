'use client';

import React from 'react';
import {
   FiShoppingBag,
   FiClock,
   FiCheckCircle,
   FiDollarSign,
   FiLoader,
   FiRefreshCw,
   FiAlertCircle,
} from 'react-icons/fi';
import { Pacifico } from 'next/font/google';
import { useEffect } from 'react';
import { useDashboardStore } from '../store/dashboardStore';
// Remove unused useAppToast import

const pacifico = Pacifico({
   weight: '400',
   subsets: ['latin'],
   display: 'swap',
});

const statusColors: Record<string, string> = {
   'In Progress': 'bg-yellow-100 text-yellow-700',
   Ready: 'bg-blue-100 text-blue-700',
   Completed: 'bg-green-100 text-green-700',
};

export default function Home() {
   const { stats, isLoading, error, fetchDashboardStats } = useDashboardStore();

   useEffect(() => {
      fetchDashboardStats();

      // Set up auto-refresh every 3 minutes
      const intervalId = setInterval(() => {
         fetchDashboardStats();
      }, 180000); // 3 minutes in milliseconds

      return () => clearInterval(intervalId); // Clean up on unmount
   }, [fetchDashboardStats]);

   // Define summary cards based on stats
   const summary = [
      {
         icon: <FiShoppingBag className="w-10 h-10 text-purple-500" />,
         value: isLoading ? (
            <FiLoader className="animate-spin" />
         ) : (
            stats?.totalOrdersToday || 0
         ),
         label: 'Orders Today',
      },
      {
         icon: <FiClock className="w-10 h-10 text-yellow-500" />,
         value: isLoading ? (
            <FiLoader className="animate-spin" />
         ) : (
            stats?.ordersInProgress || 0
         ),
         label: 'In Progress',
      },
      {
         icon: <FiCheckCircle className="w-10 h-10 text-blue-500" />,
         value: isLoading ? (
            <FiLoader className="animate-spin" />
         ) : (
            stats?.ordersReadyForPickup || 0
         ),
         label: 'Ready for Pickup',
      },
      {
         icon: <FiDollarSign className="w-10 h-10 text-green-500" />,
         value: isLoading ? (
            <FiLoader className="animate-spin" />
         ) : (
            stats?.earningsToday || '0 FCFA'
         ),
         label: 'Earnings Today',
      },
   ];

   return (
      <div className="p-4 md:p-8 space-y-6 md:space-y-10">
         {/* Enhanced header styling */}
         <div className="relative pb-2 mb-4 md:mb-6 mt-2 md:mt-0">
            <h1
               className={`text-2xl sm:text-3xl md:text-4xl ${pacifico.className} text-gray-100 relative z-10`}
            >
               Dashboard
            </h1>
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#28B9F4] to-transparent w-24 md:w-32"></div>
            <div className="absolute -bottom-1 left-0 h-[3px] bg-gray-100 w-full"></div>
         </div>

         {/* Summary Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {summary.map((item) => (
               <div
                  key={item.label}
                  className="bg-white rounded-2xl shadow flex items-center gap-3 md:gap-4 p-4 md:p-6"
               >
                  <div className="flex-shrink-0">
                     {typeof item.icon === 'object' &&
                        React.cloneElement(
                           item.icon as React.ReactElement,
                           {
                              className: `${item.icon.props.className} w-8 h-8 md:w-10 md:h-10`,
                           } as React.HTMLAttributes<HTMLElement>
                        )}
                  </div>
                  <div>
                     <div className="text-xl md:text-2xl font-bold text-gray-900">
                        {item.value}
                     </div>
                     <div className="text-gray-500 text-xs md:text-sm">
                        {item.label}
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {/* Error State */}
         {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
               <FiAlertCircle className="text-red-500 mr-3" />
               <div>
                  <p className="text-red-700">Failed to load dashboard data</p>
                  <p className="text-red-600 text-sm">{error}</p>
               </div>
               <button
                  onClick={() => fetchDashboardStats()}
                  className="ml-auto bg-red-100 text-red-700 px-3 py-1 rounded-lg flex items-center hover:bg-red-200 transition-colors"
               >
                  <FiRefreshCw className="mr-1" /> Retry
               </button>
            </div>
         )}
         {/* Recent Orders Table */}
         <div>
            <div className="relative pb-2 mb-6">
               <h1
                  className={` text-2xl ${pacifico.className} text-gray-100 relative z-10`}
               >
                  Recent Orders
               </h1>
               <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#28B9F4] to-transparent w-32"></div>
               <div className="absolute -bottom-1 left-0 h-[2px] bg-gray-100 w-full"></div>
            </div>

            {/* Loading State */}
            {isLoading && !stats?.recentOrders && (
               <div className="bg-white rounded-2xl shadow p-12 flex flex-col items-center justify-center">
                  <FiLoader className="w-10 h-10 text-[#28B9F4] animate-spin mb-4" />
                  <p className="text-gray-600">Loading recent orders...</p>
               </div>
            )}

            {/* Empty State */}
            {!isLoading && stats?.recentOrders?.length === 0 && (
               <div className="bg-white rounded-2xl shadow p-12 flex flex-col items-center justify-center">
                  <FiShoppingBag className="w-10 h-10 text-gray-300 mb-4" />
                  <p className="text-gray-600">No recent orders found</p>
               </div>
            )}

            {/* Data Table - Desktop view */}
            {!isLoading &&
               stats?.recentOrders &&
               stats.recentOrders.length > 0 && (
                  <>
                     {/* Desktop view */}
                     <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow">
                        <table className="min-w-full text-sm">
                           <thead>
                              <tr className="bg-gray-50 text-gray-600">
                                 <th className="px-6 py-3 text-left font-semibold">
                                    Order ID
                                 </th>
                                 <th className="px-6 py-3 text-left font-semibold">
                                    Customer ID
                                 </th>
                                 <th className="px-6 py-3 text-left font-semibold">
                                    Customer
                                 </th>
                                 <th className="px-6 py-3 text-left font-semibold">
                                    Status
                                 </th>
                                 <th className="px-6 py-3 text-left font-semibold">
                                    Date
                                 </th>
                                 <th className="px-6 py-3 text-left font-semibold">
                                    Total
                                 </th>
                              </tr>
                           </thead>
                           <tbody>
                              {stats.recentOrders.map((order) => (
                                 <tr
                                    key={order.id}
                                    className="border-t last:border-b hover:bg-gray-50 transition text-gray-700"
                                 >
                                    <td className="px-6 py-3 font-mono">
                                       {order.id.substring(order.id.length - 6)}
                                    </td>
                                    <td className="px-6 py-3">
                                       <span className="text-sm font-mono font-bold text-[#28B9F4] bg-[#E6F7FF] px-3 py-1 rounded-full">
                                          {order.customerId}
                                       </span>
                                    </td>
                                    <td className="px-6 py-3">
                                       {order.customer}
                                    </td>
                                    <td className="px-6 py-3">
                                       <span
                                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                             statusColors[order.status] ||
                                             'bg-gray-100 text-gray-700'
                                          }`}
                                       >
                                          {order.status}
                                       </span>
                                    </td>
                                    <td className="px-6 py-3">{order.date}</td>
                                    <td className="px-6 py-3 font-semibold">
                                       {order.total}
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>

                     {/* Mobile view - card style */}
                     <div className="md:hidden space-y-4">
                        {stats.recentOrders.map((order) => (
                           <div
                              key={order.id}
                              className="bg-white rounded-xl shadow p-4 space-y-2"
                           >
                              <div className="flex justify-between items-center">
                                 <span className="font-mono font-medium text-gray-800">
                                    #{order.id.substring(order.id.length - 6)}
                                 </span>
                                 <span
                                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                                       statusColors[order.status] ||
                                       'bg-gray-100 text-gray-700'
                                    }`}
                                 >
                                    {order.status}
                                 </span>
                              </div>
                              <div className="flex flex-col space-y-1 text-sm">
                                 <div className="flex justify-between">
                                    <span className="text-gray-500">
                                       Customer ID:
                                    </span>
                                    <span className="text-xs font-mono font-bold text-[#28B9F4] bg-[#E6F7FF] px-2 py-1 rounded-full">
                                       {order.customerId}
                                    </span>
                                 </div>
                                 <div className="flex justify-between">
                                    <span className="text-gray-500">
                                       Customer:
                                    </span>
                                    <span className="font-medium text-gray-800">
                                       {order.customer}
                                    </span>
                                 </div>
                                 <div className="flex justify-between">
                                    <span className="text-gray-500">Date:</span>
                                    <span className="font-medium text-gray-700">
                                       {order.date}
                                    </span>
                                 </div>
                                 <div className="flex justify-between">
                                    <span className="text-gray-500">
                                       Total:
                                    </span>
                                    <span className="font-semibold text-[#28B9F4]">
                                       {order.total}
                                    </span>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </>
               )}

            {/* Auto-Refresh Indicator */}
            <div className="mt-3 flex justify-end">
               <span className="text-xs text-gray-400 flex items-center">
                  <FiRefreshCw className="w-3 h-3 mr-1" /> Auto-refreshes every
                  3 minutes
               </span>
            </div>
         </div>
      </div>
   );
}
