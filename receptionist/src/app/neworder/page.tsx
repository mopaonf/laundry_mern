'use client';

import { useState, useRef, useEffect } from 'react';
import {
   FiUser,
   FiCalendar,
   FiTrash2,
   FiPlus,
   FiSave,
   FiFileText,
   FiSearch,
   FiLoader,
} from 'react-icons/fi';
import { fetchCustomers } from '../../store/customers';
import { fetchInventoryItems, InventoryItem } from '../../store/inventory';
import toast from 'react-hot-toast';

// Customer interface
interface Customer {
   _id: string;
   id?: string; // For frontend compatibility
   name: string;
   email: string;
   phone: string;
   address?: {
      street?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
   };
}

interface OrderItem {
   id: string;
   name: string;
   price: number;
   quantity: number;
}

export default function NewOrderPage() {
   const [customerId, setCustomerId] = useState<string>('');
   const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
   const [selectedItemId, setSelectedItemId] = useState<string>('');
   const [quantity, setQuantity] = useState<number>(1);
   const [pickupDate, setPickupDate] = useState<string>('');
   const [notes, setNotes] = useState<string>('');

   // Loading states
   const [isLoadingCustomers, setIsLoadingCustomers] = useState<boolean>(false);
   const [isLoadingItems, setIsLoadingItems] = useState<boolean>(false);
   const [error, setError] = useState<string | null>(null);

   // Data states
   const [customers, setCustomers] = useState<Customer[]>([]);
   const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);

   // Item search states
   const [searchTerm, setSearchTerm] = useState<string>('');
   const [isSearching, setIsSearching] = useState<boolean>(false);
   const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
   const searchInputRef = useRef<HTMLInputElement>(null);
   const searchResultsRef = useRef<HTMLDivElement>(null);

   // New customer search states
   const [customerSearchTerm, setCustomerSearchTerm] = useState<string>('');
   const [isCustomerSearching, setIsCustomerSearching] =
      useState<boolean>(false);
   const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
   const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
      null
   );
   const customerSearchInputRef = useRef<HTMLInputElement>(null);
   const customerSearchResultsRef = useRef<HTMLDivElement>(null); // Fetch customers and inventory items on component mount
   useEffect(() => {
      const fetchData = async () => {
         try {
            setIsLoadingCustomers(true);
            setIsLoadingItems(true);
            setError(null); // Fetch customers
            const customersData = await fetchCustomers();
            setCustomers(customersData);

            // Fetch inventory items
            const itemsData = await fetchInventoryItems();
            setInventoryItems(itemsData);

            // Show success toast if both loaded successfully
            toast.success('Data loaded successfully', {
               icon: '📋',
               duration: 2000,
               style: {
                  borderRadius: '10px',
                  background: '#effff8',
                  color: '#1d7a4c',
               },
            });
         } catch (err) {
            console.error('Error fetching data:', err);
            const errorMessage =
               err instanceof Error
                  ? err.message
                  : 'An error occurred while fetching data';

            setError(errorMessage);

            // Show toast notification for error
            toast.error(`Error loading data: ${errorMessage}`, {
               icon: '⚠️',
               duration: 5000,
               style: {
                  borderRadius: '10px',
                  background: '#fff1f0',
                  color: '#d9363e',
               },
            });
         } finally {
            setIsLoadingCustomers(false);
            setIsLoadingItems(false);
         }
      };

      fetchData();
   }, []);

   // Filter items when search term changes
   useEffect(() => {
      if (searchTerm.trim() === '') {
         setFilteredItems([]);
         return;
      }

      const filtered = inventoryItems.filter((item) =>
         item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
   }, [searchTerm, inventoryItems]);

   // Filter customers when search term changes
   useEffect(() => {
      if (customerSearchTerm.trim() === '') {
         setFilteredCustomers([]);
         return;
      }

      const filtered = customers.filter((customer) =>
         customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
   }, [customerSearchTerm, customers]);

   // Handle click outside search results
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (
            searchResultsRef.current &&
            !searchResultsRef.current.contains(event.target as Node) &&
            searchInputRef.current &&
            !searchInputRef.current.contains(event.target as Node)
         ) {
            setIsSearching(false);
         }

         // Handle customer search click outside
         if (
            customerSearchResultsRef.current &&
            !customerSearchResultsRef.current.contains(event.target as Node) &&
            customerSearchInputRef.current &&
            !customerSearchInputRef.current.contains(event.target as Node)
         ) {
            setIsCustomerSearching(false);
         }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, []);
   const selectCustomer = (customer: Customer) => {
      setCustomerId(customer._id);
      setSelectedCustomer(customer);
      setCustomerSearchTerm(customer.name);
      setIsCustomerSearching(false);

      // Show toast notification for customer selection
      toast.success(`Customer selected: ${customer.name}`, {
         icon: '👤',
         duration: 2000,
         style: {
            borderRadius: '10px',
            background: '#f0f9ff',
            color: '#0369a1',
         },
      });
   };

   const selectItem = (item: InventoryItem) => {
      setSelectedItemId(item._id);
      setSearchTerm(item.name);
      setIsSearching(false);
   };
   const addItem = () => {
      if (!selectedItemId) return;

      const itemToAdd = inventoryItems.find(
         (item) => item._id === selectedItemId
      );
      if (!itemToAdd) return;

      const existingItem = orderItems.find((item) => item.id === itemToAdd._id);
      const itemPrice = itemToAdd.price ?? itemToAdd.basePrice;

      if (existingItem) {
         // Update quantity if item already exists
         setOrderItems(
            orderItems.map((item) =>
               item.id === itemToAdd._id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
            )
         );

         // Show toast for updated quantity
         toast.success(
            `Updated: ${quantity} more ${itemToAdd.name}${
               quantity > 1 ? 's' : ''
            } added`,
            {
               icon: '🔄',
               duration: 2000,
               style: {
                  borderRadius: '10px',
                  background: '#f0f9ff',
                  color: '#0369a1',
               },
            }
         );
      } else {
         // Add new item
         setOrderItems([
            ...orderItems,
            {
               id: itemToAdd._id,
               name: itemToAdd.name,
               price: itemPrice,
               quantity,
            },
         ]);

         // Show toast for new item
         toast.success(
            `Added: ${quantity} ${itemToAdd.name}${quantity > 1 ? 's' : ''}`,
            {
               icon: '✅',
               duration: 2000,
               style: {
                  borderRadius: '10px',
                  background: '#effff8',
                  color: '#1d7a4c',
               },
            }
         );
      }

      // Reset selection
      setSelectedItemId('');
      setQuantity(1);
   };
   const removeItem = (id: string) => {
      // Find the item before removing it to get its name
      const itemToRemove = orderItems.find((item) => item.id === id);

      if (itemToRemove) {
         // Remove the item
         setOrderItems(orderItems.filter((item) => item.id !== id));

         // Show toast notification
         toast.success(`Removed: ${itemToRemove.name}`, {
            icon: '🗑️',
            duration: 2000,
            style: {
               borderRadius: '10px',
               background: '#fff5f5',
               color: '#e53e3e',
            },
         });
      }
   };

   const calculateTotal = () => {
      return orderItems.reduce(
         (sum, item) => sum + item.price * item.quantity,
         0
      );
   };
   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      // In a real app, you would send this data to your backend
      const orderData = {
         customerId,
         items: orderItems,
         pickupDate,
         notes,
         total: calculateTotal(),
      };
      console.log('Submitting order:', orderData);

      try {
         // Call API endpoint here
         const response = await fetch('http://localhost:5000/api/orders', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               // Add authorization if needed
               ...(typeof window !== 'undefined' &&
               localStorage.getItem('auth_token')
                  ? {
                       Authorization: `Bearer ${localStorage.getItem(
                          'auth_token'
                       )}`,
                    }
                  : {}),
            },
            body: JSON.stringify(orderData),
         });

         if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create order: ${errorText}`);
         }
         const result = await response.json();
         console.log('Order created successfully:', result);

         // Show success toast
         toast.success('Order created successfully!', {
            icon: '🧺',
            style: {
               borderRadius: '10px',
               background: '#effff8',
               color: '#1d7a4c',
            },
         });

         // Reset form
         setCustomerId('');
         setSelectedCustomer(null);
         setOrderItems([]);
         setPickupDate('');
         setNotes('');
         setCustomerSearchTerm('');
      } catch (error) {
         console.error('Error creating order:', error);
         // Show error toast
         toast.error(
            `Error creating order: ${
               error instanceof Error ? error.message : 'Unknown error'
            }`,
            {
               icon: '❌',
               duration: 6000,
               style: {
                  borderRadius: '10px',
                  background: '#fff1f0',
                  color: '#d9363e',
               },
            }
         );
      }

      // Reset form (optional)
      // setCustomerId("");
      // setOrderItems([]);
      // setPickupDate("");
      // setNotes("");
   };

   return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
         <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-[#28B9F4]">
            Create New Order
         </h1>

         <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Selection */}
            <div className="bg-white rounded-xl shadow p-6">
               <div className="flex items-center mb-4">
                  <FiUser className="text-[#28B9F4] mr-2" size={20} />
                  <h2 className="text-xl font-semibold text-gray-800">
                     Customer Information
                  </h2>
               </div>{' '}
               {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                     <p>Error: {error}</p>
                  </div>
               )}
               <div className="mb-4">
                  <label
                     htmlFor="customerSearch"
                     className="block text-gray-700 mb-2"
                  >
                     Select Customer
                  </label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {isLoadingCustomers ? (
                           <FiLoader className="text-gray-400 animate-spin" />
                        ) : (
                           <FiSearch className="text-gray-400" />
                        )}
                     </div>
                     <input
                        ref={customerSearchInputRef}
                        type="text"
                        id="customerSearch"
                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28B9F4] text-gray-700"
                        placeholder={
                           isLoadingCustomers
                              ? 'Loading customers...'
                              : 'Search for a customer...'
                        }
                        value={customerSearchTerm}
                        onChange={(e) => {
                           setCustomerSearchTerm(e.target.value);
                           setIsCustomerSearching(true);
                           if (e.target.value.trim() === '') {
                              setCustomerId('');
                              setSelectedCustomer(null);
                           }
                        }}
                        onFocus={() => setIsCustomerSearching(true)}
                        disabled={isLoadingCustomers}
                     />
                  </div>

                  {/* Customer Search Results Dropdown */}
                  {isCustomerSearching && filteredCustomers.length > 0 && (
                     <div
                        ref={customerSearchResultsRef}
                        className="absolute z-10 mt-1 w-full max-w-[calc(100%-2rem)] bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
                     >
                        {filteredCustomers.map((customer) => (
                           <div
                              key={customer._id}
                              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 text-gray-700 transition-colors duration-150"
                              onClick={() => selectCustomer(customer)}
                           >
                              <div className="flex items-center">
                                 <span>{customer.name}</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}

                  {isCustomerSearching &&
                     customerSearchTerm.trim() !== '' &&
                     filteredCustomers.length === 0 && (
                        <div className="absolute z-10 mt-1 w-full max-w-[calc(100%-2rem)] bg-white shadow-lg rounded-md py-2 px-3 text-gray-500">
                           No customers found
                        </div>
                     )}
               </div>{' '}
               {selectedCustomer && (
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                     <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-[#28B9F4] text-white flex items-center justify-center">
                           <FiUser size={18} />
                        </div>
                        <div className="ml-3">
                           <p className="font-medium text-gray-800">
                              {selectedCustomer.name}
                           </p>
                           <p className="text-sm text-gray-500">
                              {selectedCustomer.phone}
                           </p>
                           {selectedCustomer.address && (
                              <p className="text-xs text-gray-500">
                                 {[
                                    selectedCustomer.address.street,
                                    selectedCustomer.address.city,
                                    selectedCustomer.address.state,
                                 ]
                                    .filter(Boolean)
                                    .join(', ')}
                              </p>
                           )}
                        </div>
                     </div>
                  </div>
               )}
            </div>

            {/* Item Selection */}
            <div className="bg-white rounded-xl shadow p-6">
               <div className="flex items-center mb-4">
                  <FiFileText className="text-[#28B9F4] mr-2" size={20} />
                  <h2 className="text-xl font-semibold text-gray-800">
                     Add Items
                  </h2>
               </div>

               <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                     <label
                        htmlFor="itemSearch"
                        className="block text-gray-700 mb-2"
                     >
                        Search Item
                     </label>{' '}
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           {isLoadingItems ? (
                              <FiLoader className="text-gray-400 animate-spin" />
                           ) : (
                              <FiSearch className="text-gray-400" />
                           )}
                        </div>
                        <input
                           ref={searchInputRef}
                           type="text"
                           id="itemSearch"
                           className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28B9F4] text-gray-700"
                           placeholder={
                              isLoadingItems
                                 ? 'Loading items...'
                                 : 'Type to search for items...'
                           }
                           value={searchTerm}
                           onChange={(e) => {
                              setSearchTerm(e.target.value);
                              setIsSearching(true);
                              if (e.target.value.trim() === '') {
                                 setSelectedItemId('');
                              }
                           }}
                           onFocus={() => setIsSearching(true)}
                           disabled={isLoadingItems}
                        />
                     </div>
                     {/* Search Results Dropdown */}
                     {isSearching && filteredItems.length > 0 && (
                        <div
                           ref={searchResultsRef}
                           className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
                        >
                           {filteredItems.map((item) => (
                              <div
                                 key={item._id}
                                 className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 text-gray-700 transition-colors duration-150"
                                 onClick={() => selectItem(item)}
                              >
                                 <div className="flex items-center justify-between">
                                    <span>{item.name}</span>
                                    <span className="text-[#28B9F4] font-medium">
                                       {(
                                          item.price ?? item.basePrice
                                       ).toLocaleString()}{' '}
                                       FCFA
                                    </span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                     {isSearching &&
                        searchTerm.trim() !== '' &&
                        filteredItems.length === 0 && (
                           <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-2 px-3 text-gray-500">
                              No items found
                           </div>
                        )}
                  </div>

                  <div className="w-full md:w-32">
                     <label
                        htmlFor="quantity"
                        className="block text-gray-700 mb-2"
                     >
                        Qty
                     </label>
                     <input
                        type="number"
                        id="quantity"
                        min="1"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28B9F4] text-gray-700"
                        value={quantity}
                        onChange={(e) =>
                           setQuantity(parseInt(e.target.value) || 1)
                        }
                     />
                  </div>

                  <div className="w-full md:w-auto self-end">
                     <button
                        type="button"
                        onClick={addItem}
                        className="w-full md:w-auto px-6 py-3 bg-[#28B9F4] text-white rounded-lg flex items-center justify-center hover:bg-[#1a9fd8] transition-all duration-200 cursor-pointer hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                        disabled={!selectedItemId}
                     >
                        <FiPlus className="mr-2" /> Add Item
                     </button>
                  </div>
               </div>

               {/* Items Table */}
               {orderItems.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                     <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                           <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Item
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Quantity
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Unit Price
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Total
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                 Action
                              </th>
                           </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                           {orderItems.map((item) => (
                              <tr key={item.id}>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                    {item.name}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {item.quantity}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {item.price.toLocaleString()} FCFA
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {(
                                       item.price * item.quantity
                                    ).toLocaleString()}{' '}
                                    FCFA
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <button
                                       type="button"
                                       onClick={() => removeItem(item.id)}
                                       className="text-red-500 hover:text-red-700 cursor-pointer transition-colors duration-200 hover:scale-110 transform"
                                       title="Remove item"
                                    >
                                       <FiTrash2 size={18} />
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               ) : (
                  <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                     No items added yet
                  </div>
               )}
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-xl shadow p-6">
               <div className="flex items-center mb-4">
                  <FiCalendar className="text-[#28B9F4] mr-2" size={20} />
                  <h2 className="text-xl font-semibold text-gray-800">
                     Order Details
                  </h2>
               </div>

               <div className="mb-4">
                  <label
                     htmlFor="pickupDate"
                     className="block text-gray-700 mb-2"
                  >
                     Expected Pickup Date
                  </label>
                  <input
                     type="date"
                     id="pickupDate"
                     className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28B9F4] text-gray-700"
                     value={pickupDate}
                     onChange={(e) => setPickupDate(e.target.value)}
                     required
                  />
               </div>

               <div className="mb-4">
                  <label htmlFor="notes" className="block text-gray-700 mb-2">
                     Notes (Optional)
                  </label>
                  <textarea
                     id="notes"
                     rows={3}
                     className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28B9F4] text-gray-700"
                     value={notes}
                     onChange={(e) => setNotes(e.target.value)}
                     placeholder="Any special instructions..."
                  />
               </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow p-6">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                     Order Summary
                  </h2>
                  <div className="text-xl font-bold text-[#28B9F4]">
                     {calculateTotal().toLocaleString()} FCFA
                  </div>
               </div>

               <div className="mt-6 flex justify-end">
                  <button
                     type="submit"
                     className="w-full md:w-auto px-8 py-4 bg-[#28B9F4] text-white rounded-lg flex items-center justify-center hover:bg-[#1a9fd8] transition-all duration-200 text-lg font-medium cursor-pointer hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                     disabled={
                        !customerId || orderItems.length === 0 || !pickupDate
                     }
                  >
                     <FiSave className="mr-2" /> Submit Order
                  </button>
               </div>
            </div>
         </form>
      </div>
   );
}
