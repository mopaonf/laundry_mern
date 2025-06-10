'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginReceptionist } from '@/store/auth';
import toast from 'react-hot-toast';

export default function Login() {
   const router = useRouter();
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState('');
   const [emailError, setEmailError] = useState('');
   const [passwordError, setPasswordError] = useState('');

   const validateForm = () => {
      let isValid = true;
      setEmailError('');
      setPasswordError('');

      if (!email.trim()) {
         setEmailError('Email is required');
         isValid = false;
      } else if (!/^\S+@\S+\.\S+$/.test(email)) {
         setEmailError('Please enter a valid email address');
         isValid = false;
      }

      if (!password) {
         setPasswordError('Password is required');
         isValid = false;
      }

      return isValid;
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!validateForm()) return;

      setIsLoading(true);
      try {
         // Show loading toast
         const loadingToast = toast.loading('Signing in...');

         const result = await loginReceptionist(email, password);
         localStorage.setItem('auth_token', result.token);
         localStorage.setItem('user_role', result.role);
         localStorage.setItem('user_name', result.name);

         // Only allow receptionist and admin roles to access the dashboard
         if (result.role !== 'receptionist' && result.role !== 'admin') {
            // Dismiss loading toast
            toast.dismiss(loadingToast);

            throw new Error(
               'Access denied: Only receptionists and admins can access this dashboard'
            );
         }

         // Dismiss loading toast and show success toast
         toast.dismiss(loadingToast);
         toast.success(`Welcome, ${result.name}!`, {
            icon: '👋',
            style: {
               borderRadius: '10px',
               background: '#effff8',
               color: '#1d7a4c',
            },
         });

         router.push('/');
      } catch (err: Error | unknown) {
         const errorMessage =
            err instanceof Error
               ? err.message
               : 'Login failed. Please check your credentials.';
         setError(errorMessage);

         // Show error toast
         toast.error(errorMessage, {
            icon: '🔒',
            duration: 5000,
            style: {
               borderRadius: '10px',
               background: '#fff1f0',
               color: '#d9363e',
            },
         });
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
         <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
            <div className="text-center">
               {' '}
               <div className="flex justify-center">
                  {/* Client's logo */}
                  <img
                     src="/images/PL.png"
                     alt="Le panier à linge"
                     className="w-32 h-32 object-contain"
                  />
               </div>
               <p className="mt-2 text-sm text-gray-600">Receptionist Portal</p>
            </div>
            {error && (
               <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                  <div className="flex">
                     <div>
                        <p className="text-sm text-red-700">{error}</p>
                     </div>
                  </div>
               </div>
            )}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
               <div className="rounded-md shadow-sm space-y-4">
                  <div>
                     <label htmlFor="email-address" className="sr-only">
                        Email address
                     </label>
                     <input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className={`appearance-none rounded-lg relative block w-full px-4 py-3 border ${
                           emailError ? 'border-red-500' : 'border-gray-300'
                        } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#28B9F4] focus:border-[#28B9F4]`}
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                     />
                     {emailError && (
                        <p className="mt-1 text-sm text-red-600">
                           {emailError}
                        </p>
                     )}
                  </div>

                  <div>
                     <label htmlFor="password" className="sr-only">
                        Password
                     </label>
                     <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        className={`appearance-none rounded-lg relative block w-full px-4 py-3 border ${
                           passwordError ? 'border-red-500' : 'border-gray-300'
                        } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#28B9F4] focus:border-[#28B9F4]`}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                     />
                     {passwordError && (
                        <p className="mt-1 text-sm text-red-600">
                           {passwordError}
                        </p>
                     )}
                  </div>
               </div>

               <div>
                  <button
                     type="submit"
                     disabled={isLoading}
                     className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-md font-medium rounded-lg text-white bg-[#28B9F4] hover:bg-[#1a9fd8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#28B9F4] transition-all duration-200 disabled:opacity-70"
                  >
                     {isLoading ? (
                        <svg
                           className="animate-spin h-5 w-5 text-white"
                           xmlns="http://www.w3.org/2000/svg"
                           fill="none"
                           viewBox="0 0 24 24"
                        >
                           <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                           ></circle>
                           <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                           ></path>
                        </svg>
                     ) : (
                        'Login'
                     )}
                  </button>
               </div>

               <div className="flex items-center justify-center">
                  <div className="text-sm">
                     <a
                        href="#"
                        className="font-medium text-[#28B9F4] hover:text-[#1a9fd8]"
                     >
                        Forgot your password?
                     </a>
                  </div>
               </div>
            </form>{' '}
            <div className="text-center text-xs text-gray-500 mt-8">
               <p>© 2024 Le panier à linge. All rights reserved.</p>
            </div>
         </div>
      </div>
   );
}
