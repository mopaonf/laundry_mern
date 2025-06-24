import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Animated } from 'react-native';
import { router } from 'expo-router';
import SplashScreen from './SplashScreen';
import AuthScreen from './AuthScreen';
import { useAuthStore } from '@/store/auth.store';

const EntryScreen: React.FC = () => {
   const [splashComplete, setSplashComplete] = useState(false);
   const [authOpacity] = useState(new Animated.Value(0));
   const { user, token, isLoading, initAuth } = useAuthStore();

   // Initialize auth and handle redirects
   useEffect(() => {
      const checkAuth = async () => {
         await initAuth();

         // If user is already authenticated, redirect to main app
         if (token) {
            console.log('User already authenticated, redirecting to tabs');
            router.replace('/(tabs)');
         }
      };

      checkAuth();
   }, []);

   const handleSplashAnimationEnd = () => {
      setSplashComplete(true);
      Animated.timing(authOpacity, {
         toValue: 1,
         duration: 500,
         useNativeDriver: true,
         delay: 300,
      }).start();
   };
   return (
      <View style={styles.container}>
         <StatusBar barStyle="dark-content" backgroundColor="#fff" />
         {/* Always show splash screen first */}
         <SplashScreen
            onAnimationEnd={handleSplashAnimationEnd}
            moveToHeader={true}
         />
         {/* Only show auth screen after splash animation completes */}
         {splashComplete && !isLoading && (
            <Animated.View
               style={[styles.authContainer, { opacity: authOpacity }]}
            >
               <AuthScreen />
            </Animated.View>
         )}
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#fff',
   },
   authContainer: {
      flex: 1,
      paddingTop: 340, // Increased space for the larger header logo
      backgroundColor: 'transparent',
      paddingHorizontal: 0, // Remove horizontal padding that could cause overlap
   },
});

export default EntryScreen;
