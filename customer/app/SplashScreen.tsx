import React, { useEffect, useRef } from 'react';
import {
   View,
   Text,
   StyleSheet,
   Animated,
   Dimensions,
   Image,
   ActivityIndicator,
} from 'react-native';

interface SplashScreenProps {
   onAnimationEnd: () => void;
   moveToHeader?: boolean;
}

const { width, height } = Dimensions.get('window');

const SplashScreen: React.FC<SplashScreenProps> = ({
   onAnimationEnd,
   moveToHeader = false,
}) => {
   const slideUpAnim = useRef(new Animated.Value(0)).current;
   const scaleAnim = useRef(new Animated.Value(1)).current;
   const logoOpacityAnim = useRef(new Animated.Value(0)).current;
   const logoScaleAnim = useRef(new Animated.Value(0.8)).current;
   const loadingOpacityAnim = useRef(new Animated.Value(0)).current;

   useEffect(() => {
      // First, fade in and scale up the logo
      Animated.parallel([
         Animated.timing(logoOpacityAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
         }),
         Animated.timing(logoScaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
         }),
      ]).start(() => {
         // Then show loading indicator
         Animated.timing(loadingOpacityAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
         }).start();

         // After a delay, start the move up animation
         setTimeout(() => {
            if (moveToHeader) {
               Animated.parallel([
                  Animated.timing(slideUpAnim, {
                     toValue: -height * 0.42, // Move up but not completely off screen
                     duration: 700,
                     useNativeDriver: true,
                  }),
                  Animated.timing(scaleAnim, {
                     toValue: 0.5, // Shrink more to make room for auth form
                     duration: 700,
                     useNativeDriver: true,
                  }),
               ]).start(onAnimationEnd);
            } else {
               Animated.timing(slideUpAnim, {
                  toValue: -height,
                  duration: 700,
                  useNativeDriver: true,
               }).start(onAnimationEnd);
            }
         }, 2000); // Slightly longer delay to show loading animation
      });
   }, []);
   return (
      <Animated.View
         style={[
            styles.container,
            {
               transform: [{ translateY: slideUpAnim }, { scale: scaleAnim }],
            },
         ]}
      >
         <Animated.View
            style={[styles.logoContainer, { opacity: logoOpacityAnim }]}
         >
            <Animated.View style={{ transform: [{ scale: logoScaleAnim }] }}>
               <Image
                  source={require('../assets/images/PL.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
               />
            </Animated.View>

            <Animated.View
               style={{ opacity: loadingOpacityAnim, marginTop: 20 }}
            >
               <ActivityIndicator size="large" color="#2D9CDB" />
            </Animated.View>
         </Animated.View>
      </Animated.View>
   );
};

const styles = StyleSheet.create({
   container: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#fff',
      justifyContent: 'center',
      paddingTop: 500, // Adjusted for larger logo
      paddingHorizontal: 24,
      alignItems: 'center',
   },
   logoContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
      paddingHorizontal: 25,
   },
   logoImage: {
      width: 200,
      height: 200,
   },
});

export default SplashScreen;
