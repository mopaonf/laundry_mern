import React, { useState, useEffect } from 'react';
import {
   View,
   Text,
   StyleSheet,
   TouchableOpacity,
   TextInput,
   ScrollView,
   Alert,
   ActivityIndicator,
   KeyboardAvoidingView,
   Platform,
   Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useWashBasket } from '@/components/WashBasketContext';
import { useAuthStore } from '@/store/auth.store';
import { ApiService } from '@/utils/api.service';
import LocationSelector, { LocationData } from '@/components/LocationSelector';
import { RewardBanner } from '@/components/RewardBanner';

interface RewardStatus {
   customerId: string;
   currentCycleOrderCount: number;
   ordersUntilDiscount: number;
   isEligibleForDiscount: boolean;
   nextDiscountAmount: number;
   totalOrdersCount: number;
   completedCycles: number;
   totalRewardsEarned: number;
   currentCycleTotal: number;
}

export default function CheckoutScreen() {
   const router = useRouter();
   const { state, dispatch } = useWashBasket();
   const { user, token } = useAuthStore();

   const [loading, setLoading] = useState(false);
   const [notes, setNotes] = useState('');
   const [pickupLocation, setPickupLocation] = useState<LocationData | null>(
      null
   );
   const [dropoffLocation, setDropoffLocation] = useState<LocationData | null>(
      null
   );
   const [deliveryInstructions, setDeliveryInstructions] = useState('');
   const [payWithMobile, setPayWithMobile] = useState(false);
   const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
   const [showPickupLocationSelector, setShowPickupLocationSelector] =
      useState(false);
   const [showDropoffLocationSelector, setShowDropoffLocationSelector] =
      useState(false);

   // Reward system states
   const [rewardStatus, setRewardStatus] = useState<RewardStatus | null>(null);
   const [loadingRewardStatus, setLoadingRewardStatus] = useState(false);

   console.log(
      'CheckoutScreen render - showPickupLocationSelector:',
      showPickupLocationSelector
   );
   console.log(
      'CheckoutScreen render - showDropoffLocationSelector:',
      showDropoffLocationSelector
   );

   const tomorrow = new Date();
   tomorrow.setDate(tomorrow.getDate() + 1);
   tomorrow.setHours(12, 0, 0, 0);

   const [pickupDate, setPickupDate] = useState(tomorrow);
   const [showDatePicker, setShowDatePicker] = useState(false);
   const [showTimePicker, setShowTimePicker] = useState(false);

   const total = state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
   );

   // Calculate final total after potential discount
   const discountAmount = rewardStatus?.isEligibleForDiscount
      ? rewardStatus.nextDiscountAmount
      : 0;
   const finalTotal = Math.max(0, total - discountAmount);

   // Fetch reward status when component mounts
   useEffect(() => {
      fetchRewardStatus();
   }, [token]);

   const fetchRewardStatus = async () => {
      if (!token) return;

      try {
         setLoadingRewardStatus(true);
         const response = await ApiService.get<{ data: RewardStatus }>(
            '/api/orders/reward-status',
            token
         );

         if (response.success && response.data?.data) {
            setRewardStatus(response.data.data);
            console.log('Reward Status:', response.data.data);
         }
      } catch (error) {
         console.error('Error fetching reward status:', error);
      } finally {
         setLoadingRewardStatus(false);
      }
   };

   const handleDateChange = (event: any, selectedDate?: Date) => {
      setShowDatePicker(false);
      if (selectedDate) {
         const newDate = new Date(selectedDate);
         newDate.setHours(pickupDate.getHours(), pickupDate.getMinutes(), 0, 0);
         setPickupDate(newDate);
         setShowTimePicker(true);
      }
   };

   const handleTimeChange = (event: any, selectedTime?: Date) => {
      setShowTimePicker(false);
      if (selectedTime) {
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

   const handlePickupLocationSelect = (location: LocationData) => {
      setPickupLocation(location);
   };

   const handleDropoffLocationSelect = (location: LocationData) => {
      setDropoffLocation(location);
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

      if (pickupDate <= new Date()) {
         Alert.alert('Error', 'Pickup date must be in the future');
         return;
      }

      if (!pickupLocation) {
         Alert.alert('Error', 'Please select a pickup location');
         return;
      }

      if (!dropoffLocation) {
         Alert.alert('Error', 'Please select a delivery location');
         return;
      }

      try {
         setLoading(true);

         const orderData = {
            items: state.items.map((item) => ({
               itemId: item.id,
               name: item.name,
               price: item.price,
               quantity: item.quantity,
            })),
            pickupDate: pickupDate.toISOString(),
            pickupLocation: {
               address: pickupLocation.address,
               coordinates: pickupLocation.coordinates,
               placeId: pickupLocation.placeId,
               instructions: deliveryInstructions,
            },
            dropoffLocation: {
               address: dropoffLocation.address,
               coordinates: dropoffLocation.coordinates,
               placeId: dropoffLocation.placeId,
               instructions: deliveryInstructions,
            },
            notes,
            total: finalTotal, // Use final total after discount
            payWithMobile: payWithMobile,
            phoneNumber: payWithMobile ? phoneNumber : undefined,
         };

         const response = await ApiService.post(
            '/api/orders',
            orderData,
            token
         );

         if (response.success) {
            dispatch({ type: 'CLEAR_BASKET' });
            router.replace({
               pathname: '/OrderConfirmationScreen',
               params: {
                  orderId: response.data?.data?._id,
                  pickupDate: pickupDate.toISOString(),
                  paymentStatus: response.data?.data?.paymentStatus,
                  paymentReference: response.data?.data?.paymentReference,
                  // Pass reward information
                  discountApplied:
                     response.data?.rewardInfo?.discountApplied || 0,
                  originalTotal:
                     response.data?.rewardInfo?.originalTotal || total,
                  finalTotal:
                     response.data?.rewardInfo?.finalTotal || finalTotal,
                  isRewardOrder:
                     response.data?.rewardInfo?.isRewardOrder || false,
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
            <View style={styles.header}>
               <TouchableOpacity
                  onPress={() => router.back()}
                  style={styles.backButton}
               >
                  <MaterialIcons name="arrow-back" size={26} color="#E0E0E0" />
               </TouchableOpacity>
               <ThemedText style={styles.headerTitle}>Checkout</ThemedText>
            </View>

            <ThemedView style={styles.contentContainer}>
               <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Reward Banner - Prominent display */}
                  {rewardStatus && (
                     <View style={styles.section}>
                        <RewardBanner
                           rewardStatus={rewardStatus}
                           orderTotal={total}
                        />
                     </View>
                  )}

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
                           </ThemedText>
                           <ThemedText style={styles.itemPrice}>
                              {(item.price * item.quantity).toLocaleString()}{' '}
                              FCFA
                           </ThemedText>
                        </ThemedView>
                     ))}
                     <ThemedView style={styles.totalRow}>
                        <ThemedText style={styles.totalLabel}>
                           Subtotal
                        </ThemedText>
                        <ThemedText style={styles.totalValue}>
                           {total.toLocaleString()} FCFA
                        </ThemedText>
                     </ThemedView>

                     {/* Reward Discount Section */}
                     {rewardStatus?.isEligibleForDiscount && (
                        <ThemedView style={styles.discountRow}>
                           <View style={styles.discountInfo}>
                              <MaterialIcons
                                 name="card-giftcard"
                                 size={20}
                                 color="#28a745"
                              />
                              <ThemedText style={styles.discountLabel}>
                                 Reward Discount
                              </ThemedText>
                           </View>
                           <ThemedText style={styles.discountValue}>
                              -{discountAmount.toLocaleString()} FCFA
                           </ThemedText>
                        </ThemedView>
                     )}

                     <ThemedView
                        style={[styles.totalRow, styles.finalTotalRow]}
                     >
                        <ThemedText style={styles.finalTotalLabel}>
                           Total{' '}
                           {rewardStatus?.isEligibleForDiscount
                              ? '(After Discount)'
                              : ''}
                        </ThemedText>
                        <ThemedText style={styles.finalTotalValue}>
                           {finalTotal.toLocaleString()} FCFA
                        </ThemedText>
                     </ThemedView>
                  </ThemedView>

                  {/* Reward Status Section */}
                  <ThemedView style={styles.section}>
                     <ThemedText style={styles.sectionTitle}>
                        Reward Status
                     </ThemedText>

                     {loadingRewardStatus ? (
                        <View style={styles.rewardLoading}>
                           <ActivityIndicator size="small" color="#00719c" />
                           <ThemedText style={styles.rewardLoadingText}>
                              Loading reward status...
                           </ThemedText>
                        </View>
                     ) : rewardStatus ? (
                        <>
                           {rewardStatus.isEligibleForDiscount ? (
                              <View style={styles.rewardCard}>
                                 <View style={styles.rewardHeader}>
                                    <MaterialIcons
                                       name="celebration"
                                       size={24}
                                       color="#28a745"
                                    />
                                    <ThemedText style={styles.rewardTitle}>
                                       🎉 Congratulations!
                                    </ThemedText>
                                 </View>
                                 <ThemedText style={styles.rewardMessage}>
                                    You've earned a discount of{' '}
                                    <Text style={styles.discountHighlight}>
                                       {rewardStatus.nextDiscountAmount.toLocaleString()}{' '}
                                       FCFA
                                    </Text>{' '}
                                    on this order!
                                 </ThemedText>
                                 <ThemedText style={styles.rewardSubtext}>
                                    This discount is the average of your last 10
                                    orders.
                                 </ThemedText>
                              </View>
                           ) : (
                              <View style={styles.rewardCard}>
                                 <View style={styles.rewardHeader}>
                                    <MaterialIcons
                                       name="card-giftcard"
                                       size={24}
                                       color="#00719c"
                                    />
                                    <ThemedText style={styles.rewardTitle}>
                                       Reward Progress
                                    </ThemedText>
                                 </View>
                                 <View style={styles.progressContainer}>
                                    <View style={styles.progressBar}>
                                       <View
                                          style={[
                                             styles.progressFill,
                                             {
                                                width: `${
                                                   (rewardStatus.currentCycleOrderCount /
                                                      10) *
                                                   100
                                                }%`,
                                             },
                                          ]}
                                       />
                                    </View>
                                    <ThemedText style={styles.progressText}>
                                       {rewardStatus.currentCycleOrderCount}/10
                                       orders
                                    </ThemedText>
                                 </View>
                                 <ThemedText style={styles.rewardMessage}>
                                    {rewardStatus.ordersUntilDiscount === 1
                                       ? 'Just 1 more order to earn your next reward!'
                                       : `${rewardStatus.ordersUntilDiscount} more orders to earn your next reward!`}
                                 </ThemedText>
                                 {rewardStatus.totalRewardsEarned > 0 && (
                                    <ThemedText style={styles.rewardSubtext}>
                                       Total rewards earned:{' '}
                                       {rewardStatus.totalRewardsEarned.toLocaleString()}{' '}
                                       FCFA
                                    </ThemedText>
                                 )}
                              </View>
                           )}
                        </>
                     ) : (
                        <View style={styles.rewardCard}>
                           <ThemedText style={styles.rewardMessage}>
                              Unable to load reward status. Your order will
                              still be processed normally.
                           </ThemedText>
                        </View>
                     )}
                  </ThemedView>

                  <ThemedView style={styles.section}>
                     <ThemedText style={styles.sectionTitle}>
                        Pickup Details
                     </ThemedText>

                     <View style={{ marginBottom: 12 }}>
                        <ThemedText style={styles.fieldLabel}>
                           Pickup Location
                        </ThemedText>
                        <TouchableOpacity
                           style={styles.locationSelector}
                           onPress={() => {
                              console.log('Pickup location button pressed');
                              setShowPickupLocationSelector(true);
                           }}
                        >
                           <MaterialIcons
                              name="location-on"
                              size={20}
                              color="#00719c"
                           />
                           <ThemedText style={styles.locationText}>
                              {pickupLocation?.address ||
                                 'Select pickup location'}
                           </ThemedText>
                           <MaterialIcons
                              name="arrow-forward-ios"
                              size={16}
                              color="#999"
                           />
                        </TouchableOpacity>
                     </View>

                     <View style={{ marginBottom: 12 }}>
                        <ThemedText style={styles.fieldLabel}>
                           Delivery Location
                        </ThemedText>
                        <TouchableOpacity
                           style={styles.locationSelector}
                           onPress={() => {
                              console.log('Dropoff location button pressed');
                              setShowDropoffLocationSelector(true);
                           }}
                        >
                           <MaterialIcons
                              name="location-on"
                              size={20}
                              color="#ef4444"
                           />
                           <ThemedText style={styles.locationText}>
                              {dropoffLocation?.address ||
                                 'Select delivery location'}
                           </ThemedText>
                           <MaterialIcons
                              name="arrow-forward-ios"
                              size={16}
                              color="#999"
                           />
                        </TouchableOpacity>
                     </View>

                     <TouchableOpacity
                        style={styles.datePickerButton}
                        onPress={() => setShowDatePicker(true)}
                     >
                        <MaterialIcons
                           name="calendar-today"
                           size={22}
                           color="#00719c"
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
                           color="#00719c"
                        />
                        <ThemedText style={styles.datePickerText}>
                           {format(pickupDate, 'h:mm a')}
                        </ThemedText>
                     </TouchableOpacity>

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

                  <ThemedView style={styles.section}>
                     <ThemedText style={styles.sectionTitle}>
                        Delivery Instructions
                     </ThemedText>
                     <TextInput
                        style={styles.textInput}
                        placeholder="e.g., Leave at door, Call when arriving..."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={3}
                        value={deliveryInstructions}
                        onChangeText={setDeliveryInstructions}
                     />
                  </ThemedView>

                  <ThemedView style={styles.section}>
                     <ThemedText style={styles.sectionTitle}>
                        Additional Notes
                     </ThemedText>
                     <TextInput
                        style={styles.textInput}
                        placeholder="Enter any special instructions..."
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={4}
                        value={notes}
                        onChangeText={setNotes}
                     />
                  </ThemedView>

                  <ThemedView style={styles.section}>
                     <ThemedText style={styles.sectionTitle}>
                        Payment Method
                     </ThemedText>
                     <TouchableOpacity
                        style={styles.paymentOption}
                        onPress={() => setPayWithMobile((v) => !v)}
                     >
                        <MaterialIcons
                           name={
                              payWithMobile
                                 ? 'radio-button-checked'
                                 : 'radio-button-unchecked'
                           }
                           size={22}
                           color="#00719c"
                        />
                        <ThemedText style={{ marginLeft: 10 }}>
                           Pay with Mobile Money
                        </ThemedText>
                     </TouchableOpacity>
                     {payWithMobile && (
                        <TextInput
                           style={styles.textInput}
                           placeholder="Enter your mobile number"
                           placeholderTextColor="#999"
                           keyboardType="phone-pad"
                           value={phoneNumber}
                           onChangeText={setPhoneNumber}
                        />
                     )}
                  </ThemedView>
               </ScrollView>

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

            {/* Pickup Location Selector Modal */}
            {showPickupLocationSelector && (
               <LocationSelector
                  isOpen={showPickupLocationSelector}
                  onClose={() => setShowPickupLocationSelector(false)}
                  onLocationSelect={handlePickupLocationSelect}
                  title="Select Pickup Location"
               />
            )}

            {/* Dropoff Location Selector Modal */}
            {showDropoffLocationSelector && (
               <LocationSelector
                  isOpen={showDropoffLocationSelector}
                  onClose={() => setShowDropoffLocationSelector(false)}
                  onLocationSelect={handleDropoffLocationSelect}
                  title="Select Dropoff Location"
               />
            )}
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
      backgroundColor: '#00719c',
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
   fieldLabel: {
      fontSize: 16,
      color: '#333',
      marginBottom: 8,
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
      color: '#00719c',
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
      color: '#00719c',
   },
   locationSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      backgroundColor: '#F9F9F9',
   },
   locationText: {
      flex: 1,
      marginLeft: 10,
      fontSize: 16,
      color: '#333',
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
   textInput: {
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 8,
      padding: 15,
      fontSize: 16,
      color: '#333',
      textAlignVertical: 'top',
      minHeight: 100,
   },
   paymentOption: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
   },
   footer: {
      paddingVertical: 20,
      paddingHorizontal: 20,
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
   },
   placeOrderButton: {
      backgroundColor: '#00719c',
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
   // Reward and discount styles
   discountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
   },
   discountInfo: {
      flexDirection: 'row',
      alignItems: 'center',
   },
   discountLabel: {
      fontSize: 16,
      color: '#28a745',
      fontWeight: '500',
      marginLeft: 8,
   },
   discountValue: {
      fontSize: 16,
      color: '#28a745',
      fontWeight: '600',
   },
   finalTotalRow: {
      backgroundColor: '#F8F9FA',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      marginTop: 8,
   },
   finalTotalLabel: {
      fontSize: 18,
      fontWeight: '700',
      color: '#333',
   },
   finalTotalValue: {
      fontSize: 18,
      fontWeight: '700',
      color: '#00719c',
   },
   rewardLoading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
   },
   rewardLoadingText: {
      marginLeft: 10,
      fontSize: 16,
      color: '#666',
   },
   rewardCard: {
      backgroundColor: '#F8F9FA',
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: '#00719c',
   },
   rewardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
   },
   rewardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
      marginLeft: 8,
   },
   rewardMessage: {
      fontSize: 16,
      color: '#333',
      lineHeight: 22,
      marginBottom: 8,
   },
   rewardSubtext: {
      fontSize: 14,
      color: '#666',
      fontStyle: 'italic',
   },
   discountHighlight: {
      color: '#28a745',
      fontWeight: '700',
   },
   progressContainer: {
      marginBottom: 12,
   },
   progressBar: {
      height: 8,
      backgroundColor: '#E9ECEF',
      borderRadius: 4,
      marginBottom: 8,
   },
   progressFill: {
      height: '100%',
      backgroundColor: '#00719c',
      borderRadius: 4,
   },
   progressText: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
   },
});
