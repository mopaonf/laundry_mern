import React from 'react';
import {
   StyleSheet,
   View,
   ScrollView,
   TouchableOpacity,
   StatusBar,
   Dimensions,
   FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// Types for transaction history
interface Transaction {
   id: string;
   type: 'payment';
   amount: string;
   description: string;
   date: string;
   service: string;
   status: 'completed' | 'pending' | 'failed';
}

interface PaymentMethod {
   id: string;
   type: string;
   name: string;
   icon: keyof typeof FontAwesome.glyphMap;
   isDefault?: boolean;
}

interface ExpenseSummary {
   month: string;
   amount: string;
   percentage: number;
}

// Sample transaction data
const transactions: Transaction[] = [
   {
      id: '1',
      type: 'payment',
      amount: '15,000 FCFA',
      description: 'Laundry Service - Full Load',
      date: 'Jun 12, 2023',
      service: 'Express Wash',
      status: 'completed',
   },
   {
      id: '2',
      type: 'payment',
      amount: '7,500 FCFA',
      description: 'Dry Cleaning - 3 Items',
      date: 'May 29, 2023',
      service: 'Regular Cleaning',
      status: 'completed',
   },
   {
      id: '3',
      type: 'payment',
      amount: '12,500 FCFA',
      description: 'Household Linens',
      date: 'May 15, 2023',
      service: 'Regular Cleaning',
      status: 'completed',
   },
   {
      id: '4',
      type: 'payment',
      amount: '9,000 FCFA',
      description: 'Curtain Cleaning - 2 Sets',
      date: 'Apr 30, 2023',
      service: 'Regular Cleaning',
      status: 'completed',
   },
   {
      id: '5',
      type: 'payment',
      amount: '18,500 FCFA',
      description: 'Full Home Service',
      date: 'Apr 10, 2023',
      service: 'Premium Package',
      status: 'completed',
   },
];

// Sample payment methods
const paymentMethods: PaymentMethod[] = [
   {
      id: '1',
      type: 'card',
      name: 'Visa •••• 4242',
      icon: 'cc-visa',
      isDefault: true,
   },
   {
      id: '2',
      type: 'card',
      name: 'Mastercard •••• 5555',
      icon: 'cc-mastercard',
   },
   {
      id: '3',
      type: 'mobile',
      name: 'Mobile Money',
      icon: 'mobile',
   },
];

// Sample expense summary
const expenseSummary: ExpenseSummary[] = [
   { month: 'Jun', amount: '15,000', percentage: 24 },
   { month: 'May', amount: '20,000', percentage: 32 },
   { month: 'Apr', amount: '27,500', percentage: 44 },
];

export default function WalletScreen() {
   // Render functions for different sections
   const renderTransaction = ({ item }: { item: Transaction }) => (
      <TouchableOpacity style={styles.transactionCard}>
         <View style={styles.transactionIconContainer}>
            <MaterialIcons name="receipt-long" size={24} color="#28B9F4" />
         </View>
         <View style={styles.transactionDetails}>
            <ThemedText style={styles.transactionTitle}>
               {item.description}
            </ThemedText>
            <ThemedText style={styles.transactionDate}>
               {item.date} • {item.service}
            </ThemedText>
         </View>
         <View style={styles.transactionAmount}>
            <ThemedText style={styles.amountText}>{item.amount}</ThemedText>
            <View
               style={[
                  styles.statusBadge,
                  item.status === 'completed'
                     ? styles.completedBadge
                     : item.status === 'pending'
                     ? styles.pendingBadge
                     : styles.failedBadge,
               ]}
            >
               <ThemedText style={styles.statusText}>{item.status}</ThemedText>
            </View>
         </View>
      </TouchableOpacity>
   );

   const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => (
      <TouchableOpacity style={styles.paymentMethodCard}>
         <FontAwesome name={item.icon} size={24} color="#28B9F4" />
         <View style={styles.paymentMethodDetails}>
            <ThemedText style={styles.paymentMethodName}>
               {item.name}
            </ThemedText>
            {item.isDefault && (
               <ThemedText style={styles.defaultBadge}>Default</ThemedText>
            )}
         </View>
         <MaterialIcons name="chevron-right" size={24} color="#AAAAAA" />
      </TouchableOpacity>
   );

   return (
      <View style={styles.container}>
         <StatusBar barStyle="light-content" backgroundColor="#28B9F4" />

         {/* Fixed Header */}
         <ThemedView style={styles.header}>
            <ThemedText style={styles.headerTitle}>Payment History</ThemedText>
            <TouchableOpacity style={styles.iconButton}>
               <MaterialIcons name="settings" size={24} color="#FFFFFF" />
            </TouchableOpacity>
         </ThemedView>

         <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
         >
            {/* Header Spacer */}
            <View style={styles.headerSpacer} />

            {/* Expense Summary */}
            <ThemedView style={styles.expenseSummaryContainer}>
               <ThemedText style={styles.sectionTitle}>
                  Expense Summary
               </ThemedText>
               <View style={styles.expenseGraphContainer}>
                  {expenseSummary.map((expense, index) => (
                     <View key={index} style={styles.expenseColumn}>
                        <View style={styles.barContainer}>
                           <View
                              style={[
                                 styles.bar,
                                 {
                                    height: `${expense.percentage}%`,
                                    backgroundColor: '#28B9F4',
                                 },
                              ]}
                           />
                        </View>
                        <ThemedText style={styles.expenseMonth}>
                           {expense.month}
                        </ThemedText>
                        <ThemedText style={styles.expenseAmount}>
                           {expense.amount}
                        </ThemedText>
                     </View>
                  ))}
               </View>
            </ThemedView>

            {/* Payment Methods */}
            <ThemedView style={styles.paymentMethodsContainer}>
               <View style={styles.sectionHeader}>
                  <ThemedText style={styles.sectionTitle}>
                     Payment Methods
                  </ThemedText>
                  <TouchableOpacity style={styles.addButton}>
                     <MaterialIcons name="add" size={20} color="white" />
                  </TouchableOpacity>
               </View>
               <FlatList
                  data={paymentMethods}
                  renderItem={renderPaymentMethod}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.paymentMethodsList}
               />
            </ThemedView>

            {/* Transaction History */}
            <ThemedView style={styles.transactionsContainer}>
               <ThemedText style={styles.sectionTitle}>
                  Recent Transactions
               </ThemedText>
               <FlatList
                  data={transactions}
                  renderItem={renderTransaction}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.transactionsList}
               />

               <TouchableOpacity style={styles.viewAllButton}>
                  <ThemedText style={styles.viewAllText}>
                     View All Transactions
                  </ThemedText>
                  <MaterialIcons
                     name="arrow-forward"
                     size={16}
                     color="#28B9F4"
                  />
               </TouchableOpacity>
            </ThemedView>
         </ScrollView>
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
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 15,
      backgroundColor: '#28B9F4',
      height: Dimensions.get('window').height * 0.12, // Increased from 0.1 to 0.12 to avoid text cutoff
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      elevation: 5,
   },
   headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#FFFFFF',
   },
   headerSpacer: {
      height: Dimensions.get('window').height * 0.12, // Match increased header height
   },
   scrollContainer: {
      flexGrow: 1,
      paddingBottom: 20,
   },
   iconButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
   },

   // Expense Summary Section
   expenseSummaryContainer: {
      marginHorizontal: 20,
      padding: 20,
      backgroundColor: 'white',
      borderRadius: 15,
      marginBottom: 15,
   },
   expenseGraphContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      height: 150,
      marginTop: 15,
      alignItems: 'flex-end',
      paddingVertical: 10,
   },
   expenseColumn: {
      alignItems: 'center',
      width: '30%',
   },
   barContainer: {
      height: 100,
      width: 30,
      backgroundColor: '#F0F0F0',
      borderRadius: 15,
      justifyContent: 'flex-end',
      overflow: 'hidden',
   },
   bar: {
      width: '100%',
      borderTopLeftRadius: 15,
      borderTopRightRadius: 15,
   },
   expenseMonth: {
      marginTop: 8,
      fontSize: 14,
      fontWeight: '500',
      color: '#333',
   },
   expenseAmount: {
      fontSize: 12,
      color: '#666',
   },

   // Payment Methods Section
   paymentMethodsContainer: {
      marginHorizontal: 20,
      padding: 20,
      backgroundColor: 'white',
      borderRadius: 15,
      marginBottom: 15,
   },
   sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
   },
   sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
   },
   addButton: {
      backgroundColor: '#28B9F4',
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
   },
   paymentMethodsList: {
      paddingTop: 5,
   },
   paymentMethodCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
   },
   paymentMethodDetails: {
      flex: 1,
      marginLeft: 15,
   },
   paymentMethodName: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333',
   },
   defaultBadge: {
      fontSize: 12,
      color: '#28B9F4',
      marginTop: 2,
   },

   // Transactions Section
   transactionsContainer: {
      marginHorizontal: 20,
      padding: 20,
      paddingBottom: 10,
      backgroundColor: 'white',
      borderRadius: 15,
   },
   transactionsList: {
      paddingTop: 10,
   },
   transactionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
   },
   transactionIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#F8F8F8',
      justifyContent: 'center',
      alignItems: 'center',
   },
   transactionDetails: {
      flex: 1,
      marginLeft: 12,
   },
   transactionTitle: {
      fontSize: 15,
      fontWeight: '500',
      color: '#333',
   },
   transactionDate: {
      fontSize: 12,
      color: '#999',
      marginTop: 2,
   },
   transactionAmount: {
      alignItems: 'flex-end',
   },
   amountText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#333',
   },
   statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginTop: 4,
   },
   completedBadge: {
      backgroundColor: '#E6F7ED',
   },
   pendingBadge: {
      backgroundColor: '#FFF8E6',
   },
   failedBadge: {
      backgroundColor: '#FFEEEE',
   },
   statusText: {
      fontSize: 10,
      fontWeight: '500',
      color: '#333',
      textTransform: 'capitalize',
   },
   viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 15,
      paddingVertical: 10,
   },
   viewAllText: {
      fontSize: 14,
      color: '#28B9F4',
      marginRight: 5,
   },
});
