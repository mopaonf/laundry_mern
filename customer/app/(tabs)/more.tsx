import React from 'react';
import {
   StyleSheet,
   View,
   TouchableOpacity,
   StatusBar,
   ScrollView,
   FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Menu items interface
interface MenuItem {
   id: string;
   title: string;
   icon: keyof typeof MaterialIcons.glyphMap;
   action?: () => void;
}

// Sample menu items
const menuItems: MenuItem[] = [
   {
      id: '1',
      title: 'Wallet',
      icon: 'account-balance-wallet',
   },
   {
      id: '2',
      title: 'Orders',
      icon: 'receipt-long',
   },
   {
      id: '3',
      title: 'Invite Friends',
      icon: 'person-add',
   },
   {
      id: '4',
      title: 'Price List',
      icon: 'list-alt',
   },
   {
      id: '5',
      title: 'Help & Support',
      icon: 'help',
   },
   {
      id: '6',
      title: 'Settings',
      icon: 'settings',
   },
   {
      id: '7',
      title: 'Logout',
      icon: 'logout',
   },
];

export default function MoreScreen() {
   // User info
   const user = {
      name: 'Ges Milinkovich',
      email: 'ges.milinkovich@example.com',
      profileImage: require('@/assets/images/ges.webp'), // Using placeholder image
   };

   const renderMenuItem = ({ item }: { item: MenuItem }) => {
      return (
         <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={item.action}
         >
            <MaterialIcons
               name={item.icon}
               size={24}
               color="#28B9F4"
               style={styles.menuIcon}
            />
            <ThemedText style={styles.menuText}>{item.title}</ThemedText>
            <MaterialIcons name="chevron-right" size={24} color="#CCCCCC" />
         </TouchableOpacity>
      );
   };

   return (
      <View style={styles.container}>
         <StatusBar barStyle="light-content" backgroundColor="#28B9F4" />

         <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
         >
            {/* User Profile Section */}
            <ThemedView style={styles.profileCard}>
               <View style={styles.profileInfo}>
                  <View style={styles.profileImageContainer}>
                     <Image
                        source={user.profileImage}
                        style={styles.profileImage}
                     />
                  </View>
                  <View style={styles.userInfo}>
                     <ThemedText style={styles.userName}>
                        {user.name}
                     </ThemedText>
                     <ThemedText style={styles.userEmail}>
                        {user.email}
                     </ThemedText>
                  </View>
               </View>

               <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
                  <MaterialIcons name="edit" size={16} color="white" />
                  <ThemedText style={styles.editButtonText}>Edit</ThemedText>
               </TouchableOpacity>
            </ThemedView>

            {/* Menu Items */}
            <View style={styles.menuContainer}>
               <FlatList
                  data={menuItems}
                  renderItem={renderMenuItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => (
                     <View style={styles.menuSeparator} />
                  )}
               />
            </View>

            {/* Version Info */}
            <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>
         </ScrollView>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#28B9F4',
   },
   scrollView: {
      flex: 1,
   },
   contentContainer: {
      paddingBottom: 30,
   },

   // Profile Card
   profileCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      marginHorizontal: 16,
      marginTop: 60,
      marginBottom: 20,
      borderRadius: 16,
      padding: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   profileInfo: {
      flexDirection: 'row',
      alignItems: 'center',
   },
   profileImageContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'white',
      overflow: 'hidden',
      marginRight: 15,
   },
   profileImage: {
      width: '100%',
      height: '100%',
   },
   userInfo: {
      justifyContent: 'center',
   },
   userName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#E0E0E0',
      marginBottom: 4,
   },
   userEmail: {
      fontSize: 14,
      color: '#E0E0E0',
      opacity: 0.8,
   },
   editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
   },
   editButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 6,
   },

   // Menu Items
   menuContainer: {
      backgroundColor: 'white',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingVertical: 10,
      paddingHorizontal: 16,
      flex: 1,
   },
   menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F8F8F8',
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginVertical: 6,
   },
   menuIcon: {
      marginRight: 16,
   },
   menuText: {
      flex: 1,
      fontSize: 16,
      color: '#444',
   },
   menuSeparator: {
      height: 4,
   },

   // Version Text
   versionText: {
      textAlign: 'center',
      fontSize: 12,
      color: '#666',
      marginTop: 20,
      marginBottom: 10,
   },
});
