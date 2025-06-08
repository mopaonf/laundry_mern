import React, { useState } from 'react';
import {
   StyleSheet,
   FlatList,
   TouchableOpacity,
   View,
   StatusBar,
   ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Types for the app data
interface OrderItem {
   id: string;
   orderNumber: string;
   date: string;
   status: 'In Progress' | 'Ready for Pickup' | 'Completed';
   progressStage: number; // 1-4: Received, Washing, Ready, Delivered
   items: {
      name: string;
      quantity: number;
      icon: keyof typeof MaterialIcons.glyphMap;
   }[];
}

// Sample order data
const orders: OrderItem[] = [
   {
      id: '1',
      orderNumber: '#12345',
      date: 'June 5, 2025',
      status: 'In Progress',
      progressStage: 2, // Washing stage
      items: [
         { name: 'T-Shirts', quantity: 3, icon: 'checkroom' },
         { name: 'Pants', quantity: 2, icon: 'dry-cleaning' },
         { name: 'Towels', quantity: 4, icon: 'waves' },
      ],
   },
   {
      id: '2',
      orderNumber: '#12346',
      date: 'June 3, 2025',
      status: 'Ready for Pickup',
      progressStage: 3, // Ready stage
      items: [
         { name: 'Shirts', quantity: 5, icon: 'checkroom' },
         { name: 'Bed Sheets', quantity: 2, icon: 'bed' },
      ],
   },
   {
      id: '3',
      orderNumber: '#12338',
      date: 'May 28, 2025',
      status: 'Completed',
      progressStage: 4, // Delivered stage
      items: [
         { name: 'Curtains', quantity: 2, icon: 'curtains' },
         { name: 'Blankets', quantity: 1, icon: 'bed' },
      ],
   },
];

// Uncomment to test empty state
// const orders: OrderItem[] = [];

export default function OrdersScreen() {
   const [searchVisible, setSearchVisible] = useState(false);   const getStatusColor = (status: string) => {
      switch (status) {
         case 'In Progress':
            return '#FFA500'; // Orange
         case 'Ready for Pickup':
            return '#4CAF50'; // Green
         case 'Completed':
            return '#A0A0A0'; // Gray
         default:
            return '#A0A0A0';
      }
   };

   const renderOrderItem = ({ item }: { item: OrderItem }) => {
      return (
         <ThemedView style={styles.orderCard}>
            {/* Order Header */}
            <View style={styles.orderHeader}>
               <View>
                  <ThemedText style={styles.orderNumber}>
                     {item.orderNumber}
                  </ThemedText>
                  <ThemedText style={styles.orderDate}>{item.date}</ThemedText>
               </View>
               <View
                  style={[
                     styles.statusBadge,
                     { backgroundColor: getStatusColor(item.status) },
                  ]}
               >
                  <ThemedText style={styles.statusText}>
                     {item.status}
                  </ThemedText>
               </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
               <View style={styles.progressBar}>
                  {[1, 2, 3, 4].map((stage) => (
                     <React.Fragment key={stage}>
                        {stage > 1 && (
                           <View
                              style={[
                                 styles.progressLine,
                                 stage <= item.progressStage
                                    ? styles.progressLineActive
                                    : {},
                              ]}
                           />
                        )}
                        <View
                           style={[
                              styles.progressDot,
                              stage <= item.progressStage
                                 ? styles.progressDotActive
                                 : {},
                           ]}
                        >
                           {stage <= item.progressStage && (
                              <MaterialIcons
                                 name="check"
                                 size={12}
                                 color="#FFFFFF"
                              />
                           )}
                        </View>
                     </React.Fragment>
                  ))}
               </View>
               <View style={styles.progressLabels}>
                  <ThemedText style={styles.progressLabel}>Received</ThemedText>
                  <ThemedText style={styles.progressLabel}>Washing</ThemedText>
                  <ThemedText style={styles.progressLabel}>Ready</ThemedText>
                  <ThemedText style={styles.progressLabel}>
                     Delivered
                  </ThemedText>
               </View>
            </View>

            {/* Order Items */}
            <View style={styles.orderItems}>
               {item.items.map((orderItem, idx) => (
                  <View key={idx} style={styles.orderItemRow}>
                     <MaterialIcons
                        name={orderItem.icon}
                        size={16}
                        color="#28B9F4"
                     />
                     <ThemedText style={styles.orderItemText}>
                        {orderItem.quantity}x {orderItem.name}
                     </ThemedText>
                  </View>
               ))}
            </View>

            {/* Details Button */}
            <View style={styles.orderFooter}>
               <TouchableOpacity style={styles.detailsButton}>
                  <ThemedText style={styles.detailsButtonText}>
                     Details
                  </ThemedText>
               </TouchableOpacity>
            </View>
         </ThemedView>
      );
   };

   const renderEmptyComponent = () => (
      <View style={styles.emptyContainer}>
         <MaterialIcons
            name="local-laundry-service"
            size={70}
            color="#E0E0E0"
         />
         <ThemedText style={styles.emptyText}>
            You have no active orders yet
         </ThemedText>
      </View>
   );

   return (
      <View style={styles.container}>
         <StatusBar barStyle="light-content" backgroundColor="#28B9F4" />

         {/* Header */}
         <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>My Orders</ThemedText>
            <TouchableOpacity
               style={styles.searchButton}
               onPress={() => setSearchVisible(!searchVisible)}
            >
               <MaterialIcons name="search" size={30} color="#E0E0E0" />
            </TouchableOpacity>
         </View>

         {/* Order List */}
         <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmptyComponent}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
         />
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#28B9F4',
   },
   header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 20,
   },
   headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#E0E0E0',
   },
   searchButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 6,
   },   listContainer: {
      flexGrow: 1,
      paddingBottom: 96, // Increased padding to account for the taller footer
      paddingHorizontal: 16,
   },
   emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 100,
   },
   emptyText: {
      fontSize: 18,
      marginTop: 15,
      color: '#E0E0E0',
      textAlign: 'center',
   },
   orderCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
   },
   orderNumber: {
      fontSize: 18,
      fontWeight: 'bold',
   },
   orderDate: {
      fontSize: 14,
      color: '#888',
      marginTop: 2,
   },
   statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
   },
   statusText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
   },
   progressContainer: {
      marginBottom: 16,
   },
   progressBar: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 30,
   },
   progressDot: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#E0E0E0',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
   },
   progressDotActive: {
      backgroundColor: '#28B9F4',
   },
   progressLine: {
      flex: 1,
      height: 3,
      backgroundColor: '#E0E0E0',
      marginHorizontal: -1,
   },
   progressLineActive: {
      backgroundColor: '#28B9F4',
   },
   progressLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 5,
      marginTop: 5,
   },
   progressLabel: {
      fontSize: 10,
      color: '#666',
      width: 60,
      textAlign: 'center',
   },
   orderItems: {
      marginBottom: 12,
      borderTopWidth: 1,
      borderColor: '#F0F0F0',
      paddingTop: 12,
   },
   orderItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
   },
   orderItemText: {
      fontSize: 14,
      marginLeft: 10,
      color: '#555',
   },
   orderFooter: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      borderTopWidth: 1,
      borderColor: '#F0F0F0',
      paddingTop: 12,
   },
   detailsButton: {
      backgroundColor: '#28B9F4',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
   },
   detailsButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
   },
});
