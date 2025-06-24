import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';
import { Alert } from 'react-native';

/**
 * Hook to check if user is authenticated and redirect if not
 */
export function useRequireAuth() {
   const { user, token } = useAuthStore();

   if (!token) {
      Alert.alert(
         'Authentication Required',
         'Please sign in to access this feature',
         [{ text: 'OK', onPress: () => router.replace('/') }]
      );
      return null;
   }

   return { user, token };
}

/**
 * Hook to check if user has customer role
 */
export function useRequireCustomerRole() {
   const auth = useRequireAuth();

   if (!auth) return null;

   if (auth.user?.role !== 'customer') {
      Alert.alert('Access Denied', 'This area is for customers only', [
         { text: 'OK', onPress: () => router.back() },
      ]);
      return null;
   }

   return auth;
}
