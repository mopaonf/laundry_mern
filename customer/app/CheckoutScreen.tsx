import React, { useState } from 'react';
import {
   View,
   StyleSheet,
   TouchableOpacity,
   ScrollView,
   SafeAreaView,
   ActivityIndicator,
   Alert,
   TextInput,
   KeyboardAvoidingView,
   Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useWashBasket } from '@/components/WashBasketContext';
import { useAuthStore } from '@/store/auth.store';
import { ApiService } from '@/utils/api.service';

export default function CheckoutScreen() {
   const router = useRouter();
   const { state, dispatch } = useWashBasket();
   const { user, token } = useAuthStore();
   const [loading, setLoading] = useState(false);
   const [notes, setNotes] = useState('');

   // Calculate tomorrow as the default pickup date
   const tomorrow = new Date();
   tomorrow.setDate(tomorrow.getDate() + 1);
   tomorrow.setHours(12, 0, 0, 0); // Set to noon by default

   const [pickupDate, setPickupDate] = useState(tomorrow);
   const [showDatePicker, setShowDatePicker] = useState(false);
   const [showTimePicker, setShowTimePicker] = useState(false);

   // Calculate total
   const total = state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
   );

   const handleDateChange = (event, selectedDate) => {
      setShowDatePicker(false);
      if (selectedDate) {
         // Keep the same time when changing the date
         const newDate = new Date(selectedDate);
         newDate.setHours(pickupDate.getHours(), pickupDate.getMinutes(), 0, 0);
         setPickupDate(newDate);
         // Show time picker after selecting date
         setShowTimePicker(true);
      }
   };

   const handleTimeChange = (event, selectedTime) => {
      setShowTimePicker(false);
      if (selectedTime) {
         // Keep the same date when changing the time
         const newDate = new Date(pickupDate);
         newDate.setHours(
            selectedTime.getHours(),
            selectedTime.getMinutes(),
            0,
            0
         );
         setPickupDate(newDate);
      }
   };

   const placeOrder = async () => {
      if (!token) {
         Alert.alert('Error', 'You need to be logged in to place an order');
         return;
      }

      if (state.items.length === 0) {
         Alert.alert('Error', 'Your wash basket is empty');
         return;
      }

      // Validate pickup date is in the future
      if (pickupDate <= new Date()) {
         Alert.alert('Error', 'Pickup date must be in the future');
         return;
      }

      try {
         setLoading(true);

         // Create order data
         const orderData = {
            items: state.items.map((item) => ({
               id: item.id,
               name: item.name,
               price: item.price,
               quantity: item.quantity,
            })),
            pickupDate: pickupDate.toISOString(),
            notes,
            total: total,
         };

         // Place order API call
         const response = await ApiService.post(
            '/api/orders',
            orderData,
            token
         );

         if (response.success) {
            // Clear basket after successful order
            dispatch({ type: 'CLEAR_BASKET' });

            // Navigate to order confirmation screen
            router.replace({
               pathname: '/OrderConfirmationScreen',
               params: {
                  orderId: response.data?.data?._id,
                  pickupDate: pickupDate.toISOString(),
               },
            });
         } else {
            Alert.alert('Error', response.error || 'Failed to place order');
         }
      } catch (error) {
         console.error('Order placement error:', error);
         Alert.alert('Error', 'An unexpected error occurred');
      } finally {
         setLoading(false);
      }
   };

   return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#28B9F4' }}>
         <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
         >
            {/* Header */}
            <View style={styles.header}>
               <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
               >
                  <MaterialIcons name="arrow-back" size={26} color="#E0E0E0" />
               </TouchableOpacity>
               <ThemedText style={styles.headerTitle}>Checkout</ThemedText>
            </View>

            {/* Main Content */}
            <ThemedView style={styles.contentContainer}>
               <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Customer Info Section */}
                  <ThemedView style={styles.section}>
                     <ThemedText style={styles.sectionTitle}>
                        Customer Information
                     </ThemedText>
                     <ThemedView style={styles.infoRow}>
                        <MaterialIcons
                           name="person"
                           size={22}
                           color="#28B9F4"
                        />
                        <ThemedText style={styles.infoText}>
                           {user?.name || 'Guest'}
                        </ThemedText>
                     </ThemedView>
                     <ThemedView style={styles.infoRow}>
                        <MaterialIcons name="email" size={22} color="#28B9F4" />
                        <ThemedText style={styles.infoText}>
                           {user?.email || 'Not available'}
                        </ThemedText>
                     </ThemedView>
                     <ThemedView style={styles.infoRow}>
                        <MaterialIcons name="phone" size={22} color="#28B9F4" />
                        <ThemedText style={styles.infoText}>
                           {user?.phone || 'Not available'}
                        </ThemedText>
                     </ThemedView>
                  </ThemedView>

                  {/* Order Summary Section */}
                  <ThemedView style={styles.section}>
                     <ThemedText style={styles.sectionTitle}>
                        Order Summary
                     </ThemedText>
                     {state.items.map((item) => (
                        <ThemedView key={item.id} style={styles.itemRow}>
                           <ThemedText style={styles.itemName}>
                              {item.name}
                           </ThemedText>
                           <ThemedText style={styles.itemQuantity}>
                              x{item.quantity}
                           </ThemedText>                           <ThemedText style={styles.itemPrice}>
                              {`${(item.price * item.quantity).toLocaleString()} FCFA`}
                           </ThemedText>
                        </ThemedView>
                     ))}
                     <ThemedView style={styles.totalRow}>
                        <ThemedText style={styles.totalLabel}>Total</ThemedText>
                        <ThemedText style={styles.totalValue}>
                           {total.toLocaleString()} FCFA
                        </ThemedText>
                     </ThemedView>
                  </ThemedView>

                  {/* Pickup Details Section */}
                  <ThemedView style={styles.section}>
                     <ThemedText style={styles.sectionTitle}>
                        Pickup Details
                     </ThemedText>

                     <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowDatePicker(true)}
                     >
                        <MaterialIcons
                           name="calendar-today"
                           size={22}
                           color="#28B9F4"
                        />
                        <ThemedText style={styles.datePickerText}>
                           {format(pickupDate, 'EEE, MMM d, yyyy')}
                        </ThemedText>
                     </TouchableOpacity>

                     <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowTimePicker(true)}
                     >
                        <MaterialIcons
                           name="access-time"
                           size={22}
                           color="#28B9F4"
                        />
                        <ThemedText style={styles.datePickerText}>
                           {format(pickupDate, 'h:mm a')}
                        </ThemedText>
                     </TouchableOpacity>

                     {/* Date/Time Pickers (Native) */}
                     {showDatePicker && (
                        <DateTimePicker
                           value={pickupDate}
                           mode="date"
                           display="default"
                           onChange={handleDateChange}
                           minimumDate={tomorrow}
                        />
                     )}

                     {showTimePicker && (
                        <DateTimePicker
                           value={pickupDate}
                           mode="time"
                           display="default"
                           onChange={handleTimeChange}
                        />
                     )}
                  </ThemedView>

                  {/* Notes Section */}
                  <ThemedView style={styles.section}>
                     <ThemedText style={styles.sectionTitle}>
                        Additional Notes
                     </ThemedText>
                     <TextInput
                        style={styles.notesInput}
                        placeholder="Enter any special instructions..."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={4}
                        value={notes}
                        onChangeText={setNotes}
                     />
                  </ThemedView>

                  {/* Payment Method Section - To be implemented later */}
                  <ThemedView style={styles.section}>
                     <ThemedText style={styles.sectionTitle}>
                        Payment Method
                     </ThemedText>
                     <ThemedView style={styles.paymentPlaceholder}>
                        <ThemedText style={styles.paymentText}>
                           Payment will be collected on delivery
                        </ThemedText>
                     </ThemedView>
                  </ThemedView>
               </ScrollView>

               {/* Place Order Button */}
               <View style={styles.footer}>
                  <TouchableOpacity
                     style={styles.placeOrderButton}
                     onPress={placeOrder}
                     disabled={loading}
                  >
                     {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                     ) : (
                        <ThemedText style={styles.placeOrderButtonText}>
                           Place Order
                        </ThemedText>
                     )}
                  </TouchableOpacity>
               </View>
            </ThemedView>
         </KeyboardAvoidingView>
      </SafeAreaView>
   );
}

