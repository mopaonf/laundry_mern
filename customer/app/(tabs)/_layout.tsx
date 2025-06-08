import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';

import FooterNavigation from '@/components/FooterNavigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function TabLayout() {
   const router = useRouter();

   const handleNavigation = (route: string) => {
      router.push(route);
   };

   return (
      <SafeAreaProvider>
         <View style={styles.container}>
            <Stack
               screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: 'transparent' },
               }}
            >
               <Stack.Screen name="index" />
               <Stack.Screen name="orders" />
               <Stack.Screen name="wallet" />
               <Stack.Screen name="more" />
            </Stack>
            <FooterNavigation onNavigate={handleNavigation} />
         </View>
      </SafeAreaProvider>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#F5F5F5', // Default background color
   },
});
