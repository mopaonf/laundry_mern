import React, { useState, useEffect } from 'react';
import {
   StyleSheet,
   FlatList,
   TouchableOpacity,
   View,
   StatusBar,
   ScrollView,
   RefreshControl,
   ActivityIndicator,
   Alert,
} from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { format } from 'date-fns';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuthStore } from '@/store/auth.store';
import { ApiService } from '@/utils/api.service';

// Types for the app data
interface OrderItem {
   _id: string;
   items: {
      _id: string;
      itemId: string;
      name: string;
      price: number;
      quantity: number;
   }[];
   pickupDate: string;
   notes?: string;
   total: number;
   status: 'In Progress' | 'Ready for Pickup' | 'Completed';
   createdAt: string;
}

// For display purposes
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

export default function OrdersScreen() {
   const { token, user } = useAuthStore();
   const [orders, setOrders] = useState<OrderItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);
   const [searchVisible, setSearchVisible] = useState(false);

   // Fetch orders from the API
   const fetchOrders = async () => {
      if (!token) {
         setLoading(false);
         return;
      }

      try {
         setLoading(true);
         const response = await ApiService.get<{ data: OrderItem[] }>(
            '/api/orders/my-orders',
            token
         );

         if (response.success && response.data?.data) {
            setOrders(response.data.data);
         } else {
            console.error('Failed to fetch orders:', response.error);
         }
      } catch (error) {
         console.error('Error fetching orders:', error);
      } finally {
         setLoading(false);
         setRefreshing(false);
      }
   };

   // Fetch orders on initial load
   useEffect(() => {
      fetchOrders();
   }, [token]);

   // Handle refresh
   const onRefresh = () => {
      setRefreshing(true);
      fetchOrders();
   };

   const getStatusColor = (status: string) => {
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

   // Calculate progress stage based on status
   const getProgressStage = (status: string) => {
      switch (status) {
         case 'In Progress':
            return 2; // Washing
         case 'Ready for Pickup':
            return 3; // Ready
         case 'Completed':
            return 4; // Delivered
         default:
            return 1; // Received
      }
   };

   const renderOrderItem = ({ item }: { item: OrderItem }) => {
      // Calculate the number of items in this order
      const totalItems = item.items.reduce(
         (sum, item) => sum + item.quantity,
         0
      );

      // Format dates
      const orderDate = format(new Date(item.createdAt), 'MMM d, yyyy');
      const pickupDate = format(new Date(item.pickupDate), 'MMM d, yyyy');

      // Generate a short order ID for display
      const shortOrderId = item._id
         .substring(item._id.length - 8)
         .toUpperCase();

      return (
         <ThemedView style={styles.orderCard}>
            {/* Order Header */}
            <View style={styles.orderHeader}>
               <View>
                  <ThemedText style={styles.orderNumber}>
                     Order #{shortOrderId}
                  </ThemedText>
                  <ThemedText style={styles.orderDate}>{orderDate}</ThemedText>
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
                  {[1, 2, 3, 4].map((stage) => {
                     const progressStage = getProgressStage(item.status);
                     return (
                        <React.Fragment key={stage}>
                           {stage > 1 && (
                              <View
                                 style={[
                                    styles.progressLine,
                                    stage <= progressStage
                                       ? styles.progressLineActive
                                       : {},
                                 ]}
                              />
                           )}
                           <View
                              style={[
                                 styles.progressDot,
                                 stage <= progressStage
                                    ? styles.progressDotActive
                                    : {},
                              ]}
                           >
                              {stage <= progressStage && (
                                 <MaterialIcons
                                    name="check"
                                    size={12}
                                    color="#FFFFFF"
                                 />
                              )}
                           </View>
                        </React.Fragment>
                     );
                  })}
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
                        name="local-laundry-service"
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
         {loading ? (
            <>
               <ActivityIndicator size="large" color="#28B9F4" />
               <ThemedText style={styles.emptyText}>
                  Loading your orders...
               </ThemedText>
            </>
         ) : (
            <>
               <MaterialIcons
                  name="local-laundry-service"
                  size={70}
                  color="#E0E0E0"
               />
               <ThemedText style={styles.emptyText}>
                  You have no active orders yet
               </ThemedText>
            </>
         )}
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
            keyExtractor={(item) => item._id}
            ListEmptyComponent={renderEmptyComponent}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
               <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#28B9F4']}
                  tintColor="#28B9F4"
               />
            }
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
   },
   listContainer: {
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
