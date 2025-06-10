'use client';

import toast, { Renderable } from 'react-hot-toast';

// Define toast types
type ToastType = 'success' | 'error' | 'info' | 'loading' | 'custom';

interface ToastOptions {
   duration?: number;
   icon?: Renderable;
   position?:
      | 'top-left'
      | 'top-center'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-center'
      | 'bottom-right';
}

// Default styles based on toast type
const getToastStyle = (type: ToastType) => {
   switch (type) {
      case 'success':
         return {
            borderRadius: '10px',
            background: '#effff8',
            color: '#1d7a4c',
         };
      case 'error':
         return {
            borderRadius: '10px',
            background: '#fff1f0',
            color: '#d9363e',
         };
      case 'info':
         return {
            borderRadius: '10px',
            background: '#f0f9ff',
            color: '#0369a1',
         };
      case 'loading':
         return {
            borderRadius: '10px',
            background: '#f5f5f5',
            color: '#525252',
         };
      default:
         return {
            borderRadius: '10px',
         };
   }
};

// Default icons based on toast type
const getToastIcon = (type: ToastType, customIcon?: Renderable) => {
   if (customIcon) return customIcon;

   switch (type) {
      case 'success':
         return '✅';
      case 'error':
         return '❌';
      case 'info':
         return 'ℹ️';
      case 'loading':
         return '⏳';
      default:
         return undefined;
   }
};

/**
 * Custom hook for consistent toast notifications
 */
export const useAppToast = () => {
   const showToast = (
      message: string,
      type: ToastType = 'info',
      options: ToastOptions = {}
   ) => {
      const style = getToastStyle(type);
      const icon = options.icon || getToastIcon(type);
      const duration = options.duration || (type === 'error' ? 5000 : 3000);
      const position = options.position || 'top-right';

      switch (type) {
         case 'success':
            return toast.success(message, {
               icon,
               duration,
               position,
               style,
            });
         case 'error':
            return toast.error(message, {
               icon,
               duration,
               position,
               style,
            });
         case 'loading':
            return toast.loading(message, {
               position,
               style,
            });
         default:
            return toast(message, {
               icon,
               duration,
               position,
               style,
            });
      }
   };

   return {
      success: (message: string, options: ToastOptions = {}) =>
         showToast(message, 'success', options),

      error: (message: string, options: ToastOptions = {}) =>
         showToast(message, 'error', options),

      info: (message: string, options: ToastOptions = {}) =>
         showToast(message, 'info', options),

      loading: (message: string, options: ToastOptions = {}) =>
         showToast(message, 'loading', options),

      custom: (message: string, options: ToastOptions = {}) =>
         showToast(message, 'custom', options),

      dismiss: toast.dismiss,
   };
};
