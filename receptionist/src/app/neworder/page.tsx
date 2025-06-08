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
} from 'react-icons/fi';

// Sample data - in a real app, this would come from an API
const CUSTOMERS = [
   { id: 1, name: 'John Doe' },
   { id: 2, name: 'Jane Smith' },
   { id: 3, name: 'Robert Johnson' },
   { id: 4, name: 'Emily Davis' },
];

const LAUNDRY_ITEMS = [
   { id: 1, name: 'Shirt', price: 1500 },
   { id: 2, name: 'Pants', price: 2000 },
   { id: 3, name: 'Dress', price: 3500 },
   { id: 4, name: 'Suit', price: 5000 },
   { id: 5, name: 'Blanket', price: 4000 },
];

interface OrderItem {
   id: number;
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

   // New states for item search
   const [searchTerm, setSearchTerm] = useState<string>('');
   const [isSearching, setIsSearching] = useState<boolean>(false);
   const [filteredItems, setFilteredItems] = useState<typeof LAUNDRY_ITEMS>([]);
   const searchInputRef = useRef<HTMLInputElement>(null);
   const searchResultsRef = useRef<HTMLDivElement>(null);

   // Filter items when search term changes
   useEffect(() => {
      if (searchTerm.trim() === '') {
         setFilteredItems([]);
         return;
      }

      const filtered = LAUNDRY_ITEMS.filter((item) =>
         item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredItems(filtered);
   }, [searchTerm]);

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
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, []);

   const selectItem = (item: (typeof LAUNDRY_ITEMS)[0]) => {
      setSelectedItemId(String(item.id));
      setSearchTerm(item.name);
      setIsSearching(false);
   };

   const addItem = () => {
      if (!selectedItemId) return;

      const itemToAdd = LAUNDRY_ITEMS.find(
         (item) => item.id === parseInt(selectedItemId)
      );
      if (!itemToAdd) return;

      const existingItem = orderItems.find((item) => item.id === itemToAdd.id);

      if (existingItem) {
         // Update quantity if item already exists
         setOrderItems(
            orderItems.map((item) =>
               item.id === itemToAdd.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
            )
         );
      } else {
         // Add new item
         setOrderItems([...orderItems, { ...itemToAdd, quantity }]);
      }

      // Reset selection
      setSelectedItemId('');
      setQuantity(1);
   };

   const removeItem = (id: number) => {
      setOrderItems(orderItems.filter((item) => item.id !== id));
   };

   const calculateTotal = () => {
      return orderItems.reduce(
         (sum, item) => sum + item.price * item.quantity,
         0
      );
   };

   const handleSubmit = (e: React.FormEvent) => {
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
      // Call API endpoint here

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
               </div>

               <div className="mb-4">
                  <label
                     htmlFor="customer"
                     className="block text-gray-700 mb-2"
                  >
                     Select Customer
                  </label>
                  <select
                     id="customer"
                     className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28B9F4] text-gray-700"
                     value={customerId}
                     onChange={(e) => setCustomerId(e.target.value)}
                     required
                  >
                     <option value="">-- Select a customer --</option>
                     {CUSTOMERS.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                           {customer.name}
                        </option>
                     ))}
                  </select>
               </div>
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
                     </label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <FiSearch className="text-gray-400" />
                        </div>
                        <input
                           ref={searchInputRef}
                           type="text"
                           id="itemSearch"
                           className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#28B9F4] text-gray-700"
                           placeholder="Type to search for items..."
                           value={searchTerm}
                           onChange={(e) => {
                              setSearchTerm(e.target.value);
                              setIsSearching(true);
                              if (e.target.value.trim() === '') {
                                 setSelectedItemId('');
                              }
                           }}
                           onFocus={() => setIsSearching(true)}
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
                                 key={item.id}
                                 className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 text-gray-700 transition-colors duration-150"
                                 onClick={() => selectItem(item)}
                              >
                                 <div className="flex items-center justify-between">
                                    <span>{item.name}</span>
                                    <span className="text-[#28B9F4] font-medium">
                                       {item.price.toLocaleString()} FCFA
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
