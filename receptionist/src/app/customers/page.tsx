'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
   FiSearch,
   FiUser,
   FiPhone,
   FiMail,
   FiCalendar,
   FiEye,
   FiAlertCircle,
   FiUserPlus,
   FiX,
   FiHome,
} from 'react-icons/fi';
import { Customer, fetchCustomers, createCustomer } from '@/store/customers';
import { Pacifico } from 'next/font/google';
import toast from 'react-hot-toast';

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
   // State for add customer modal
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);

   // Ref for form focus management
   const nameInputRef = useRef<HTMLInputElement>(null); // New customer form state
   const [newCustomer, setNewCustomer] = useState({
      name: '',
      email: '',
      phone: '',
      address: {
         street: '',
      },
   }); // Function to fetch customers that can be reused
   const fetchCustomersData = async () => {
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

   // Focus on name input when modal opens
   useEffect(() => {
      if (isModalOpen && nameInputRef.current) {
         // Small delay to ensure modal is fully rendered
         setTimeout(() => {
            nameInputRef.current?.focus();
         }, 100);
      }
   }, [isModalOpen]);

   // Handle Escape key press to close modal
   useEffect(() => {
      const handleEscapeKey = (e: KeyboardEvent) => {
         if (e.key === 'Escape' && isModalOpen) {
            setIsModalOpen(false);
         }
      };

      document.addEventListener('keydown', handleEscapeKey);
      return () => {
         document.removeEventListener('keydown', handleEscapeKey);
      };
   }, [isModalOpen]);

   // Fetch customers on component mount
   useEffect(() => {
      fetchCustomersData();
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
   }; // Format address to display only the street address
   const formatAddress = (address?: Customer['address']) => {
      if (!address || !address.street) return 'No address provided';
      return address.street;
   };

   // Handle input changes for new customer form
   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      // Handle nested address fields
      if (name.startsWith('address.')) {
         const addressField = name.split('.')[1];
         setNewCustomer((prev) => ({
            ...prev,
            address: {
               ...prev.address,
               [addressField]: value,
            },
         }));
      } else {
         setNewCustomer((prev) => ({
            ...prev,
            [name]: value,
         }));
      }
   }; // Submit handler for adding new customer
   const handleAddCustomer = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
         setIsSubmitting(true);

         // Validate required fields
         if (!newCustomer.name || !newCustomer.phone) {
            toast.error('Name and phone are required fields');
            setIsSubmitting(false);
            return;
         }

         // Validate email format if provided
         if (
            newCustomer.email &&
            !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(
               newCustomer.email
            )
         ) {
            toast.error('Please enter a valid email address');
            setIsSubmitting(false);
            return;
         }

         // Validate phone number format (basic validation)
         if (!/^[0-9+\-\s()]{6,20}$/.test(newCustomer.phone)) {
            toast.error('Please enter a valid phone number');
            setIsSubmitting(false);
            return;
         }

         // Validate email format if provided
         if (
            newCustomer.email &&
            !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(
               newCustomer.email
            )
         ) {
            toast.error('Please enter a valid email address');
            setIsSubmitting(false);
            return;
         }

         // Validate phone number format (basic validation)
         if (!/^[0-9+\-\s()]{6,20}$/.test(newCustomer.phone)) {
            toast.error('Please enter a valid phone number');
            setIsSubmitting(false);
            return;
         }

         const result = await createCustomer(newCustomer); // Reset form and close modal
         setNewCustomer({
            name: '',
            email: '',
            phone: '',
            address: {
               street: '',
            },
         });

         setIsModalOpen(false);
         // Refresh the customer list to include the new customer
         await fetchCustomersData();
         // Success notification with more details
         toast.success(
            `${result.name} added successfully! You can now create orders for this customer.`,
            {
               duration: 5000,
               style: {
                  borderRadius: '10px',
                  background: '#effff8',
                  color: '#1d7a4c',
                  padding: '16px',
               },
               icon: '👤',
            }
         );
      } catch (err) {
         console.error('Failed to add customer:', err);

         // Extract specific error message if available
         let errorMessage = 'Unknown error';
         if (err instanceof Error) {
            errorMessage = err.message;
         } else if (
            typeof err === 'object' &&
            err !== null &&
            'message' in err
         ) {
            errorMessage = String(err.message);
         }

         // Show error toast with more helpful message
         if (errorMessage.includes('email already exists')) {
            toast.error(
               'A customer with this email already exists. Please use a different email.',
               {
                  duration: 5000,
                  style: {
                     borderRadius: '10px',
                     background: '#fff1f0',
                     color: '#d9363e',
                  },
               }
            );
         } else if (errorMessage.includes('phone number already exists')) {
            toast.error('A customer with this phone number already exists.', {
               duration: 5000,
               style: {
                  borderRadius: '10px',
                  background: '#fff1f0',
                  color: '#d9363e',
               },
            });
         } else {
            toast.error(`Failed to add customer: ${errorMessage}`, {
               duration: 5000,
               style: {
                  borderRadius: '10px',
                  background: '#fff1f0',
                  color: '#d9363e',
               },
            });
         }
      } finally {
         setIsSubmitting(false);
      }
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
            <div className="absolute -bottom-1 left-0 h-[3px] bg-gray-100 w-full"></div>{' '}
         </div>

         {/* Search Bar and Add Customer Button */}
         <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="relative max-w-md w-full">
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
            {/* Add Customer Button */}
            <button
               onClick={() => setIsModalOpen(true)}
               className="px-4 py-3 bg-[#28B9F4] text-white rounded-lg hover:bg-[#1a9fd8] transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#28B9F4] focus:ring-offset-2"
               disabled={isSubmitting || isLoading}
            >
               <FiUserPlus className="mr-2" size={18} />
               Add New Customer
            </button>
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
                           </p>{' '}
                        </div>
                     </div>
                     <div className="grid grid-cols-1 gap-2 pt-2">
                        <div className="text-sm text-gray-700 flex items-center">
                           <FiPhone className="mr-2 text-gray-400" size={14} />
                           <span>{customer.phone}</span>
                        </div>
                        <div className="text-sm text-gray-700 flex items-center">
                           <FiHome className="mr-2 text-gray-400" size={14} />
                           <span>{formatAddress(customer.address)}</span>
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
         {/* Add Customer Modal */}
         {isModalOpen && (
            <div
               className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
               onClick={(e) => {
                  // Close modal when clicking outside
                  if (e.target === e.currentTarget) {
                     setIsModalOpen(false);
                  }
               }}
            >
               <div
                  className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
                  role="dialog"
                  aria-labelledby="modal-title"
                  aria-modal="true"
               >
                  <div className="flex items-center justify-between p-6 border-b border-gray-200">
                     <h2
                        id="modal-title"
                        className="text-xl font-semibold text-gray-800 flex items-center"
                     >
                        <FiUserPlus className="mr-2 text-[#28B9F4]" />
                        Add New Customer
                     </h2>
                     <button
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close modal"
                     >
                        <FiX size={24} />
                     </button>
                  </div>

                  <form onSubmit={handleAddCustomer} className="p-6">
                     <div className="space-y-4">
                        {/* Basic Information */}
                        <div>
                           {' '}
                           <label
                              htmlFor="customer-name"
                              className="block text-sm font-medium text-gray-700 mb-1"
                           >
                              Name <span className="text-red-500">*</span>
                           </label>
                           <input
                              id="customer-name"
                              type="text"
                              name="name"
                              value={newCustomer.name}
                              onChange={handleInputChange}
                              required
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28B9F4]"
                              placeholder="Full Name"
                              ref={nameInputRef}
                              aria-required="true"
                           />
                        </div>
                        <div>
                           {' '}
                           <label
                              htmlFor="customer-phone"
                              className="block text-sm font-medium text-gray-700 mb-1"
                           >
                              Phone <span className="text-red-500">*</span>
                           </label>
                           <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                 <FiPhone className="text-gray-400" />
                              </div>
                              <input
                                 id="customer-phone"
                                 type="tel"
                                 name="phone"
                                 value={newCustomer.phone}
                                 onChange={handleInputChange}
                                 required
                                 className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28B9F4]"
                                 placeholder="Phone Number"
                                 aria-required="true"
                                 pattern="[0-9+\-\s()]{6,20}"
                                 title="Phone number should be between 6-20 characters and can contain numbers, spaces, and +()-"
                              />
                           </div>
                        </div>
                        <div>
                           {' '}
                           <label
                              htmlFor="customer-email"
                              className="block text-sm font-medium text-gray-700 mb-1"
                           >
                              Email{' '}
                              <span className="text-gray-400 text-xs font-normal">
                                 (Optional)
                              </span>
                           </label>
                           <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                 <FiMail className="text-gray-400" />
                              </div>
                              <input
                                 id="customer-email"
                                 type="email"
                                 name="email"
                                 value={newCustomer.email}
                                 onChange={handleInputChange}
                                 className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28B9F4]"
                                 placeholder="Email Address"
                                 aria-required="false"
                              />
                           </div>
                        </div>{' '}
                        {/* Address Fields */}
                        <div className="mt-6">
                           <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                              <FiHome className="mr-2 text-[#28B9F4]" />
                              Address Details (Optional)
                           </h3>

                           <div>
                              <label
                                 htmlFor="customer-address"
                                 className="block text-sm font-medium text-gray-700 mb-1"
                              >
                                 Street Address
                              </label>
                              <input
                                 id="customer-address"
                                 type="text"
                                 name="address.street"
                                 value={newCustomer.address.street}
                                 onChange={handleInputChange}
                                 className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28B9F4]"
                                 placeholder="Enter complete street address"
                              />
                           </div>
                        </div>
                     </div>
                     <div className="mt-8 flex justify-end space-x-3">
                        <button
                           type="button"
                           onClick={() => setIsModalOpen(false)}
                           className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 font-medium"
                           disabled={isSubmitting}
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           disabled={isSubmitting}
                           className="px-5 py-2.5 bg-[#28B9F4] text-white rounded-lg hover:bg-[#1a9fd8] transition-all duration-200 disabled:opacity-50 flex items-center shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-[#28B9F4] focus:ring-offset-2 font-medium"
                        >
                           {isSubmitting ? (
                              <>
                                 <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                 <span>Saving...</span>
                              </>
                           ) : (
                              <>
                                 <FiUserPlus className="mr-2" />
                                 <span>Add Customer</span>
                              </>
                           )}
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
}
