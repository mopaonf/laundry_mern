'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
   FiSearch,
   FiUser,
   FiPhone,
   FiMail,
   FiCalendar,
   FiShoppingBag,
   FiEye,
} from 'react-icons/fi';

// Import Google Font
import { Pacifico } from 'next/font/google';

// Initialize the font
const pacifico = Pacifico({
   weight: '400',
   subsets: ['latin'],
   display: 'swap',
});

// Sample data - in a real app, this would come from an API
const CUSTOMERS = [
   {
      id: 1,
      name: 'John Doe',
      contact: '+237 456 7890',
      email: 'john.doe@example.com',
      lastOrderDate: '2024-07-10',
      totalOrders: 12,
   },
   {
      id: 2,
      name: 'Jane Smith',
      contact: '+237 567 8901',
      email: 'jane.smith@example.com',
      lastOrderDate: '2024-07-08',
      totalOrders: 8,
   },
   {
      id: 3,
      name: 'Robert Johnson',
      contact: '+237 678 9012',
      email: 'robert.johnson@example.com',
      lastOrderDate: '2024-07-05',
      totalOrders: 15,
   },
   {
      id: 4,
      name: 'Emily Davis',
      contact: '+237 789 0123',
      email: 'emily.davis@example.com',
      lastOrderDate: '2024-07-12',
      totalOrders: 5,
   },
   {
      id: 5,
      name: 'Michael Wilson',
      contact: '+237 890 1234',
      email: 'michael.wilson@example.com',
      lastOrderDate: '2024-06-30',
      totalOrders: 20,
   },
   {
      id: 6,
      name: 'Sarah Taylor',
      contact: '+237 901 2345',
      email: 'sarah.taylor@example.com',
      lastOrderDate: '2024-07-02',
      totalOrders: 7,
   },
];

export default function CustomersPage() {
   const [searchQuery, setSearchQuery] = useState('');

   // Filter customers based on search query
   const filteredCustomers = CUSTOMERS.filter((customer) => {
      if (searchQuery.trim() === '') return true;

      const query = searchQuery.toLowerCase();
      return (
         customer.name.toLowerCase().includes(query) ||
         customer.contact.toLowerCase().includes(query) ||
         customer.email.toLowerCase().includes(query)
      );
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
         {/* Stylized Header */}
         <div className="relative pb-2 mb-6">
            <h1
               className={`text-3xl md:text-4xl ${pacifico.className} text-gray-100 relative z-10`}
            >
               Customers
            </h1>
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#28B9F4] to-transparent w-32"></div>
            <div className="absolute -bottom-1 left-0 h-[3px] bg-gray-100 w-full"></div>
         </div>

         {/* Search Bar */}
         <div className="relative max-w-md mx-auto md:mx-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <FiSearch className="text-gray-400" size={18} />
            </div>
            <input
               type="text"
               className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#28B9F4] focus:border-gray-100 transition-colors"
               placeholder="Search by name, phone or email..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>

         {/* Customers Table - Desktop View */}
         <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                  <tr>
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
                        Contact
                     </th>
                     <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                     >
                        Last Order
                     </th>
                     <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                     >
                        Total Orders
                     </th>
                     <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                     >
                        Actions
                     </th>
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.length > 0 ? (
                     filteredCustomers.map((customer) => (
                        <tr
                           key={customer.id}
                           className="hover:bg-gray-50 transition-colors duration-150"
                        >
                           <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                 <div className="flex-shrink-0 h-10 w-10 rounded-full bg-[#E6F7FF] flex items-center justify-center">
                                    <FiUser
                                       className="text-[#28B9F4]"
                                       size={20}
                                    />
                                 </div>
                                 <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                       {customer.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                       {customer.email}
                                    </div>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700 flex items-center">
                                 <FiPhone
                                    className="mr-2 text-gray-400"
                                    size={14}
                                 />
                                 {customer.contact}
                              </div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700 flex items-center">
                                 <FiCalendar
                                    className="mr-2 text-gray-400"
                                    size={14}
                                 />
                                 {formatDate(customer.lastOrderDate)}
                              </div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700 flex items-center">
                                 <FiShoppingBag
                                    className="mr-2 text-gray-400"
                                    size={14}
                                 />
                                 {customer.totalOrders}
                              </div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                 href={`/customers/${customer.id}`}
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
                           colSpan={5}
                           className="px-6 py-12 text-center text-gray-500"
                        >
                           No customers found matching your search criteria
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>

         {/* Customers Cards - Mobile View */}
         <div className="md:hidden space-y-4">
            {filteredCustomers.length > 0 ? (
               filteredCustomers.map((customer) => (
                  <div
                     key={customer.id}
                     className="bg-white rounded-xl shadow p-4 space-y-3"
                  >
                     <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-[#E6F7FF] flex items-center justify-center mr-4">
                           <FiUser className="text-[#28B9F4]" size={24} />
                        </div>
                        <div>
                           <h3 className="font-medium text-gray-900">
                              {customer.name}
                           </h3>
                           <p className="text-sm text-gray-500 flex items-center mt-1">
                              <FiMail
                                 className="mr-1 text-gray-400"
                                 size={12}
                              />
                              {customer.email}
                           </p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="text-sm text-gray-700 flex items-center">
                           <FiPhone className="mr-2 text-gray-400" size={14} />
                           <span>{customer.contact}</span>
                        </div>
                        <div className="text-sm text-gray-700 flex items-center">
                           <FiCalendar
                              className="mr-2 text-gray-400"
                              size={14}
                           />
                           <span>{formatDate(customer.lastOrderDate)}</span>
                        </div>
                        <div className="text-sm text-gray-700 flex items-center">
                           <FiShoppingBag
                              className="mr-2 text-gray-400"
                              size={14}
                           />
                           <span>{customer.totalOrders} orders</span>
                        </div>
                     </div>

                     <Link
                        href={`/customers/${customer.id}`}
                        className="block w-full mt-2"
                     >
                        <button className="w-full py-2 bg-white border border-[#28B9F4] text-[#28B9F4] rounded-lg flex items-center justify-center hover:bg-[#f0f9fe] transition-all duration-200 hover:shadow-md cursor-pointer transform hover:scale-[1.01]">
                           <FiEye className="mr-2" /> View Customer
                        </button>
                     </Link>
                  </div>
               ))
            ) : (
               <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                  No customers found matching your search criteria
               </div>
            )}
         </div>
      </div>
   );
}
