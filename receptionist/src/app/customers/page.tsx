'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
   FiSearch,
   FiUser,
   FiPhone,
   FiMail,
   FiCalendar,
   FiEye,
   FiAlertCircle,
} from 'react-icons/fi';
import { Customer, fetchCustomers } from '@/store/customers';
import { Pacifico } from 'next/font/google';

// Initialize the font
const pacifico = Pacifico({
   weight: '400',
   subsets: ['latin'],
   display: 'swap',
});

export default function CustomersPage() {
   const [customers, setCustomers] = useState<Customer[]>([]);
   const [searchQuery, setSearchQuery] = useState('');
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   // Fetch customers on component mount
   useEffect(() => {
      const getCustomers = async () => {
         try {
            setIsLoading(true);
            setError(null);
            const data = await fetchCustomers();
            setCustomers(data);
         } catch (err) {
            console.error('Failed to fetch customers:', err);
            setError(
               err instanceof Error ? err.message : 'Failed to load customers'
            );
         } finally {
            setIsLoading(false);
         }
      };

      getCustomers();
   }, []);

   // Filter customers based on search query
   const filteredCustomers = customers.filter((customer) => {
      if (searchQuery.trim() === '') return true;

      const query = searchQuery.toLowerCase();
      return (
         customer.name.toLowerCase().includes(query) ||
         customer.phone.toLowerCase().includes(query) ||
         (customer.email && customer.email.toLowerCase().includes(query))
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

   // Format address to display in a compact way
   const formatAddress = (address?: Customer['address']) => {
      if (!address) return 'No address provided';

      const { city, state, country } = address;
      const parts = [city, state, country].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : 'No address provided';
   };

   // Loading state
   if (isLoading) {
      return (
         <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#28B9F4] mb-4"></div>
            <p className="text-gray-200">Loading customers...</p>
         </div>
      );
   }

   // Error state
   if (error) {
      return (
         <div className="p-4 md:p-8 flex flex-col items-center justify-center min-h-[50vh]">
            <div className="bg-red-100 text-red-700 p-4 rounded-lg flex items-center mb-4">
               <FiAlertCircle size={24} className="mr-2" />
               <span>Error loading customers</span>
            </div>
            <p className="text-gray-200 mb-4">{error}</p>
            <button
               onClick={() => window.location.reload()}
               className="px-4 py-2 bg-[#28B9F4] text-white rounded-lg hover:bg-[#1a9fd8] transition-colors"
            >
               Try Again
            </button>
         </div>
      );
   }

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
                        Location
                     </th>
                     <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                     >
                        Created
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
                           key={customer._id}
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
                                       {customer.email || 'No email provided'}
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
                                 {customer.phone}
                              </div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700">
                                 {formatAddress(customer.address)}
                              </div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700 flex items-center">
                                 <FiCalendar
                                    className="mr-2 text-gray-400"
                                    size={14}
                                 />
                                 {formatDate(customer.createdAt)}
                              </div>
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                 href={`/customers/${customer._id}`}
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
                     key={customer._id}
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
                              {customer.email || 'No email provided'}
                           </p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 gap-2 pt-2">
                        <div className="text-sm text-gray-700 flex items-center">
                           <FiPhone className="mr-2 text-gray-400" size={14} />
                           <span>{customer.phone}</span>
                        </div>
                        <div className="text-sm text-gray-700 flex items-center">
                           <FiCalendar
                              className="mr-2 text-gray-400"
                              size={14}
                           />
                           <span>{formatDate(customer.createdAt)}</span>
                        </div>
                     </div>

                     <Link
                        href={`/customers/${customer._id}`}
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
