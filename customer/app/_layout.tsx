import {
   DarkTheme,
   DefaultTheme,
   ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
   const colorScheme = useColorScheme();
   const [loaded] = useFonts({
      SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
   });

   if (!loaded) {
      // Async font loading only occurs in development.
      return null;
   }

   return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
         <SafeAreaProvider>
            <View style={styles.container}>
               <Stack
                  screenOptions={{
                     headerShown: false,
                     contentStyle: { backgroundColor: 'transparent' },
                  }}
               >
                  <Stack.Screen
                     name="(tabs)"
                     options={{ headerShown: false }}
                  />
                  <Stack.Screen name="+not-found" />
               </Stack>
            </View>
         </SafeAreaProvider>
         <StatusBar style="auto" />
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
