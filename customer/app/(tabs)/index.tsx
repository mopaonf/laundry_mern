import React, { useState, useEffect, useRef } from 'react';
import {
   StyleSheet,
   ScrollView,
   TouchableOpacity,
   Dimensions,
   FlatList,
   View,
   StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useWashBasket } from '@/components/WashBasketContext';
import { useAuthStore } from '@/store/auth.store';
import { ApiService } from '@/utils/api.service';

// Types for the app data
interface PromotionItem {
   id: string;
   title: string;
   subTitle: string;
   image: any;
}

interface CategoryItem {
   id: string;
   name: string;
   icon: keyof typeof MaterialIcons.glyphMap;
   route?: string; // Add route property for navigation
}

interface ProductItem {
   id: string;
   name: string;
   price: string;
   image: any;
}

// Sample promotional data
const promotions: PromotionItem[] = [
   {
      id: '1',
      title: '20% OFF First Order',
      subTitle: 'Valid until June 30, 2025',
      image: require('@/assets/images/offer.png'),
   },
   {
      id: '2',
      title: 'Free Pickup & Delivery',
      subTitle: 'On orders above 15,000 FCFA',
      image: require('@/assets/images/offer1.webp'),
   },
   {
      id: '3',
      title: 'Express Service Available',
      subTitle: 'Same-day service in Douala',
      image: require('@/assets/images/offer3.jpeg'),
   },
];

// Sample categories data
const categories: CategoryItem[] = [
   {
      id: '1',
      name: 'Track',
      icon: 'location-on' as keyof typeof MaterialIcons.glyphMap,
   },
   {
      id: '2',
      name: 'Clothes',
      icon: 'dry-cleaning' as keyof typeof MaterialIcons.glyphMap,
      route: '/categorycards/clothes', // Updated path to reflect new location
   },
   {
      id: '3',
      name: 'Households',
      icon: 'home' as keyof typeof MaterialIcons.glyphMap,
      route: '/categorycards/households',
   },
   {
      id: '4',
      name: 'Curtains',
      icon: 'curtains' as keyof typeof MaterialIcons.glyphMap,
      route: '/categorycards/curtains',
   },
   {
      id: '5',
      name: 'Accessories',
      icon: 'checkroom' as keyof typeof MaterialIcons.glyphMap,
      route: '/categorycards/accessories',
   },
];

// List all image filenames in your assets/images folder
const imageFilenames = [
   'tshirt.png',
   'pants.png',
   'jacket.png',
   'blanket.png',
   'curtain.png',
   'suit.png',
   'dress.png',
   // Add all your other image filenames here
];

// Generate the image map automatically
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
};

function getImageAsset(imagePath: string) {
   const imageName = imagePath?.split('/').pop() || 'tshirt.png';
   return imageMap[imageName] || imageMap['tshirt.png'];
}

