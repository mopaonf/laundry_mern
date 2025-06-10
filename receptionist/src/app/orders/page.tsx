'use client';

import { useState, useEffect, useCallback } from 'react';
// Remove unused Link import
import {
   FiSearch,
   FiEye,
   FiCalendar,
   FiUser,
   FiDollarSign,
   FiLoader,
   FiAlertCircle,
   FiRefreshCw,
   FiX,
   // Remove unused FiCheckCircle import
} from 'react-icons/fi';

// Add Google Fonts import
import { Pacifico } from 'next/font/google';
import { useOrderStore, Order } from '@/store/orderStore';
import { useAppToast } from '@/hooks/useAppToast';

// Initialize the font
const pacifico = Pacifico({
   weight: '400',
   subsets: ['latin'],
   display: 'swap',
});

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
   'In Progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
   'Ready for Pickup': 'bg-blue-100 text-blue-700 border-blue-200',
   Completed: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function OrdersPage() {
   const [activeTab, setActiveTab] = useState('All');
   const [searchQuery, setSearchQuery] = useState('');
   const { orders, isLoading, error, fetchOrders, updateOrderStatus } =
      useOrderStore();
   const toast = useAppToast();
   const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [updatingStatus, setUpdatingStatus] = useState(false);

   // Use useCallback to memoize the loadOrders function
   const loadOrders = useCallback(async () => {
      const loadingToastId = toast.loading('Fetching orders...');
      try {
         await fetchOrders();
         toast.dismiss(loadingToastId);
         toast.success('Orders loaded successfully');
      } catch (err) {
         toast.dismiss(loadingToastId);
         toast.error(
            `Failed to load orders: ${
               err instanceof Error ? err.message : 'Unknown error'
            }`
         );
      }
   }, [fetchOrders, toast]);

   // Fetch orders on component mount - with empty dependency array
   useEffect(() => {
      loadOrders();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []); // Empty dependency array to run only once on mount

   // Filter orders based on active tab and search query
   const filteredOrders = orders.filter((order: Order) => {
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

   // Handle opening the modal with specific order
   const openOrderModal = (order: Order) => {
      setSelectedOrder(order);
      setIsModalOpen(true);
   };

   // Handle closing the modal
   const closeModal = () => {
      setIsModalOpen(false);
      setSelectedOrder(null);
   };

   // Handle status change
   const handleStatusChange = async (newStatus: string) => {
      if (!selectedOrder) return;

      setUpdatingStatus(true);
      const loadingToastId = toast.loading('Updating order status...');

      try {
         await updateOrderStatus(selectedOrder.id, newStatus);
         toast.dismiss(loadingToastId);
         toast.success(`Order status updated to ${newStatus}`);
         closeModal();
      } catch (err) {
         toast.dismiss(loadingToastId);
         toast.error(
            `Failed to update order status: ${
               err instanceof Error ? err.message : 'Unknown error'
            }`
         );
      } finally {
         setUpdatingStatus(false);
      }
   };

   return (
      <div className="p-4 md:p-8 space-y-6">
         {' '}
         {/* Enhanced header styling */}
         <div className="relative pb-2 mb-4 md:mb-6 mt-2 md:mt-0">
            <h1
               className={`text-2xl sm:text-3xl md:text-4xl ${pacifico.className} text-gray-100 relative z-10`}
            >
               Orders
            </h1>
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#28B9F4] to-transparent w-24 md:w-32"></div>
            <div className="absolute -bottom-1 left-0 h-[3px] bg-gray-100 w-full"></div>
         </div>
         {/* Filter and Search Bar */}
         <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
            {/* Status Tabs - updated with cursor and hover effects */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-1 px-1">
               {['All', 'In Progress', 'Ready for Pickup', 'Completed'].map(
                  (tab) => (
                     <button
                        key={tab}
                        className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-lg text-center min-w-[90px] md:min-w-[120px] cursor-pointer transform transition-all duration-200 hover:shadow-md ${
                           activeTab === tab
                              ? 'bg-[#28B9F4] text-white hover:bg-[#1a9fd8]'
                              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-[#28B9F4]'
                        } whitespace-nowrap flex-shrink-0`}
                        onClick={() => setActiveTab(tab)}
                     >
                        {tab}
                     </button>
                  )
               )}
            </div>

            {/* Search Input - with mobile optimizations */}
            <div className="relative w-full md:w-64">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
               </div>
               <input
                  type="text"
                  className="pl-10 p-2 w-full border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#28B9F4] text-sm"
                  placeholder="Search order or customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
         </div>
         {/* Orders Table - Desktop View */} {/* Loading state */}
         {isLoading && (
            <div className="bg-white rounded-xl shadow p-12 flex flex-col items-center justify-center">
               <FiLoader className="w-12 h-12 text-[#28B9F4] animate-spin mb-4" />
               <p className="text-gray-600 text-lg">Loading orders...</p>
            </div>
         )}
         {/* Error state */}
         {error && !isLoading && (
            <div className="bg-white rounded-xl shadow p-12 flex flex-col items-center justify-center">
               <FiAlertCircle className="w-12 h-12 text-red-500 mb-4" />
               <p className="text-gray-700 text-lg mb-4">
                  Failed to load orders
               </p>
               <p className="text-gray-500 mb-6">{error}</p>
               <button
                  onClick={() => fetchOrders()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#28B9F4] text-white rounded-lg hover:bg-[#1a9fd8] transition-all"
               >
                  <FiRefreshCw /> Try Again
               </button>
            </div>
         )}
         {/* Table view - only show when not loading and no errors */}
         {!isLoading && !error && (
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
                        filteredOrders.map((order: Order) => (
                           <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                 #{order.id.substring(order.id.length - 5)}
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
                                 <button
                                    onClick={() => openOrderModal(order)}
                                    className="text-[#28B9F4] hover:text-[#1a9fd8] inline-flex items-center gap-1 transition-all duration-200 hover:underline cursor-pointer"
                                 >
                                    <FiEye className="w-4 h-4" />
                                    <span>View</span>
                                 </button>
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
         )}
         {/* Orders Cards - Mobile View - only show when not loading and no errors */}
         {!isLoading && !error && (
            <div className="md:hidden space-y-4">
               {filteredOrders.length > 0 ? (
                  filteredOrders.map((order: Order) => (
                     <div
                        key={order.id}
                        className="bg-white rounded-xl shadow p-4 space-y-3"
                     >
                        <div className="flex justify-between items-start">
                           <h3 className="font-bold text-gray-900">
                              #{order.id.substring(order.id.length - 5)}
                           </h3>
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

                        <button
                           onClick={() => openOrderModal(order)}
                           className="w-full py-2 bg-white border border-[#28B9F4] text-[#28B9F4] rounded-lg flex items-center justify-center hover:bg-[#f0f9fe] transition-all duration-200 hover:shadow-md cursor-pointer transform hover:scale-[1.01]"
                        >
                           <FiEye className="mr-2" /> View Order
                        </button>
                     </div>
                  ))
               ) : (
                  <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                     No orders found matching your criteria
                  </div>
               )}
            </div>
         )}
         {/* Loading state - Mobile */}
         {isLoading && (
            <div className="md:hidden bg-white rounded-xl shadow p-8 flex flex-col items-center justify-center">
               <FiLoader className="w-8 h-8 text-[#28B9F4] animate-spin mb-3" />
               <p className="text-gray-600">Loading orders...</p>
            </div>
         )}
         {/* Error state - Mobile */}
         {error && !isLoading && (
            <div className="md:hidden bg-white rounded-xl shadow p-8 flex flex-col items-center justify-center">
               <FiAlertCircle className="w-8 h-8 text-red-500 mb-3" />
               <p className="text-gray-700 mb-2">Failed to load orders</p>
               <p className="text-gray-500 text-sm mb-4">{error}</p>
               <button
                  onClick={() => fetchOrders()}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#28B9F4] text-white text-sm rounded-lg hover:bg-[#1a9fd8] transition-all"
               >
                  <FiRefreshCw size={14} /> Try Again
               </button>
            </div>
         )}
         {/* Order Detail Modal */}
         {isModalOpen && selectedOrder && (
            <div
               className="fixed inset-0  z-50 flex justify-center items-center p-4"
               style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
            >
               {' '}
               <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between p-4 md:p-6 border-b sticky top-0 bg-white z-10">
                     <h3 className="text-lg md:text-2xl font-semibold text-gray-800">
                        Order #
                        {selectedOrder.id.substring(
                           selectedOrder.id.length - 5
                        )}
                     </h3>
                     <button
                        onClick={closeModal}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                     >
                        <FiX className="w-5 h-5 text-gray-500" />
                     </button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-4 md:p-6 space-y-6">
                     {/* Customer Info */}
                     <div className="bg-gray-50 pl-0 p-4 rounded-lg">
                        <h4 className="text-sm uppercase text-gray-900 mb-2">
                           Customer Information
                        </h4>
                        <div className="flex items-center mb-2">
                           <FiUser className="w-5 h-5 mr-3 text-gray-400" />
                           <span className="font-medium text-[#28B9F4]">
                              {selectedOrder.customer}
                           </span>
                        </div>
                        {selectedOrder.phone && (
                           <div className="flex items-center">
                              <span className="w-5 h-5 mr-3 inline-block"></span>
                              <span>{selectedOrder.phone}</span>
                           </div>
                        )}
                     </div>{' '}
                     {/* Order Details */}
                     <div>
                        <h4 className="text-sm uppercase text-gray-900 mb-3">
                           Order Details
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div>
                              <p className="text-gray-500 text-sm">
                                 Drop-off Date
                              </p>
                              <p className="font-medium text-[#28B9F4]">
                                 {formatDate(selectedOrder.dropOffDate)}
                              </p>
                           </div>
                           <div>
                              <p className="text-gray-500 text-sm">
                                 Pickup Date
                              </p>
                              <p className="font-medium text-[#28B9F4]">
                                 {selectedOrder.pickupDate
                                    ? formatDate(selectedOrder.pickupDate)
                                    : 'Not scheduled'}
                              </p>
                           </div>
                           <div>
                              <p className="text-gray-500 text-sm">
                                 Current Status
                              </p>
                              <p className="font-medium ">
                                 <span
                                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                                       STATUS_COLORS[selectedOrder.status]
                                    }`}
                                 >
                                    {selectedOrder.status}
                                 </span>
                              </p>
                           </div>
                           <div>
                              <p className="text-gray-500 text-sm">
                                 Total Amount
                              </p>
                              <p className="font-medium text-[#28B9F4]">
                                 {selectedOrder.total}
                              </p>
                           </div>
                        </div>
                     </div>
                     {/* Order Items */}
                     {selectedOrder.items && selectedOrder.items.length > 0 && (
                        <div>
                           <h4 className="text-sm uppercase text-gray-500 mb-3">
                              Items
                           </h4>
                           <div className="bg-gray-50 rounded-lg overflow-hidden">
                              <table className="min-w-full divide-y divide-gray-200">
                                 <thead className="bg-gray-100">
                                    <tr>
                                       <th
                                          scope="col"
                                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                                       >
                                          Item
                                       </th>
                                       <th
                                          scope="col"
                                          className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                                       >
                                          Quantity
                                       </th>
                                       <th
                                          scope="col"
                                          className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase"
                                       >
                                          Price
                                       </th>
                                    </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-200">
                                    {selectedOrder.items.map((item, idx) => (
                                       <tr key={idx}>
                                          <td className="px-4 py-3 text-sm text-gray-700">
                                             {item.name}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-right text-gray-700">
                                             {item.quantity}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-700">
                                             {item.price}
                                          </td>
                                       </tr>
                                    ))}
                                 </tbody>
                                 <tfoot className="bg-gray-50">
                                    <tr>
                                       <td className="px-4 py-3 text-sm font-medium text-[#28B9F4]">
                                          Total
                                       </td>
                                       <td className="px-4 py-3 "></td>
                                       <td className="px-4 py-3 text-right text-sm font-bold text-[#28B9F4]">
                                          {selectedOrder.total}
                                       </td>
                                    </tr>
                                 </tfoot>
                              </table>
                           </div>
                        </div>
                     )}
                     {/* Update Status */}
                     <div className="border-t pt-5">
                        <h4 className="text-sm uppercase text-gray-500 mb-3">
                           Update Status
                        </h4>
                        <div className="flex flex-wrap gap-2">
                           {[
                              'In Progress',
                              'Ready for Pickup',
                              'Completed',
                           ].map((status) => (
                              <button
                                 key={status}
                                 disabled={
                                    updatingStatus ||
                                    selectedOrder.status === status
                                 }
                                 onClick={() => handleStatusChange(status)}
                                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                                    ${
                                       selectedOrder.status === status
                                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                          : 'bg-white border border-[#28B9F4] text-[#28B9F4] hover:bg-[#f0f9fe] hover:shadow-sm cursor-pointer'
                                    }
                                 `}
                              >
                                 {status}
                              </button>
                           ))}
                        </div>
                     </div>
                     {/* Notes */}
                     {selectedOrder.notes && (
                        <div>
                           <h4 className="text-sm uppercase text-gray-500 mb-2">
                              Notes
                           </h4>
                           <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-gray-700">
                              {selectedOrder.notes}
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Modal Footer */}
                  <div className="border-t p-4 md:p-6 flex justify-end">
                     <button
                        onClick={closeModal}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
                     >
                        Close
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
}
