import React, { useState } from 'react';
import {
   StyleSheet,
   View,
   FlatList,
   TouchableOpacity,
   StatusBar,
   Dimensions,
   Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import CategorySelector from '@/components/CategorySelector';
import { useWashBasket } from '@/components/WashBasketContext';

// Define curtain item interface
interface CurtainItem {
   id: string;
   name: string;
   price: string;
   description: string;
   image: any;
}

// Sample curtain items data
const curtainItems: CurtainItem[] = [
   {
      id: '1',
      name: 'Standard Curtains',
      price: '3,500 FCFA',
      description: 'Regular washing and pressing for standard curtains',
      image: require('@/assets/images/curtain.png'),
   },
   {
      id: '2',
      name: 'Blackout Curtains',
      price: '4,000 FCFA',
      description: 'Special care for blackout/thermal curtains',
      image: require('@/assets/images/curtain.png'),
   },
   {
      id: '3',
      name: 'Sheer Curtains',
      price: '3,000 FCFA',
      description: 'Delicate washing for sheer and lace curtains',
      image: require('@/assets/images/curtain.png'),
   },
   {
      id: '4',
      name: 'Drapes',
      price: '5,000 FCFA',
      description: 'Professional cleaning for heavy drapes',
      image: require('@/assets/images/curtain.png'),
   },
   {
      id: '5',
      name: 'Valances',
      price: '2,000 FCFA',
      description: 'Gentle washing for decorative valances',
      image: require('@/assets/images/curtain.png'),
   },
];

export default function CurtainsScreen() {
   const router = useRouter();
   const [searchVisible, setSearchVisible] = useState(false);
   const { state, dispatch } = useWashBasket();

   function CurtainItemAnimated({
      item,
      index,
   }: {
      item: CurtainItem;
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
                           price: Number(item.price.replace(/[^\d]/g, '')),
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
               <ThemedText style={styles.headerTitle}>Curtains</ThemedText>
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
                           backgroundColor: '#28B9F4',
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
            <CategorySelector currentCategory="Curtains" />

            <ThemedText style={styles.sectionTitle}>Available Items</ThemedText>

            {/* Curtain Items List - Styled like Popular Items */}
            <FlatList
               data={curtainItems}
               renderItem={({ item, index }) => (
                  <CurtainItemAnimated item={item} index={index} />
               )}
               keyExtractor={(item) => item.id}
               contentContainerStyle={styles.listContainer}
               showsVerticalScrollIndicator={false}
            />
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