export default function HomeScreen() {
   const [currentPromotionIndex, setCurrentPromotionIndex] = useState(0);
   const flatListRef = useRef<FlatList>(null);
   const { width: screenWidth } = Dimensions.get('window');
   const router = useRouter(); // Add router for navigation
   const { state, dispatch } = useWashBasket();
   const { user, token } = useAuthStore();
   const [items, setItems] = useState<any[]>([]);
   const [loadingItems, setLoadingItems] = useState(false);

   // Auto-scroll promotions
   useEffect(() => {
      const interval = setInterval(() => {
         const nextIndex = (currentPromotionIndex + 1) % promotions.length;
         setCurrentPromotionIndex(nextIndex);

         flatListRef.current?.scrollToIndex({
            animated: true,
            index: nextIndex,
         });
      }, 3000); // Change slide every 3 seconds

      return () => clearInterval(interval);
   }, [currentPromotionIndex]);

   // Fetch items from backend
   useEffect(() => {
      const fetchItems = async () => {
         setLoadingItems(true);
         const response = await ApiService.get(
            '/api/inventory',
            token || undefined
         );
         if (response.success && response.data && response.data.data) {
            const mapped = response.data.data.map((item: any) => ({
               id: item._id,
               name: item.name,
               price: `${item.basePrice} FCFA`,
               image: getImageAsset(item.image),
            }));
            setItems(mapped);
         }
         setLoadingItems(false);
      };
      fetchItems();
   }, [token]);

   // Calculate total quantity for badge
   const totalQuantity = state.items.reduce((sum, i) => sum + i.quantity, 0);

   // Render functions for the different sections
   const renderCategoryItem = ({ item }: { item: CategoryItem }) => (
      <TouchableOpacity
         style={styles.categoryCard}
         activeOpacity={0.7} // More responsive touch feedback
         onPress={() => {
            if (item.route) {
               router.push(item.route as any);
            }
         }}
      >
         <MaterialIcons name={item.icon} size={29} color="#28B9F4" />
         <ThemedText style={styles.categoryText}>{item.name}</ThemedText>
      </TouchableOpacity>
   );

   const renderPromotionItem = ({ item }: { item: PromotionItem }) => (
      <ThemedView style={styles.promotionCard}>
         <Image source={item.image} style={styles.promotionImage} />
         <View style={styles.promotionOverlay}>
            <ThemedText style={styles.promotionTitle}>{item.title}</ThemedText>
            <ThemedText style={styles.promotionSubTitle}>
               {item.subTitle}
            </ThemedText>
         </View>
      </ThemedView>
   );

   const renderProductItem = ({ item }: { item: ProductItem }) => (
      <ThemedView style={styles.productCard}>
         <Image source={item.image} style={styles.productImage} />
         <View style={styles.productDetails}>
            <ThemedText style={styles.productName}>{item.name}</ThemedText>
            <ThemedText style={styles.productPrice}>{item.price}</ThemedText>
         </View>
         <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
               // Convert price string to number (remove non-digits)
               const priceNum = Number(item.price.replace(/[^\d]/g, ''));
               dispatch({
                  type: 'ADD_ITEM',
                  item: {
                     id: item.id,
                     name: item.name,
                     price: priceNum,
                     image: item.image,
                  },
               });
            }}
         >
            <MaterialIcons name="add" size={20} color="white" />
         </TouchableOpacity>
      </ThemedView>
   );

   return (
      <View style={styles.container}>
         <StatusBar barStyle="light-content" backgroundColor="#28B9F4" />

         {/* Fixed Header Section - Always visible */}
         <ThemedView style={styles.headerContainer}>
            <View style={styles.userInfoContainer}>
               <View style={styles.profileContainer}>
                  <View style={styles.profileCircle}>
                     <Image
                        source={require('@/assets/images/ges.webp')}
                        style={styles.profileImage}
                     />
                  </View>
                  {user?.customerId && (
                     <View style={styles.customerIdBadge}>
                        <ThemedText style={styles.customerIdText}>
                           {user.customerId}
                        </ThemedText>
                     </View>
                  )}
               </View>
               <View>
                  <ThemedText style={styles.greetingText}>
                     {user ? `Hi, ${user.name}` : 'Hi, Guest'}
                  </ThemedText>
                  <ThemedText style={styles.locationText}>
                     Douala, Cameroon
                  </ThemedText>
               </View>
            </View>

            <View style={styles.headerIcons}>
               <TouchableOpacity style={styles.iconButton}>
                  <MaterialIcons name="search" size={28} color="#E0E0E0" />
               </TouchableOpacity>
               <TouchableOpacity style={styles.iconButton}>
                  <MaterialIcons
                     name="notifications"
                     size={28}
                     color="#E0E0E0"
                  />
               </TouchableOpacity>
               <TouchableOpacity
                  style={[styles.iconButton, { position: 'relative' }]}
                  onPress={() => router.push('/WashBasketScreen')}
                  activeOpacity={0.7}
               >
                  <MaterialIcons
                     name="shopping-cart"
                     size={28}
                     color="#E0E0E0"
                  />
                  {totalQuantity > 0 && (
                     <View
                        style={{
                           position: 'absolute',
                           top: 2,
                           right: 2,
                           backgroundColor: '#E82B25',
                           borderRadius: 8,
                           minWidth: 16,
                           height: 16,
                           justifyContent: 'center',
                           alignItems: 'center',
                           paddingHorizontal: 3,
                        }}
                     >
                        <ThemedText
                           style={{
                              color: '#fff',
                              fontSize: 10,
                              fontWeight: 'bold',
                           }}
                        >
                           {totalQuantity}
                        </ThemedText>
                     </View>
                  )}
               </TouchableOpacity>
            </View>
         </ThemedView>

         <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
         >
            {/* Empty space for header positioning */}
            <View style={styles.headerSpaceholder} />

            {/* Category Cards - Row 2 */}
            <View style={styles.categoriesOuterContainer}>
               <FlatList
                  data={categories}
                  renderItem={renderCategoryItem}
                  keyExtractor={(item) => item.id}
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesContainer}
                  bounces={false}
                  overScrollMode="never"
                  decelerationRate="normal"
                  snapToInterval={90} // Card width (80) + margin (10)
                  snapToAlignment="center"
                  disableIntervalMomentum={true}
               />
            </View>

            {/* Promotions Slider - Row 3 */}
            <ThemedView style={styles.promotionsContainer}>
               <FlatList
                  ref={flatListRef}
                  data={promotions}
                  renderItem={renderPromotionItem}
                  keyExtractor={(item) => item.id}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={screenWidth - 40}
                  decelerationRate="fast"
                  contentContainerStyle={styles.promotionsList}
                  onMomentumScrollEnd={(event) => {
                     const index = Math.round(
                        event.nativeEvent.contentOffset.x / (screenWidth - 40)
                     );
                     setCurrentPromotionIndex(index);
                  }}
               />
               <View style={styles.paginationDots}>
                  {promotions.map((_, index) => (
                     <View
                        key={index}
                        style={[
                           styles.paginationDot,
                           index === currentPromotionIndex &&
                              styles.paginationDotActive,
                        ]}
                     />
                  ))}
               </View>
            </ThemedView>

            {/* Products List - Row 4 */}
            <ThemedView style={styles.productsContainer}>
               <ThemedText style={styles.sectionTitle}>
                  Popular Items
               </ThemedText>
               {loadingItems ? (
                  <ThemedText>Loading items...</ThemedText>
               ) : (
                  <FlatList
                     data={items.slice(0, 5)}
                     renderItem={renderProductItem}
                     keyExtractor={(item) => item.id}
                     scrollEnabled={false}
                  />
               )}
            </ThemedView>

            {/* Removed extra space at bottom to prevent overscrolling */}
         </ScrollView>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#28B9F4',
   },
   scrollContainer: {
      flexGrow: 1,
      paddingBottom: 20, // Reduced padding to prevent overscroll
   },
   // Header - Row 1 (10%)
   headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 60,
      paddingBottom: 10,
      height: Dimensions.get('window').height * 0.1,
      backgroundColor: '#28B9F4', // Ensure header has same background
      position: 'absolute', // Make header fixed
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10, // Ensure header stays on top
      elevation: 5, // Android elevation for shadow effect
   },
   // Space holder for fixed header
   headerSpaceholder: {
      height: Dimensions.get('window').height * 0.1, // Same as header height
   },
   userInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1, // Make sure this container can grow as needed
      marginRight: 10, // Add some right margin to prevent text from touching icons
   },
   profileContainer: {
      position: 'relative',
      marginRight: 12,
   },
   profileCircle: {
      width: 48, // Increased from 40 to 48
      height: 48, // Increased from 40 to 48
      borderRadius: 24, // Increased to match width/2
      backgroundColor: '#FFF',
      overflow: 'hidden',
   },
   customerIdBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      backgroundColor: '#E0E0E0',
      borderRadius: 8,
      paddingHorizontal: 4,
      paddingVertical: 1,
      borderWidth: 1.5,
      borderColor: '#28B9F4',
   },
   customerIdText: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#28B9F4',
      fontFamily: 'monospace',
   },
   profileImage: {
      width: '100%',
      height: '100%',
      borderRadius: 24, // Increased to match container radius
   },
   greetingText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
   },
   locationText: {
      fontSize: 12,
      color: '#E0E0E0',
   },
   headerIcons: {
      flexDirection: 'row',
      alignItems: 'center',
   },
   iconButton: {
      marginLeft: 0,
      padding: 5, // Add padding around the icons
      height: 40, // Set fixed height to ensure icons are fully visible
      width: 40, // Set fixed width for consistency
      justifyContent: 'center',
      alignItems: 'center',
   },

   // Categories - Row 2 (15%)
   categoriesOuterContainer: {
      paddingVertical: 8,
      backgroundColor: 'transparent',
      height: Dimensions.get('window').height * 0.13,
      overflow: 'hidden', // Prevent content from spilling outside
   },
   categoriesContainer: {
      paddingLeft: 16,
      paddingRight: 16 + 40, // Extra padding at the end to show there's more content
      backgroundColor: 'transparent',
      alignItems: 'center',
      paddingTop: 2, // Add slight padding at the top
   },
   categoryCard: {
      width: 80, // Consistent width for each card
      height: 68, // Slightly taller for better touch area
      backgroundColor: '#F8F8F8', // Slightly lighter color
      borderRadius: 10, // Slightly more rounded corners
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10, // Consistent spacing between cards
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08, // More subtle shadow
      shadowRadius: 3,
      elevation: 2,
   },
   categoryText: {
      fontSize: 11.5, // Slightly larger for better readability
      marginTop: 6,
      color: '#333', // Darker text for better contrast
      textAlign: 'center',
      fontWeight: '500', // Slightly bolder
   },

   // Promotions - Row 3 (25%)
   promotionsContainer: {
      paddingTop: 0, // Reduced from 10
      paddingBottom: 10, // Reduced from 15
      backgroundColor: 'transparent',
      height: Dimensions.get('window').height * 0.28, // Reduced from 0.3
      marginTop: -5, // Added negative margin to pull content up
   },
   promotionsList: {
      paddingHorizontal: 20,
   },
   promotionCard: {
      width: Dimensions.get('window').width - 40,
      height: '90%', // Increased from 85% to 90% to make cards taller
      marginRight: 10,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: '#F0F0F0',
   },
   promotionImage: {
      width: '100%',
      height: '100%',
   },
   promotionOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 15,
   },
   promotionTitle: {
      color: 'white',
      fontSize: 22,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 5,
   },
   promotionSubTitle: {
      color: '#E0E0E0',
      fontSize: 14,
      textAlign: 'center',
   },
   paginationDots: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -5, // Changed from 5 to -5 to bring dots up
      position: 'relative', // Added to allow dots to overlap with content if needed
      zIndex: 1, // Added to ensure dots appear above other elements
   },
   paginationDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#D0D0D0',
      marginHorizontal: 3,
   },
   paginationDotActive: {
      backgroundColor: '#28B9F4',
      width: 12,
      height: 12,
      borderRadius: 6,
   },

   // Products - Row 4 (40%)
   productsContainer: {
      flex: 1,
      backgroundColor: '#FFF',
      paddingHorizontal: 20,
      paddingTop: 10, // Reduced from 15
      minHeight: Dimensions.get('window').height * 0.4,
      borderTopRightRadius: 30,
      borderTopLeftRadius: 30,
      marginTop: -10, // Added negative margin to pull content up
   },
   sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 15,
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
