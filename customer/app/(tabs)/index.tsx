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

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

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
   },
   {
      id: '3',
      name: 'Households',
      icon: 'home' as keyof typeof MaterialIcons.glyphMap,
   },
   {
      id: '4',
      name: 'Curtains',
      icon: 'curtains' as keyof typeof MaterialIcons.glyphMap,
   },
];

// Sample products data
const products: ProductItem[] = [
   {
      id: '1',
      name: 'T-Shirt',
      price: '1,500 FCFA',
      image: require('@/assets/images/tshirt.png'),
   },
   {
      id: '2',
      name: 'Pants',
      price: '2,000 FCFA',
      image: require('@/assets/images/pants.png'),
   },
   {
      id: '3',
      name: 'Jacket',
      price: '3,000 FCFA',
      image: require('@/assets/images/jacket.png'),
   },
   {
      id: '4',
      name: 'Blanket',
      price: '5,000 FCFA',
      image: require('@/assets/images/blanket.png'),
   },
   {
      id: '5',
      name: 'Curtain Set',
      price: '7,500 FCFA',
      image: require('@/assets/images/curtain.png'),
   },
   {
      id: '6',
      name: 'suit',
      price: '3,500 FCFA',
      image: require('@/assets/images/suit.png'),
   },
];

export default function HomeScreen() {
   const [currentPromotionIndex, setCurrentPromotionIndex] = useState(0);
   const flatListRef = useRef<FlatList>(null);
   const { width: screenWidth } = Dimensions.get('window');

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

   // Render functions for the different sections
   const renderCategoryItem = ({ item }: { item: CategoryItem }) => (
      <TouchableOpacity style={styles.categoryCard}>
         <MaterialIcons name={item.icon} size={28} color="#28B9F4" />
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
         <TouchableOpacity style={styles.addButton}>
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
               <View style={styles.profileCircle}>
                  <Image
                     source={require('@/assets/images/ges.webp')}
                     style={styles.profileImage}
                  />
               </View>
               <View>
                  <ThemedText style={styles.greetingText}>
                     Hi, Ges Milinkovich
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
            </View>
         </ThemedView>

         <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
         >
            {/* Empty space for header positioning */}
            <View style={styles.headerSpaceholder} />

            {/* Category Cards - Row 2 */}
            <FlatList
               data={categories}
               renderItem={renderCategoryItem}
               keyExtractor={(item) => item.id}
               horizontal={false}
               numColumns={4}
               scrollEnabled={false}
               contentContainerStyle={styles.categoriesContainer}
            />

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
               <FlatList
                  data={products}
                  renderItem={renderProductItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.productList}
               />
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
   profileCircle: {
      width: 48, // Increased from 40 to 48
      height: 48, // Increased from 40 to 48
      borderRadius: 24, // Increased to match width/2
      backgroundColor: '#FFF',
      marginRight: 12, // Increased margin a bit for better spacing
      overflow: 'hidden',
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
   categoriesContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 5, // Reduced from 10
      backgroundColor: 'transparent',
      height: Dimensions.get('window').height * 0.13, // Reduced from 0.15
      alignItems: 'center',
      marginTop: -5, // Added negative margin to pull content up
   },
   categoryCard: {
      width: (Dimensions.get('window').width - 48) / 4, // Reduced width by increasing horizontal padding
      height: 65, // Reduced height from 70 to 65
      backgroundColor: '#F0F0F0',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
      elevation: 1,
   },
   categoryText: {
      fontSize: 12,
      marginTop: 5,
      color: '#444',
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
