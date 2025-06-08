import {
   FiShoppingBag,
   FiClock,
   FiCheckCircle,
   FiDollarSign,
} from 'react-icons/fi';

const summary = [
   {
      label: 'Total Orders Today',
      value: 32,
      icon: <FiShoppingBag size={28} className="text-[#28B9F4]" />,
   },
   {
      label: 'Orders In Progress',
      value: 12,
      icon: <FiClock size={28} className="text-[#28B9F4]" />,
   },
   {
      label: 'Orders Ready for Pickup',
      value: 8,
      icon: <FiCheckCircle size={28} className="text-[#28B9F4]" />,
   },
   {
      label: 'Earnings Today',
      value: '200,500',
      icon: <FiDollarSign size={28} className="text-[#28B9F4]" />,
   },
];

const recentOrders = [
   {
      id: 'ORD-1001',
      customer: 'Amit Sharma',
      status: 'In Progress',
      date: '2024-07-08',
      total: '₹300',
   },
   {
      id: 'ORD-1000',
      customer: 'Priya Singh',
      status: 'Ready',
      date: '2024-07-08',
      total: '₹450',
   },
   {
      id: 'ORD-0999',
      customer: 'Rahul Verma',
      status: 'Completed',
      date: '2024-07-08',
      total: '₹220',
   },
   {
      id: 'ORD-0998',
      customer: 'Sneha Patel',
      status: 'In Progress',
      date: '2024-07-08',
      total: '₹380',
   },
   {
      id: 'ORD-0997',
      customer: 'Vikas Kumar',
      status: 'Ready',
      date: '2024-07-08',
      total: '₹500',
   },
];

const statusColors: Record<string, string> = {
   'In Progress': 'bg-yellow-100 text-yellow-700',
   Ready: 'bg-blue-100 text-blue-700',
   Completed: 'bg-green-100 text-green-700',
};

export default function Home() {
   return (
      <div className="p-4 md:p-8 space-y-10">
         <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
         {/* Summary Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {summary.map((item) => (
               <div
                  key={item.label}
                  className="bg-white rounded-2xl shadow flex items-center gap-4 p-6"
               >
                  <div className="flex-shrink-0">{item.icon}</div>
                  <div>
                     <div className="text-2xl font-bold text-gray-900">
                        {item.value}
                     </div>
                     <div className="text-gray-500 text-sm">{item.label}</div>
                  </div>
               </div>
            ))}
         </div>
         {/* Recent Orders Table */}
         <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
               Recent Orders
            </h2>
            <div className="overflow-x-auto bg-white rounded-2xl shadow">
               <table className="min-w-full text-sm">
                  <thead>
                     <tr className="bg-gray-50 text-gray-600">
                        <th className="px-6 py-3 text-left font-semibold">
                           Order ID
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
                     {recentOrders.map((order) => (
                        <tr
                           key={order.id}
                           className="border-t last:border-b hover:bg-gray-50 transition text-gray-700"
                        >
                           <td className="px-6 py-3 font-mono">{order.id}</td>
                           <td className="px-6 py-3">{order.customer}</td>
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
         </div>
      </div>
   );
}