const styles = StyleSheet.create({
   header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 20,
      backgroundColor: '#28B9F4',
   },
   backButton: {
      marginRight: 15,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
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
      paddingTop: 25,
   },
   section: {
      paddingHorizontal: 20,
      marginBottom: 20,
   },
   sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 15,
      color: '#333',
   },
   infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
   },
   infoText: {
      fontSize: 16,
      marginLeft: 10,
      color: '#555',
   },
   itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
   },
   itemName: {
      flex: 2,
      fontSize: 16,
   },
   itemQuantity: {
      flex: 0.5,
      fontSize: 16,
      textAlign: 'center',
   },
   itemPrice: {
      flex: 1,
      fontSize: 16,
      textAlign: 'right',
      color: '#28B9F4',
      fontWeight: '500',
   },
   totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 15,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
   },
   totalLabel: {
      fontSize: 18,
      fontWeight: '600',
   },
   totalValue: {
      fontSize: 18,
      fontWeight: '700',
      color: '#28B9F4',
   },
   datePickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      marginBottom: 10,
   },
   datePickerText: {
      marginLeft: 10,
      fontSize: 16,
      color: '#333',
   },
   notesInput: {
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      padding: 15,
      fontSize: 16,
      color: '#333',
      textAlignVertical: 'top',
      minHeight: 100,
   },
   paymentPlaceholder: {
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      padding: 15,
      backgroundColor: '#F9F9F9',
   },
   paymentText: {
      fontSize: 16,
      color: '#666',
      fontStyle: 'italic',
      textAlign: 'center',
   },
   footer: {
      paddingVertical: 20,
      paddingHorizontal: 20,
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
   },
   placeOrderButton: {
      backgroundColor: '#28B9F4',
      borderRadius: 30,
      paddingVertical: 18,
      alignItems: 'center',
      justifyContent: 'center',
   },
   placeOrderButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
   },
});
