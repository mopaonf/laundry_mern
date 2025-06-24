import React, { useEffect, useState } from 'react';
import {
   View,
   StyleSheet,
   TouchableOpacity,
   ScrollView,
   SafeAreaView,
   ActivityIndicator,
   Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { format } from 'date-fns';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function OrderConfirmationScreen() {
   const router = useRouter();
   const params = useLocalSearchParams();
   const [loading, setLoading] = useState(false);

   // Get orderId and pickupDate from params
   const orderId = params.orderId as string;
   const pickupDate = params.pickupDate
      ? new Date(params.pickupDate as string)
      : new Date();

   // Animated confirmation effect
   useEffect(() => {
      // Simulate loading for a better UX
      const timer = setTimeout(() => {
         setLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
   }, []);

   const handleContactSupport = () => {
      // In a real app, this could be a phone number or WhatsApp link
      Linking.openURL('tel:+123456789');
   };

   const handleTrackOrder = () => {
      // Navigate to order tracking screen (to be implemented later)
      router.push('/(tabs)');
   };

   const handleBackToHome = () => {
      // Navigate back to home screen
      router.push('/(tabs)');
   };

   return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#28B9F4' }}>
         <View style={styles.header}>
            <ThemedText style={styles.headerTitle}>
               Order Confirmation
            </ThemedText>
         </View>

         <ThemedView style={styles.contentContainer}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
               {loading ? (
                  <View style={styles.loadingContainer}>
                     <ActivityIndicator size="large" color="#28B9F4" />
                     <ThemedText style={styles.loadingText}>
                        Processing your order...
                     </ThemedText>
                  </View>
               ) : (
                  <>
                     <View style={styles.successContainer}>
                        <View style={styles.successIconContainer}>
                           <MaterialIcons
                              name="check-circle"
                              size={80}
                              color="#4CAF50"
                           />
                        </View>
                        <ThemedText style={styles.successTitle}>
                           Order Placed Successfully!
                        </ThemedText>
                        <ThemedText style={styles.successMessage}>
                           Your laundry order has been confirmed. We'll take
                           good care of your clothes!
                        </ThemedText>
                     </View>

                     <ThemedView style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>
                           Order Details
                        </ThemedText>

                        <View style={styles.detailRow}>
                           <ThemedText style={styles.detailLabel}>
                              Order ID:
                           </ThemedText>
                           <ThemedText style={styles.detailValue}>
                              {orderId || 'N/A'}
                           </ThemedText>
                        </View>

                        <View style={styles.detailRow}>
                           <ThemedText style={styles.detailLabel}>
                              Order Date:
                           </ThemedText>
                           <ThemedText style={styles.detailValue}>
                              {format(new Date(), 'MMM d, yyyy • h:mm a')}
                           </ThemedText>
                        </View>

                        <View style={styles.detailRow}>
                           <ThemedText style={styles.detailLabel}>
                              Pickup Date:
                           </ThemedText>
                           <ThemedText style={styles.detailValue}>
                              {format(pickupDate, 'MMM d, yyyy • h:mm a')}
                           </ThemedText>
                        </View>

                        <View style={styles.detailRow}>
                           <ThemedText style={styles.detailLabel}>
                              Status:
                           </ThemedText>
                           <ThemedText
                              style={[styles.detailValue, { color: '#4CAF50' }]}
                           >
                              In Progress
                           </ThemedText>
                        </View>
                     </ThemedView>

                     <ThemedView style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>
                           Payment Information
                        </ThemedText>
                        <ThemedView style={styles.paymentInfo}>
                           <MaterialIcons
                              name="payments"
                              size={24}
                              color="#28B9F4"
                           />
                           <ThemedText style={styles.paymentText}>
                              Payment will be collected upon delivery
                           </ThemedText>
                        </ThemedView>
                     </ThemedView>

                     <ThemedView style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>
                           Need Help?
                        </ThemedText>
                        <TouchableOpacity
                           style={styles.helpButton}
                           onPress={handleContactSupport}
                        >
                           <MaterialIcons
                              name="headset-mic"
                              size={24}
                              color="#FFFFFF"
                           />
                           <ThemedText style={styles.helpButtonText}>
                              Contact Support
                           </ThemedText>
                        </TouchableOpacity>
                     </ThemedView>
                  </>
               )}
            </ScrollView>

            <View style={styles.footer}>
               <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleTrackOrder}
               >
                  <MaterialIcons
                     name="local-shipping"
                     size={20}
                     color="#FFFFFF"
                  />
                  <ThemedText style={styles.buttonText}>Track Order</ThemedText>
               </TouchableOpacity>

               <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleBackToHome}
               >
                  <MaterialIcons name="home" size={20} color="#28B9F4" />
                  <ThemedText style={[styles.buttonText, { color: '#28B9F4' }]}>
                     Back to Home
                  </ThemedText>
               </TouchableOpacity>
            </View>
         </ThemedView>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   header: {
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 20,
      backgroundColor: '#28B9F4',
   },
   headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#E0E0E0',
   },
   contentContainer: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
   },
   scrollContent: {
      paddingTop: 30,
      paddingBottom: 20,
   },
   loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
   },
   loadingText: {
      fontSize: 18,
      marginTop: 20,
      color: '#666',
   },
   successContainer: {
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 30,
   },
   successIconContainer: {
      marginBottom: 20,
   },
   successTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
   },
   successMessage: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      lineHeight: 24,
   },
   section: {
      paddingHorizontal: 20,
      marginBottom: 25,
   },
   sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 15,
      color: '#333',
   },
   detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
   },
   detailLabel: {
      fontSize: 16,
      color: '#666',
   },
   detailValue: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333',
   },
   paymentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F0F9FF',
      padding: 15,
      borderRadius: 8,
   },
   paymentText: {
      marginLeft: 10,
      fontSize: 16,
      color: '#333',
   },
   helpButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#28B9F4',
      padding: 15,
      borderRadius: 8,
   },
   helpButtonText: {
      marginLeft: 10,
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
   },
   footer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
   },
   primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#28B9F4',
      borderRadius: 30,
      paddingVertical: 16,
      marginBottom: 12,
   },
   secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F0F9FF',
      borderRadius: 30,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: '#28B9F4',
   },
   buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
   },
});
