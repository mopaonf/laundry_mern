'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
   FiSearch,
   FiEye,
   FiCalendar,
   FiUser,
   FiDollarSign,
} from 'react-icons/fi';

// Add Google Fonts import
import { Pacifico } from 'next/font/google';

// Initialize the font
const pacifico = Pacifico({
   weight: '400',
   subsets: ['latin'],
   display: 'swap',
});

// Sample data - in a real app, this would come from an API
const ORDERS = [
   {
      id: '1042',
      customer: 'John Doe',
      status: 'In Progress',
      dropOffDate: '2024-07-10',
      pickupDate: '2024-07-12',
      total: '15,000 FCFA',
   },
   {
      id: '1041',
      customer: 'Jane Smith',
      status: 'Ready for Pickup',
      dropOffDate: '2024-07-09',
      pickupDate: '2024-07-11',
      total: '8,500 FCFA',
   },
   {
      id: '1040',
      customer: 'Robert Johnson',
      status: 'Completed',
      dropOffDate: '2024-07-08',
      pickupDate: '2024-07-10',
      total: '12,000 FCFA',
   },
   {
      id: '1039',
      customer: 'Emily Davis',
      status: 'In Progress',
      dropOffDate: '2024-07-08',
      pickupDate: '2024-07-11',
      total: '20,500 FCFA',
   },
   {
      id: '1038',
      customer: 'Michael Wilson',
      status: 'Ready for Pickup',
      dropOffDate: '2024-07-07',
      pickupDate: '2024-07-09',
      total: '5,000 FCFA',
   },
   {
      id: '1037',
      customer: 'Sarah Anderson',
      status: 'Completed',
      dropOffDate: '2024-07-06',
      pickupDate: '2024-07-08',
      total: '18,000 FCFA',
   },
];

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
   'In Progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
   'Ready for Pickup': 'bg-blue-100 text-blue-700 border-blue-200',
   Completed: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function OrdersPage() {
   const [activeTab, setActiveTab] = useState('All');
   const [searchQuery, setSearchQuery] = useState('');

   // Filter orders based on active tab and search query
   const filteredOrders = ORDERS.filter((order) => {
      // Filter by status tab
      if (activeTab !== 'All' && order.status !== activeTab) {
         return false;
      }

      // Filter by search query
      if (searchQuery.trim() !== '') {
         const query = searchQuery.toLowerCase();
         return (
            order.id.toLowerCase().includes(query) ||
            order.customer.toLowerCase().includes(query)
         );
      }

      return true;
   });

   // Format date to more readable format
   const formatDate = (dateString: string) => {
      const options: Intl.DateTimeFormatOptions = {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
   };

   return (
      <div className="p-4 md:p-8 space-y-6">
         {/* Enhanced header styling */}
         <div className="relative pb-2 mb-6">
            <h1
               className={`text-3xl md:text-4xl ${pacifico.className} text-gray-100 relative z-10`}
            >
               Orders
            </h1>
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#28B9F4] to-transparent w-32"></div>
            <div className="absolute -bottom-1 left-0 h-[3px] bg-gray-100 w-full"></div>
         </div>

         {/* Filter and Search Bar */}
         <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            {/* Status Tabs - updated with cursor and hover effects */}
            <div className="flex flex-wrap gap-2">
               {['All', 'In Progress', 'Ready for Pickup', 'Completed'].map(
                  (tab) => (
                     <button
                        key={tab}
                        className={`px-4 py-2 text-sm font-medium rounded-lg text-center min-w-[120px] cursor-pointer transform transition-all duration-200 hover:shadow-md ${
                           activeTab === tab
                              ? 'bg-[#28B9F4] text-white hover:bg-[#1a9fd8]'
                              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-[#28B9F4]'
                        }`}
                        onClick={() => setActiveTab(tab)}
                     >
                        {tab}
                     </button>
                  )
               )}
            </div>

            {/* Search Input - unchanged */}
            <div className="relative w-full md:w-64">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
               </div>
               <input
                  type="text"
                  className="pl-10 p-2 w-full border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#28B9F4]"
                  placeholder="Search order or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
         </div>

         {/* Orders Table - Desktop View */}
         <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                  <tr>
                     <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                     >
                        Order ID
                     </th>
                     <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                     >
                        Customer
                     </th>
                     <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                     >
                        Status
                     </th>
                     <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                     >
                        Drop-off Date
                     </th>
                     <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                     >
                        Total
                     </th>
                     <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                     >
                        Action
                     </th>
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.length > 0 ? (
                     filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                           <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                              #{order.id}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                              {order.customer}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                 className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                    STATUS_COLORS[order.status]
                                 }`}
                              >
                                 {order.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                              {formatDate(order.dropOffDate)}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-400">
                              {order.total}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-right">
                              <Link
                                 href={`/orders/${order.id}`}
                                 className="text-[#28B9F4] hover:text-[#1a9fd8] inline-flex items-center gap-1 transition-all duration-200 hover:underline cursor-pointer"
                              >
                                 <FiEye className="w-4 h-4" />
                                 <span>View</span>
                              </Link>
                           </td>
                        </tr>
                     ))
                  ) : (
                     <tr>
                        <td
                           colSpan={6}
                           className="px-6 py-12 text-center text-gray-500"
                        >
                           No orders found matching your criteria
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>

         {/* Orders Cards - Mobile View */}
         <div className="md:hidden space-y-4">
            {filteredOrders.length > 0 ? (
               filteredOrders.map((order) => (
                  <div
                     key={order.id}
                     className="bg-white rounded-xl shadow p-4 space-y-3"
                  >
                     <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900">#{order.id}</h3>
                        <span
                           className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              STATUS_COLORS[order.status]
                           }`}
                        >
                           {order.status}
                        </span>
                     </div>

                     <div className="space-y-1.5">
                        <div className="flex items-center text-gray-700">
                           <FiUser className="w-4 h-4 mr-2 text-gray-400" />
                           <span>{order.customer}</span>
                        </div>

                        <div className="flex items-center text-gray-700">
                           <FiCalendar className="w-4 h-4 mr-2 text-gray-400" />
                           <span>
                              Drop-off: {formatDate(order.dropOffDate)}
                           </span>
                        </div>

                        <div className="flex items-center font-medium">
                           <FiDollarSign className="w-4 h-4 mr-2 text-gray-400" />
                           <span>{order.total}</span>
                        </div>
                     </div>

                     <Link
                        href={`/orders/${order.id}`}
                        className="block w-full mt-2"
                     >
                        <button className="w-full py-2 bg-white border border-[#28B9F4] text-[#28B9F4] rounded-lg flex items-center justify-center hover:bg-[#f0f9fe] transition-all duration-200 hover:shadow-md cursor-pointer transform hover:scale-[1.01]">
                           <FiEye className="mr-2" /> View Order
                        </button>
                     </Link>
                  </div>
               ))
            ) : (
               <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                  No orders found matching your criteria
               </div>
            )}
         </div>
      </div>
   );
}
