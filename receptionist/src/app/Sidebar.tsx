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
   FiMenu,
   FiX,
} from 'react-icons/fi';
import { useState, useEffect } from 'react';

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
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

   // Close mobile menu when navigation occurs
   useEffect(() => {
      setMobileMenuOpen(false);
   }, [pathname]);

   // Handle body scroll lock when mobile menu is open
   useEffect(() => {
      if (mobileMenuOpen) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = '';
      }
      return () => {
         document.body.style.overflow = '';
      };
   }, [mobileMenuOpen]);

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
      <>
         {/* Mobile menu button - only visible on small screens */}
         <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
         >
            {mobileMenuOpen ? (
               <FiX size={24} className="text-[#28B9F4]" />
            ) : (
               <FiMenu size={24} className="text-[#28B9F4]" />
            )}
         </button>

         {/* Desktop sidebar - hidden on mobile */}
         <aside className="hidden md:flex flex-col w-64 bg-white shadow-lg rounded-r-3xl p-6 transition-all duration-300 z-30">
            <div className="mb-10 flex flex-col items-center gap-2">
               <img
                  src="/images/PL.png"
                  alt="Le panier à linge"
                  className="h-14 w-auto"
               />
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

         {/* Mobile menu overlay */}
         {mobileMenuOpen && (
            <div
               className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
               onClick={() => setMobileMenuOpen(false)}
            />
         )}

         {/* Mobile sidebar menu - slides in from left */}
         <aside
            className={`md:hidden fixed inset-y-0 left-0 w-64 bg-white shadow-lg p-6 transform transition-transform duration-300 ease-in-out z-40 ${
               mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
         >
            <div className="mb-10 flex items-center gap-2 mt-8">
               <img
                  src="/images/PL.png"
                  alt="Le panier à linge"
                  className="h-8 w-auto"
               />
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
      </>
   );
}
