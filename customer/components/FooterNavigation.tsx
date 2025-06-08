import React from 'react';
import {
   View,
   Text,
   StyleSheet,
   TouchableOpacity,
   Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface FooterNavigationProps {
   onNavigate: (route: string) => void;
}

interface NavigationItem {
   name: string;
   route: string;
   icon: keyof typeof MaterialIcons.glyphMap;
}

const navigationItems: NavigationItem[] = [
   { name: 'Home', route: '/', icon: 'home' },
   { name: 'Orders', route: '/orders', icon: 'receipt-long' },
   { name: 'Wallet', route: '/wallet', icon: 'account-balance-wallet' },
   { name: 'More', route: '/more', icon: 'menu' },
];

export default function FooterNavigation({
   onNavigate,
}: FooterNavigationProps) {
   const pathname = usePathname();
   const insets = useSafeAreaInsets();

   // Account for iOS safe area
   const bottomPadding = Platform.OS === 'ios' ? insets.bottom : 0;

   const isActive = (route: string) => {
      if (route === '/' && pathname === '/') return true;
      if (route !== '/' && pathname.startsWith(route)) return true;
      return false;
   };

   return (
      <View style={[styles.container, { paddingBottom: bottomPadding }]}>
         {navigationItems.map((item) => (
            <TouchableOpacity
               key={item.route}
               style={styles.tabButton}
               onPress={() => onNavigate(item.route)}
               activeOpacity={0.7}
            >
               <MaterialIcons
                  name={item.icon}
                  size={24}
                  color={
                     isActive(item.route)
                        ? '#28B9F4'
                        : 'rgba(40, 185, 244, 0.6)'
                  }
               />
               <Text
                  style={[
                     styles.tabLabel,
                     isActive(item.route)
                        ? styles.activeLabel
                        : styles.inactiveLabel,
                  ]}
               >
                  {item.name}
               </Text>
            </TouchableOpacity>
         ))}
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      height: 76, // Increased height from 70 to 76
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 8,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
   },
   tabButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 10,
   },
   tabLabel: {
      fontSize: 12,
      marginTop: 4,
   },
   activeLabel: {
      color: '#28B9F4',
      fontWeight: '600',
   },
   inactiveLabel: {
      color: 'rgba(40, 185, 244, 0.6)',
   },
});
