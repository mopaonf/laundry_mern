import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useSegments, useRootNavigationState, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Hook that handles authentication state initialization and redirects
 * based on authentication status.
 *
 * This hook should be used in the root layout to initialize auth state.
 */
export function useAuthInitialization() {
   const { user, token, initAuth } = useAuthStore();
   const [isInitialized, setIsInitialized] = useState(false);
   const segments = useSegments();
   // Use this with caution - can be null during initial render
   const navigationState = useRootNavigationState();

   // Initialize authentication state
   useEffect(() => {
      const initialize = async () => {
         try {
            await initAuth();
            setIsInitialized(true);
         } catch (error) {
            console.error('Auth initialization failed:', error);
            // Clear any potentially corrupted auth data
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userData');
            setIsInitialized(true);
         }
      };

      initialize();
   }, [initAuth]); // Handle navigation based on authentication state
   useEffect(() => {
      // Wait until auth is initialized and navigation is ready
      if (!isInitialized) return;

      // Need to make sure navigation state exists
      if (!navigationState || navigationState.stale) return;

      const isAuthenticated = !!token;

      try {
         // Handle navigation based on the current path
         const currentPath = segments.join('/');

         // Simple checks that don't rely on specific segment values
         const isHomePath = currentPath === '' || currentPath === 'index';
         const isInProtectedArea = currentPath.includes('(tabs)');

         // Define navigation logic
         const handleNavigation = () => {
            // If user is authenticated but still on entry page, go to tabs
            if (isAuthenticated && isHomePath) {
               console.log('Redirecting authenticated user to tabs');
               router.replace('/(tabs)');
            }
            // If not authenticated but trying to access protected routes, go to login
            else if (!isAuthenticated && isInProtectedArea) {
               console.log('Redirecting unauthenticated user to login');
               router.replace('/');
            }
         };

         // Use requestAnimationFrame instead of setTimeout for smoother transitions
         const frameId = requestAnimationFrame(() => {
            handleNavigation();
         });

         return () => cancelAnimationFrame(frameId);
      } catch (error) {
         console.error('Navigation error:', error);
      }
   }, [segments, navigationState, token, isInitialized]);

   return { user, token, isInitialized };
}
