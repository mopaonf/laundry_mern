import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

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

interface RewardBannerProps {
   rewardStatus: RewardStatus | null;
   orderTotal: number;
}

export const RewardBanner: React.FC<RewardBannerProps> = ({
   rewardStatus,
   orderTotal,
}) => {
   if (!rewardStatus) return null;

   if (rewardStatus.isEligibleForDiscount) {
      const finalTotal = Math.max(
         0,
         orderTotal - rewardStatus.nextDiscountAmount
      );
      const savings = rewardStatus.nextDiscountAmount;

      return (
         <View style={styles.eligibleBanner}>
            <View style={styles.iconContainer}>
               <MaterialIcons name="celebration" size={28} color="#fff" />
            </View>
            <View style={styles.textContainer}>
               <Text style={styles.mainText}>🎉 Reward Available!</Text>
               <Text style={styles.subText}>
                  Save {savings.toLocaleString()} FCFA on this order
               </Text>
               <Text style={styles.finalText}>
                  Pay only {finalTotal.toLocaleString()} FCFA instead of{' '}
                  {orderTotal.toLocaleString()} FCFA
               </Text>
            </View>
         </View>
      );
   }

   // Progress banner for customers working toward discount
   const progress = (rewardStatus.currentCycleOrderCount / 10) * 100;

   return (
      <View style={styles.progressBanner}>
         <View style={styles.iconContainer}>
            <MaterialIcons name="card-giftcard" size={24} color="#fff" />
         </View>
         <View style={styles.textContainer}>
            <Text style={styles.progressMainText}>
               {rewardStatus.ordersUntilDiscount === 1
                  ? 'Almost there! Just 1 more order for a reward!'
                  : `${rewardStatus.ordersUntilDiscount} more orders for your next reward!`}
            </Text>
            <View style={styles.progressBarContainer}>
               <View style={styles.progressBar}>
                  <View
                     style={[styles.progressFill, { width: `${progress}%` }]}
                  />
               </View>
               <Text style={styles.progressText}>
                  {rewardStatus.currentCycleOrderCount}/10 orders
               </Text>
            </View>
         </View>
      </View>
   );
};

const styles = StyleSheet.create({
   eligibleBanner: {
      flexDirection: 'row',
      backgroundColor: '#28a745',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   progressBanner: {
      flexDirection: 'row',
      backgroundColor: '#00719c',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
   },
   iconContainer: {
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
   },
   textContainer: {
      flex: 1,
   },
   mainText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 4,
   },
   progressMainText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
   },
   subText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 4,
   },
   finalText: {
      color: '#fff',
      fontSize: 14,
      opacity: 0.9,
   },
   progressBarContainer: {
      marginTop: 4,
   },
   progressBar: {
      height: 6,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 3,
      marginBottom: 4,
   },
   progressFill: {
      height: '100%',
      backgroundColor: '#fff',
      borderRadius: 3,
   },
   progressText: {
      color: '#fff',
      fontSize: 12,
      opacity: 0.9,
   },
});
