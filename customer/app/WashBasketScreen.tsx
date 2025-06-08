import React from 'react';
import {
   View,
   StyleSheet,
   FlatList,
   TouchableOpacity,
   Image,
   Text,
   SafeAreaView,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useWashBasket } from '@/components/WashBasketContext';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';

export default function WashBasketScreen() {
   const { state, dispatch } = useWashBasket();
   const router = useRouter();
   const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

   return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#28B9F4' }}>
         <View style={styles.header}>
            <TouchableOpacity
               onPress={() => router.back()}
               style={styles.backButton}
            >
               <MaterialIcons name="arrow-back" size={26} color="#E0E0E0" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Wash Basket</ThemedText>
         </View>
         <ThemedView style={styles.contentContainer}>
            <FlatList
               data={state.items}
               keyExtractor={(item) => item.id}
               contentContainerStyle={{ paddingBottom: 30 }}
               renderItem={({ item }) => (
                  <ThemedView style={styles.itemCard}>
                     <Image source={item.image} style={styles.itemImage} />
                     <View style={styles.itemDetails}>
                        <ThemedText style={styles.itemName}>
                           {item.name}
                        </ThemedText>
                        <ThemedText style={styles.itemPrice}>
                           {item.price.toLocaleString()} FCFA
                        </ThemedText>
                        <View style={styles.qtyRow}>
                           <TouchableOpacity
                              style={styles.qtyButton}
                              onPress={() =>
                                 dispatch({ type: 'DECREMENT', id: item.id })
                              }
                           >
                              <MaterialIcons
                                 name="remove"
                                 size={20}
                                 color="white"
                              />
                           </TouchableOpacity>
                           <Text style={styles.qtyText}>{item.quantity}</Text>
                           <TouchableOpacity
                              style={styles.qtyButton}
                              onPress={() =>
                                 dispatch({ type: 'INCREMENT', id: item.id })
                              }
                           >
                              <MaterialIcons
                                 name="add"
                                 size={20}
                                 color="white"
                              />
                           </TouchableOpacity>
                           <TouchableOpacity
                              style={styles.removeButton}
                              onPress={() =>
                                 dispatch({ type: 'REMOVE_ITEM', id: item.id })
                              }
                           >
                              <MaterialIcons
                                 name="delete"
                                 size={20}
                                 color="#28B9F4"
                              />
                           </TouchableOpacity>
                        </View>
                     </View>
                  </ThemedView>
               )}
               ListEmptyComponent={
                  <ThemedText style={{ textAlign: 'center', marginTop: 40 }}>
                     Your basket is empty.
                  </ThemedText>
               }
            />
            <View style={styles.footer}>
               <View style={styles.totalRow}>
                  <ThemedText style={styles.totalLabel}>Total</ThemedText>
                  <ThemedText style={styles.totalValue}>
                     {total.toLocaleString()} FCFA
                  </ThemedText>
               </View>
               <TouchableOpacity
                  style={styles.requestButton}
                  activeOpacity={0.8}
               >
                  <ThemedText style={styles.requestButtonText}>
                     Request Wash
                  </ThemedText>
               </TouchableOpacity>
            </View>
         </ThemedView>
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
      paddingHorizontal: 20,
      paddingTop: 25,
   },
   itemCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      padding: 15,
      marginBottom: 12,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
   },
   itemImage: {
      width: 50,
      height: 50,
      borderRadius: 8,
   },
   itemDetails: {
      flex: 1,
      marginLeft: 15,
   },
   itemName: {
      fontSize: 16,
      fontWeight: '500',
   },
   itemPrice: {
      fontSize: 14,
      color: '#28B9F4',
      fontWeight: '600',
      marginTop: 4,
   },
   qtyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10,
   },
   qtyButton: {
      backgroundColor: '#28B9F4',
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
   },
   qtyText: {
      fontSize: 16,
      fontWeight: '600',
      marginHorizontal: 12,
   },
   removeButton: {
      marginLeft: 16,
      backgroundColor: '#E0F6FF',
      borderRadius: 15,
      padding: 5,
   },
   footer: {
      paddingVertical: 20,
      borderTopWidth: 1,
      borderColor: '#F0F0F0',
      backgroundColor: '#fff',
   },
   totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      paddingHorizontal: 10,
   },
   totalLabel: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
   },
   totalValue: {
      fontSize: 18,
      fontWeight: '700',
      color: '#28B9F4',
   },
   requestButton: {
      backgroundColor: '#28B9F4',
      borderRadius: 30,
      paddingVertical: 18,
      alignItems: 'center',
      marginHorizontal: 10,
      marginTop: 5,
      shadowColor: '#28B9F4',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
   },
   requestButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
   },
});
