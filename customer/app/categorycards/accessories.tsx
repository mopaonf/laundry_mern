import React, { useState, useEffect } from 'react';
import {
   StyleSheet,
   View,
   FlatList,
   TouchableOpacity,
   StatusBar,
   Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import CategorySelector from '@/components/CategorySelector';
import { useWashBasket } from '@/components/WashBasketContext';
import { ApiService } from '@/utils/api.service';
import { useAuthStore } from '@/store/auth.store';

const imageMap: Record<string, any> = {
   'tshirt.png': require('@/assets/images/tshirt.png'),
   'dress_shirt.png': require('@/assets/images/dress-skirt.png'),
   'jeans.png': require('@/assets/images/jeans.png'),
   'dress.png': require('@/assets/images/dress.png'),
   'polo_shirt.png': require('@/assets/images/polo-shirt.png'),
   'trousers.png': require('@/assets/images/trousers.png'),
   'blouse.png': require('@/assets/images/blouse.png'),
   'skirt.png': require('@/assets/images/skirt.png'),
   'suit_jacket.png': require('@/assets/images/suit.png'),
   'underwear.png': require('@/assets/images/underwear.png'),
   'socks.png': require('@/assets/images/socks.png'),
   'sweater.png': require('@/assets/images/sweather.png'),
   'bedsheet.png': require('@/assets/images/bedsheet.png'),
   'pillow_case.png': require('@/assets/images/pillow_case.png'),
   'towel.png': require('@/assets/images/towel.png'),
   'blanket.png': require('@/assets/images/blanket.png'),
   'duvet.png': require('@/assets/images/duvet.png'),
   'table_cloth.png': require('@/assets/images/table_cloth.png'),
   'kitchen_towel.png': require('@/assets/images/kitchen_towel.png'),
   'bath_mat.png': require('@/assets/images/bath_mat.png'),
   'comforter.png': require('@/assets/images/comforter.png'),
   'napkin.png': require('@/assets/images/napkin.png'),
   'living_room_curtains.png': require('@/assets/images/living_room_curtains.png'),
   'bedroom_curtains.png': require('@/assets/images/bedroom_curtains.png'),
   'kitchen_curtains.png': require('@/assets/images/kitchen_curtains.png'),
   'shower_curtain.png': require('@/assets/images/shower_curtain.png'),
   'valance.png': require('@/assets/images/valance.png'),
   'tie.png': require('@/assets/images/tie.png'),
   'scarf.png': require('@/assets/images/scarf.png'),
   'hat.png': require('@/assets/images/hat.png'),
   'belt.png': require('@/assets/images/belt.png'),
   'handbag.png': require('@/assets/images/handbag.png'),
   'accessory.png': require('@/assets/images/handbag.png'),
};
function getImageAsset(imagePath: string) {
   const imageName = imagePath?.split('/').pop() || 'accessory.png';
   return imageMap[imageName] || imageMap['accessory.png'];
}

export default function AccessoriesScreen() {
   const router = useRouter();
   const [searchVisible, setSearchVisible] = useState(false);
   const { state, dispatch } = useWashBasket();
   const [items, setItems] = useState<any[]>([]);
   const [loading, setLoading] = useState(false);
   const token = useAuthStore((s) => s.token);

   useEffect(() => {
      const fetchItems = async () => {
         setLoading(true);
         const authToken = token || undefined;
         const response = await ApiService.get('/api/inventory', authToken);
         console.log('INVENTORY RESPONSE:', response); // Debug log
         if (response.success && response.data && response.data.data) {
            const filtered = response.data.data.filter(
               (item: any) =>
                  item.category && item.category.toLowerCase() === 'accessories'
            );
            setItems(
               filtered.map((item: any) => ({
                  ...item,
                  price: `${item.basePrice} FCFA`,
                  image: getImageAsset(item.image),
               }))
            );
         } else {
            setItems([]);
         }
         setLoading(false);
      };
      fetchItems();
   }, [token]);

   function AccessoryItemAnimated({
      item,
      index,
   }: {
      item: any;
      index: number;
   }) {
      const animatedValue = React.useRef(new Animated.Value(0)).current;
      React.useEffect(() => {
         Animated.timing(animatedValue, {
            toValue: 1,
            duration: 400,
            delay: index * 80,
            useNativeDriver: true,
         }).start();
      }, []);
      return (
         <Animated.View
            style={{
               opacity: animatedValue,
               transform: [
                  {
                     translateY: animatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                     }),
                  },
               ],
            }}
         >
            <ThemedView style={styles.productCard}>
               <Image source={item.image} style={styles.productImage} />
               <View style={styles.productDetails}>
                  <ThemedText style={styles.productName}>
                     {item.name}
                  </ThemedText>
                  <ThemedText style={styles.productPrice}>
                     {item.price}
                  </ThemedText>
               </View>
               <TouchableOpacity
                  style={styles.addButton}
                  onPress={() =>
                     dispatch({
                        type: 'ADD_ITEM',
                        item: {
                           id: item.id,
                           name: item.name,
                           price: Number(item.basePrice),
                           image: item.image,
                        },
                     })
                  }
               >
                  <MaterialIcons name="add" size={20} color="white" />
               </TouchableOpacity>
            </ThemedView>
         </Animated.View>
      );
   }

   // Calculate total quantity for badge
   const totalQty = state.items.reduce((sum, i) => sum + i.quantity, 0);

   return (
      <View style={styles.container}>
         <StatusBar barStyle="light-content" backgroundColor="#28B9F4" />

         {/* Header - Styled like orders.tsx */}
         <View style={styles.header}>
            <View style={styles.headerLeft}>
               <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
               >
                  <MaterialIcons name="arrow-back" size={26} color="#E0E0E0" />
               </TouchableOpacity>
               <ThemedText style={styles.headerTitle}>Accessories</ThemedText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
               <TouchableOpacity
                  style={styles.searchButton}
                  onPress={() => setSearchVisible(!searchVisible)}
               >
                  <MaterialIcons name="search" size={30} color="#E0E0E0" />
               </TouchableOpacity>
               <TouchableOpacity
                  style={{ marginLeft: 10 }}
                  onPress={() => router.push('/WashBasketScreen')}
               >
                  <MaterialIcons
                     name="shopping-cart"
                     size={30}
                     color="#E0E0E0"
                  />
                  {totalQty > 0 && (
                     <View
                        style={{
                           position: 'absolute',
                           right: -2,
                           top: -2,
                           backgroundColor: '#E82B25',
                           borderRadius: 10,
                           minWidth: 18,
                           height: 18,
                           justifyContent: 'center',
                           alignItems: 'center',
                           paddingHorizontal: 4,
                           zIndex: 1,
                        }}
                     >
                        <ThemedText
                           style={{
                              color: 'white',
                              fontSize: 12,
                              fontWeight: 'bold',
                           }}
                        >
                           {totalQty}
                        </ThemedText>
                     </View>
                  )}
               </TouchableOpacity>
            </View>
         </View>

         {/* Main content area with white background */}
         <ThemedView style={styles.contentContainer}>
            {/* Add Category Selector */}
            <CategorySelector currentCategory="Accessories" />

            <ThemedText style={styles.sectionTitle}>Available Items</ThemedText>

            {/* Accessories Items List - Styled like Popular Items */}
            {loading ? (
               <ThemedText>Loading items...</ThemedText>
            ) : (
               <FlatList
                  data={items}
                  renderItem={({ item, index }) => (
                     <AccessoryItemAnimated item={item} index={index} />
                  )}
                  keyExtractor={(item) => item._id || item.id}
                  contentContainerStyle={styles.listContainer}
                  showsVerticalScrollIndicator={false}
               />
            )}
         </ThemedView>
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
   headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
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
   searchButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 6,
   },
   contentContainer: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingHorizontal: 20,
      paddingTop: 25,
   },
   sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 15,
      color: '#333333',
   },
   listContainer: {
      paddingBottom: 30,
   },
   productCard: {
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
   productImage: {
      width: 50,
      height: 50,
      borderRadius: 8,
   },
   productDetails: {
      flex: 1,
      marginLeft: 15,
   },
   productName: {
      fontSize: 16,
      fontWeight: '500',
   },
   productPrice: {
      fontSize: 14,
      color: '#28B9F4',
      fontWeight: '600',
      marginTop: 4,
   },
   addButton: {
      backgroundColor: '#28B9F4',
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
   },
});
