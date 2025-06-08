'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
   FiHome,
   FiPlusCircle,
   FiList,
   FiUsers,
   FiSettings,
   FiLogOut,
} from 'react-icons/fi';
import { useState } from 'react';

const navLinks = [
   { href: '/', label: 'Dashboard', icon: <FiHome size={20} /> },
   {
      href: '/neworder',
      label: 'New Order',
      icon: <FiPlusCircle size={20} />,
   },
   { href: '/orders', label: 'Orders', icon: <FiList size={20} /> },
   { href: '/customers', label: 'Customers', icon: <FiUsers size={20} /> },
   { href: '/settings', label: 'Settings', icon: <FiSettings size={20} /> },
];

export default function Sidebar() {
   const pathname = usePathname();
   const router = useRouter();
   const [isLoggingOut, setIsLoggingOut] = useState(false);

   const handleLogout = async () => {
      try {
         setIsLoggingOut(true);

         // You can replace this with your actual logout API call
         // For example: await signOut() or await fetch('/api/logout')
         await new Promise((resolve) => setTimeout(resolve, 500)); // Simulating API call

         // Clear any stored credentials
         localStorage.removeItem('auth_token');
         sessionStorage.removeItem('user_data');

         // Redirect to login page
         router.push('/login');
      } catch (error) {
         console.error('Logout failed:', error);
      } finally {
         setIsLoggingOut(false);
      }
   };

   return (
      <aside className="hidden md:flex flex-col w-64 bg-white shadow-lg rounded-r-3xl p-6 transition-all duration-300 md:relative fixed md:static z-30">
         <div className="mb-10 flex items-center gap-2">
            <span className="text-2xl font-bold text-[#28B9F4]">
               LaundryPro
            </span>
         </div>
         <nav className="flex-1">
            <ul className="space-y-2">
               {navLinks.map((link) => (
                  <li key={link.href}>
                     <Link
                        href={link.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-gray-700 hover:bg-[#e6f6fd] hover:text-[#28B9F4] ${
                           pathname === link.href
                              ? 'bg-[#28B9F4] text-white shadow'
                              : ''
                        }`}
                     >
                        <span>{link.icon}</span>
                        <span className="text-base">{link.label}</span>
                     </Link>
                  </li>
               ))}
            </ul>
         </nav>
         <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-10 flex items-center gap-3 w-full cursor-pointer hover:bg-[#e6f6fd] rounded-lg px-4 py-3 transition-colors"
         >
            <FiLogOut size={20} className="text-[#28B9F4]" />
            <span className="text-gray-700 font-medium">
               {isLoggingOut ? 'Logging out...' : 'Logout'}
            </span>
         </button>
      </aside>
   );
}
