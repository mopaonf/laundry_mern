import React, { useState, useRef, useEffect } from 'react';
import {
   StyleSheet,
   View,
   TouchableOpacity,
   Modal,
   FlatList,
   Animated,
   BackHandler,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface Category {
   id: string;
   name: string;
   route: string;
   icon: keyof typeof MaterialIcons.glyphMap;
}

const categories: Category[] = [
   {
      id: '1',
      name: 'Clothes',
      route: '/categorycards/clothes',
      icon: 'dry-cleaning',
   },
   {
      id: '2',
      name: 'Households',
      route: '/categorycards/households',
      icon: 'home',
   },
   {
      id: '3',
      name: 'Curtains',
      route: '/categorycards/curtains',
      icon: 'curtains',
   },
   {
      id: '4',
      name: 'Accessories',
      route: '/categorycards/accessories',
      icon: 'checkroom',
   },
];

interface CategorySelectorProps {
   currentCategory: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
   currentCategory,
}) => {
   const router = useRouter();
   const [modalVisible, setModalVisible] = useState(false);
   const animationValue = useRef(new Animated.Value(0)).current;

   // Handle back button press when modal is open
   useEffect(() => {
      const backHandler = BackHandler.addEventListener(
         'hardwareBackPress',
         () => {
            if (modalVisible) {
               hideDropdown();
               return true;
            }
            return false;
         }
      );

      return () => backHandler.remove();
   }, [modalVisible]);

   const showDropdown = () => {
      setModalVisible(true);
      Animated.timing(animationValue, {
         toValue: 1,
         duration: 300,
         useNativeDriver: true,
      }).start();
   };

   const hideDropdown = () => {
      Animated.timing(animationValue, {
         toValue: 0,
         duration: 200,
         useNativeDriver: true,
      }).start();
      setTimeout(() => {
         setModalVisible(false);
      }, 200);
   };

   const navigateToCategory = (route: string) => {
      if (route === currentCategory) {
         hideDropdown();
         return;
      }

      hideDropdown();
      setTimeout(() => {
         router.replace(route as any);
      }, 200);
   };

   const renderCategoryItem = ({ item }: { item: Category }) => (
      <TouchableOpacity
         style={[
            styles.categoryItem,
            currentCategory === item.name ? styles.currentCategory : null,
         ]}
         onPress={() => navigateToCategory(item.route)}
         activeOpacity={0.7}
      >
         <MaterialIcons
            name={item.icon}
            size={24}
            color={currentCategory === item.name ? '#28B9F4' : '#555'}
         />
         <ThemedText
            style={[
               styles.categoryText,
               currentCategory === item.name
                  ? styles.currentCategoryText
                  : null,
            ]}
         >
            {item.name}
         </ThemedText>
      </TouchableOpacity>
   );

   const modalTranslate = animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-200, 0],
   });

   const modalOpacity = animationValue;

   return (
      <View>
         <TouchableOpacity
            style={styles.selectorButton}
            onPress={showDropdown}
            activeOpacity={0.8}
         >
            <ThemedText style={styles.selectorText}>
               {currentCategory}
            </ThemedText>
            <MaterialIcons name="arrow-drop-down" size={24} color="#28B9F4" />
         </TouchableOpacity>

         <Modal
            transparent={true}
            visible={modalVisible}
            animationType="none"
            onRequestClose={hideDropdown}
            statusBarTranslucent={true}
         >
            <TouchableOpacity
               style={styles.modalOverlay}
               onPress={hideDropdown}
               activeOpacity={1}
            >
               <Animated.View
                  style={[
                     styles.dropdown,
                     {
                        opacity: modalOpacity,
                        transform: [{ translateY: modalTranslate }],
                     },
                  ]}
               >
                  <TouchableOpacity activeOpacity={1}>
                     <ThemedView style={styles.dropdownContent}>
                        <View style={styles.dropdownHeader}>
                           <ThemedText style={styles.dropdownTitle}>
                              Categories
                           </ThemedText>
                           <TouchableOpacity onPress={hideDropdown}>
                              <MaterialIcons
                                 name="close"
                                 size={24}
                                 color="#555"
                              />
                           </TouchableOpacity>
                        </View>
                        <FlatList
                           data={categories}
                           renderItem={renderCategoryItem}
                           keyExtractor={(item) => item.id}
                           scrollEnabled={false}
                           showsVerticalScrollIndicator={false}
                        />
                     </ThemedView>
                  </TouchableOpacity>
               </Animated.View>
            </TouchableOpacity>
         </Modal>
      </View>
   );
};

const styles = StyleSheet.create({
   selectorButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(40, 185, 244, 0.1)',
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      alignSelf: 'flex-start',
      marginBottom: 10,
   },
   selectorText: {
      color: '#28B9F4',
      fontWeight: '600',
      marginRight: 5,
   },
   modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-start',
   },
   dropdown: {
      position: 'absolute',
      top: 120,
      left: 20,
      right: 20,
      backgroundColor: 'transparent',
   },
   dropdownContent: {
      backgroundColor: '#FFF',
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 10,
      overflow: 'hidden',
   },
   dropdownHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#EEE',
   },
   dropdownTitle: {
      fontSize: 18,
      fontWeight: '600',
   },
   categoryItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#F5F5F5',
   },
   currentCategory: {
      backgroundColor: 'rgba(40, 185, 244, 0.1)',
   },
   categoryText: {
      marginLeft: 15,
      fontSize: 16,
      color: '#555',
   },
   currentCategoryText: {
      color: '#28B9F4',
      fontWeight: '600',
   },
});

export default CategorySelector;
