'use client';

import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Image from 'next/image';
import Sidebar from './Sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

const geistSans = Geist({
   variable: '--font-geist-sans',
   subsets: ['latin'],
});
const geistMono = Geist_Mono({
   variable: '--font-geist-mono',
   subsets: ['latin'],
});

export default function RootLayoutClient({
   children,
}: {
   children: React.ReactNode;
}) {
   const router = useRouter();
   const pathname = usePathname();
   const isLoginPage = pathname === '/login';
   const [isAuthorized, setIsAuthorized] = useState(true);
   const [userName, setUserName] = useState('Receptionist');
   useEffect(() => {
      // Skip authorization check for login page
      if (isLoginPage) return;

      // Check user role
      const userRole = localStorage.getItem('user_role');
      const authToken = localStorage.getItem('auth_token');
      const storedName = localStorage.getItem('user_name');

      if (!authToken) {
         // If no token, redirect to login
         router.push('/login');
         return;
      }

      // Only receptionist and admin roles are allowed
      const isAllowedRole = userRole === 'receptionist' || userRole === 'admin';

      if (!isAllowedRole) {
         setIsAuthorized(false);
         // Redirect to login with a brief delay to allow for message to be seen
         const timer = setTimeout(() => router.push('/login'), 3000);
         return () => clearTimeout(timer); // Cleanup timeout on unmount
      }

      if (!isAuthorized) {
         setIsAuthorized(true);
      }

      // Set user name only if needed
      if (storedName && storedName !== userName) {
         setUserName(storedName);
      }
   }, [isLoginPage, router, isAuthorized, userName]);
   return (
      <body
         className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white min-h-screen`}
      >
         {isLoginPage ? (
            <>{children}</>
         ) : !isAuthorized ? (
            <div className="flex items-center justify-center min-h-screen bg-red-50">
               <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                  <div className="text-red-500 text-5xl mb-4">⚠️</div>
                  <h1 className="text-2xl font-bold text-red-700 mb-2">
                     Access Denied
                  </h1>
                  <p className="text-gray-600 mb-4">
                     You do not have permission to access this dashboard. Only
                     receptionists and admins are authorized.
                  </p>
                  <p className="text-gray-500 text-sm">
                     Redirecting to login page...
                  </p>
               </div>
            </div>
         ) : (
            <div className="flex min-h-screen bg-[#28B9F4]">
               {/* Sidebar */}
               <Sidebar />
               {/* Main content area */}
               <div className="flex-1 flex flex-col min-h-screen">
                  {/* Top bar */}{' '}
                  <header className="flex items-center justify-between bg-white shadow rounded-b-3xl ml-10 px-8 py-5 mb-6 sticky top-0 z-20">
                     <div className="text-lg font-semibold text-gray-800">
                        Welcome,
                        <span className="text-[#28B9F4]"> {userName}!</span>
                     </div>
                     <div className="flex items-center gap-4">
                        {' '}
                        <button
                           onClick={() => {
                              if (typeof window !== 'undefined') {
                                 // First clear storage
                                 localStorage.removeItem('auth_token');
                                 localStorage.removeItem('user_role');
                                 localStorage.removeItem('user_name');

                                 // Show toast notification
                                 toast.success('Logged out successfully', {
                                    icon: '👋',
                                    style: {
                                       borderRadius: '10px',
                                       background: '#f0f9ff',
                                       color: '#0369a1',
                                    },
                                 });

                                 // Navigate immediately rather than with a timeout
                                 router.push('/login');
                              }
                           }}
                           className="px-3 py-1 text-sm text-white bg-[#28B9F4] rounded-full hover:bg-[#1a9dd6] transition"
                        >
                           Logout
                        </button>
                        <Image
                           src="/profile-avatar.png"
                           alt="Profile"
                           width={40}
                           height={40}
                           className="w-10 h-10 rounded-full shadow object-cover border-2 border-[#28B9F4]"
                           priority
                        />
                     </div>{' '}
                  </header>
                  <main className="flex-1 px-4 md:px-8 pb-8">{children}</main>
                  {/* Toast container */}
                  <Toaster
                     position="top-right"
                     toastOptions={{
                        duration: 4000,
                        style: {
                           background: '#fff',
                           color: '#333',
                        },
                        success: {
                           iconTheme: {
                              primary: '#28B9F4',
                              secondary: '#fff',
                           },
                        },
                     }}
                  />
               </div>
            </div>
         )}
      </body>
   );
}
