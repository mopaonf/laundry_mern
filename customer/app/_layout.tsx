import {
   DarkTheme,
   DefaultTheme,
   ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';
import { WashBasketProvider } from '@/components/WashBasketContext';
import { useAuthStore } from '@/store/auth.store';

export default function RootLayout() {
   const colorScheme = useColorScheme();
   const [loaded] = useFonts({
      SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
   });

   // Initialize authentication after fonts are loaded
   const auth = useAuthStore();

   // Initialize auth on mount
   useEffect(() => {
      const initAuth = async () => {
         try {
            await auth.initAuth();
         } catch (error) {
            console.error('Failed to initialize auth:', error);
         }
      };

      initAuth();
   }, []);

   if (!loaded) {
      // Return null during loading to avoid render issues
      return null;
   }

   return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
         <SafeAreaProvider>
            <WashBasketProvider>
               <View style={styles.container}>
                  <Stack
                     screenOptions={{
                        headerShown: false,
                     }}
                  >
                     <Stack.Screen name="index" />
                     <Stack.Screen
                        name="(tabs)"
                        options={{ headerShown: false }}
                     />
                     <Stack.Screen
                        name="ApiTestScreen"
                        options={{
                           headerShown: true,
                           headerTitle: 'API Test',
                        }}
                     />
                     <Stack.Screen
                        name="AuthScreen"
                        options={{
                           animation: 'fade',
                           gestureEnabled: false,
                        }}
                     />
                     <Stack.Screen
                        name="SplashScreen"
                        options={{
                           animation: 'fade',
                           gestureEnabled: false,
                        }}
                     />
                     <Stack.Screen
                        name="WashBasketScreen"
                        options={{
                           presentation: 'modal',
                           animation: 'slide_from_bottom',
                        }}
                     />
                  </Stack>
               </View>
            </WashBasketProvider>
         </SafeAreaProvider>
         <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#F5F5F5', // Default background color
   },
   contentContainer: {
      flex: 1,
      marginBottom: 70, // Match footer height to prevent content from being hidden
   },
});
