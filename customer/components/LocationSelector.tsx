import React, { useState, useEffect } from 'react';
import {
   View,
   Text,
   Modal,
   TextInput,
   TouchableOpacity,
   StyleSheet,
   FlatList,
   Alert,
   ActivityIndicator,
   SafeAreaView,
} from 'react-native';
import * as Location from 'expo-location';
import { getApiConfig } from '@/utils/api.config';

export interface LocationData {
   address: string;
   coordinates: {
      latitude: number;
      longitude: number;
   } | null;
   placeId?: string | null;
}

interface LocationSelectorProps {
   isOpen: boolean;
   onClose: () => void;
   onLocationSelect: (location: LocationData) => void;
   title?: string;
   placeholder?: string;
}

interface GooglePlacePrediction {
   place_id: string;
   description: string;
   structured_formatting: {
      main_text: string;
      secondary_text: string;
   };
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
   isOpen,
   onClose,
   onLocationSelect,
   title = 'Select Location',
   placeholder = 'Search for a location...',
}) => {
   const [searchQuery, setSearchQuery] = useState('');
   const [predictions, setPredictions] = useState<GooglePlacePrediction[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [currentLocation, setCurrentLocation] = useState<LocationData | null>(
      null
   );
   const [apiBaseUrl, setApiBaseUrl] = useState<string>('');
   const [popularLocations, setPopularLocations] = useState<
      GooglePlacePrediction[]
   >([]);
   const [showPopularLocations, setShowPopularLocations] = useState(true);
   const [selectedPrediction, setSelectedPrediction] =
      useState<GooglePlacePrediction | null>(null);

   const GOOGLE_API_KEY =
      process.env.EXPO_PUBLIC_GOOGLE_API_KEY ||
      'AIzaSyBEKnvw9LBl_-kBxYZHuKM2kGYOCLl-9Ms';

   useEffect(() => {
      const initializeApi = async () => {
         const config = await getApiConfig();
         setApiBaseUrl(config.baseURL);
         console.log('LocationSelector API config loaded:', config.baseURL);
      };

      if (isOpen) {
         initializeApi();
         getCurrentLocation();

         // Test API connectivity
         setTimeout(async () => {
            const config = await getApiConfig();
            console.log(
               'Testing API connectivity to:',
               `${config.baseURL}/api/places/autocomplete`
            );
            try {
               const testResponse = await fetch(`${config.baseURL}/health`);
               const testData = await testResponse.json();
               console.log('Backend health check:', testData);
            } catch (error) {
               console.error('Backend connectivity test failed:', error);
            }
         }, 1000);
      } else {
         // Reset state when modal closes
         setSelectedPrediction(null);
         setSearchQuery('');
         setPredictions([]);
         setShowPopularLocations(true);
      }
   }, [isOpen]);

   // Load popular locations when current location or API base URL changes
   useEffect(() => {
      if (apiBaseUrl && isOpen) {
         loadPopularLocations();
      }
   }, [apiBaseUrl, currentLocation, isOpen]);

   const getCurrentLocation = async () => {
      try {
         const { status } = await Location.requestForegroundPermissionsAsync();
         if (status !== 'granted') {
            Alert.alert(
               'Permission needed',
               'Location permission is needed to get your current location'
            );
            return;
         }

         const location = await Location.getCurrentPositionAsync({});
         console.log('📍 Current position:', location.coords);

         const address = await reverseGeocode(
            location.coords.latitude,
            location.coords.longitude
         );

         console.log('🏠 Final address result:', address);

         setCurrentLocation({
            address:
               address ||
               `📍 Lat: ${location.coords.latitude.toFixed(
                  4
               )}, Lng: ${location.coords.longitude.toFixed(4)}`,
            coordinates: {
               latitude: location.coords.latitude,
               longitude: location.coords.longitude,
            },
         });
      } catch (error) {
         console.error('Error getting current location:', error);
      }
   };

   const reverseGeocode = async (
      latitude: number,
      longitude: number
   ): Promise<string | null> => {
      try {
         console.log('🔍 Starting reverse geocoding for:', {
            latitude,
            longitude,
         });

         // If we have a backend proxy to Google Geocoding, try that first
         if (apiBaseUrl) {
            const response = await fetch(
               `${apiBaseUrl}/api/places/geocode?latlng=${latitude},${longitude}`
            );
            const data = await response.json();
            console.log(
               '📍 Google Geocoding raw response:',
               JSON.stringify(data, null, 2)
            );

            if (data.results && data.results.length > 0) {
               console.log(
                  '📋 Found',
                  data.results.length,
                  'geocoding results'
               );

               // Log all results to see what we're working with
               data.results.forEach((result: any, index: number) => {
                  console.log(`Result ${index}:`, {
                     formatted_address: result.formatted_address,
                     types: result.types,
                     place_id: result.place_id,
                  });
               });

               // Strategy 1: Look for street-level addresses first
               const streetAddress = data.results.find((r: any) => {
                  const hasStreetTypes =
                     r.types &&
                     (r.types.includes('street_address') ||
                        r.types.includes('premise') ||
                        r.types.includes('subpremise'));
                  const notPlusCode = !r.types.includes('plus_code');
                  const notGeneric =
                     !r.formatted_address.match(/^\+|[A-Z0-9]{4}\+/);
                  return hasStreetTypes && notPlusCode && notGeneric;
               });

               if (streetAddress) {
                  console.log(
                     '✅ Found street address:',
                     streetAddress.formatted_address
                  );
                  return streetAddress.formatted_address;
               }

               // Strategy 2: Look for establishment or point of interest
               const establishment = data.results.find((r: any) => {
                  const hasEstablishmentTypes =
                     r.types &&
                     (r.types.includes('establishment') ||
                        r.types.includes('point_of_interest'));
                  const notPlusCode = !r.types.includes('plus_code');
                  const notGeneric =
                     !r.formatted_address.match(/^\+|[A-Z0-9]{4}\+/);
                  return hasEstablishmentTypes && notPlusCode && notGeneric;
               });

               if (establishment) {
                  console.log(
                     '✅ Found establishment:',
                     establishment.formatted_address
                  );
                  return establishment.formatted_address;
               }

               // Strategy 3: Any result that's not a plus code
               const nonPlusCode = data.results.find((r: any) => {
                  const notPlusCodeType =
                     !r.types || !r.types.includes('plus_code');
                  const notPlusCodeFormat =
                     !r.formatted_address.match(/^\+|[A-Z0-9]{4}\+/);
                  return notPlusCodeType && notPlusCodeFormat;
               });

               if (nonPlusCode) {
                  console.log(
                     '✅ Found non-plus-code address:',
                     nonPlusCode.formatted_address
                  );
                  return nonPlusCode.formatted_address;
               }

               // Strategy 4: Build from address components
               console.log('🔧 Trying to build address from components...');
               for (const r of data.results) {
                  if (r.address_components && r.address_components.length > 0) {
                     const comp = r.address_components;
                     console.log(
                        '📦 Address components:',
                        comp.map((c: any) => ({
                           long_name: c.long_name,
                           types: c.types,
                        }))
                     );

                     const get = (type: string) => {
                        const c = comp.find((c2: any) =>
                           c2.types.includes(type)
                        );
                        return c ? c.long_name : null;
                     };

                     const parts = [
                        get('street_number'),
                        get('route'),
                        get('neighborhood') ||
                           get('sublocality') ||
                           get('locality'),
                        get('administrative_area_level_1'),
                        get('country'),
                     ].filter(Boolean);

                     if (parts.length >= 2) {
                        const builtAddress = parts.join(', ');
                        console.log(
                           '✅ Built address from components:',
                           builtAddress
                        );
                        return builtAddress;
                     }
                  }
               }
            }
         }

         // Fallback: use Expo's reverseGeocodeAsync which often returns granular
         // components (street, city) from device/OS providers.
         console.log('🔄 Falling back to Expo reverseGeocodeAsync...');
         try {
            const expoResults = await Location.reverseGeocodeAsync({
               latitude,
               longitude,
            });
            console.log('📱 Expo reverse geocoding results:', expoResults);

            if (expoResults && expoResults.length > 0) {
               const r = expoResults[0];
               console.log('📱 First Expo result:', r);

               // Build a human-readable address from Expo components
               const parts = [];

               // Add street info if available
               if (r.streetNumber && r.street) {
                  parts.push(`${r.streetNumber} ${r.street}`);
               } else if (r.street) {
                  parts.push(r.street);
               } else if (r.name && !r.name.match(/^\+|[A-Z0-9]{4}\+/)) {
                  parts.push(r.name);
               }

               // Add neighborhood/district
               if (r.district) {
                  parts.push(r.district);
               } else if (r.subregion) {
                  parts.push(r.subregion);
               }

               // Add city
               if (r.city) {
                  parts.push(r.city);
               }

               // Add region/state
               if (r.region) {
                  parts.push(r.region);
               }

               // Add country
               if (r.country) {
                  parts.push(r.country);
               }

               const builtAddress = parts.filter(Boolean).join(', ');
               if (builtAddress && builtAddress.length > 10) {
                  // Must be substantial
                  console.log('✅ Built Expo address:', builtAddress);
                  return builtAddress;
               }
            }
         } catch (e) {
            console.warn('❌ Expo reverseGeocodeAsync failed:', e);
         }

         console.log('❌ Could not find a human-readable address');
         return null;
      } catch (error) {
         console.error('Error reverse geocoding:', error);
         return null;
      }
   };

   const loadPopularLocations = async () => {
      if (!apiBaseUrl) return;

      try {
         // Get popular locations near the user's current location
         const locationBias = currentLocation
            ? `${currentLocation.coordinates?.latitude},${currentLocation.coordinates?.longitude}`
            : null;

         const popularQueries = [
            'restaurants near me',
            'shopping centers',
            'hospitals',
            'schools',
            'hotels',
            'banks',
         ];

         const allPopularLocations: GooglePlacePrediction[] = [];

         for (const query of popularQueries.slice(0, 3)) {
            // Limit to first 3 to avoid too many requests
            try {
               const url = locationBias
                  ? `${apiBaseUrl}/api/places/autocomplete?input=${encodeURIComponent(
                       query
                    )}&location=${locationBias}&radius=10000`
                  : `${apiBaseUrl}/api/places/autocomplete?input=${encodeURIComponent(
                       query
                    )}`;

               const response = await fetch(url);
               if (response.ok) {
                  const data = await response.json();
                  if (data.predictions && Array.isArray(data.predictions)) {
                     // Take first 2 results from each query
                     allPopularLocations.push(...data.predictions.slice(0, 2));
                  }
               }
            } catch (error) {
               console.warn(
                  `Failed to load popular locations for "${query}":`,
                  error
               );
            }
         }

         // Remove duplicates and limit to 6 total
         const uniqueLocations = allPopularLocations
            .filter(
               (location, index, self) =>
                  index ===
                  self.findIndex((l) => l.place_id === location.place_id)
            )
            .slice(0, 6);

         setPopularLocations(uniqueLocations);
      } catch (error) {
         console.error('Error loading popular locations:', error);
      }
   };

   const searchPlaces = async (query: string) => {
      if (query.length < 3) {
         setPredictions([]);
         setShowPopularLocations(true);
         return;
      }

      if (!apiBaseUrl) {
         console.error('API base URL not available');
         return;
      }

      setIsLoading(true);
      setShowPopularLocations(false);

      try {
         // Add location bias to get results closer to user
         const locationBias = currentLocation
            ? `&location=${currentLocation.coordinates?.latitude},${currentLocation.coordinates?.longitude}&radius=50000`
            : '';

         const url = `${apiBaseUrl}/api/places/autocomplete?input=${encodeURIComponent(
            query
         )}${locationBias}`;

         console.log('Searching places with location bias:', url);

         const response = await fetch(url);

         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
         }

         const data = await response.json();
         console.log('Places API response:', data);

         if (data.predictions && Array.isArray(data.predictions)) {
            console.log(
               `Found ${data.predictions.length} predictions from Google Places API`
            );
            setPredictions(data.predictions);
         } else if (data.status === 'ZERO_RESULTS') {
            console.log('No results found for query:', query);
            setPredictions([]);
         } else if (data.error) {
            console.error('Places API error:', data.error);
            setPredictions([]);
         } else {
            console.error('Unexpected API response format:', data);
            setPredictions([]);
         }
      } catch (error) {
         console.error('Network error searching places:', error);
         console.log('Falling back to empty results');
         setPredictions([]);
      } finally {
         setIsLoading(false);
      }
   };

   const getPlaceDetails = async (placeId: string) => {
      try {
         setIsLoading(true);

         console.log('Getting place details for:', placeId);

         if (!apiBaseUrl) {
            console.error('API base URL not available');
            return;
         }

         const response = await fetch(
            `${apiBaseUrl}/api/places/details?place_id=${placeId}&fields=formatted_address,geometry,address_components,name,place_id`
         );

         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
         }

         const data = await response.json();
         console.log('Place details response:', data);

         if (
            data.result &&
            data.result.geometry &&
            data.result.geometry.location
         ) {
            // Get the best address from the result
            let bestAddress = data.result.formatted_address;

            // If the formatted_address is a Plus Code, try to build a better address
            if (
               bestAddress &&
               (bestAddress.match(/^[A-Z0-9]{4}\+[A-Z0-9]{2,3}$/) ||
                  bestAddress.startsWith('+'))
            ) {
               console.log(
                  'Plus Code detected, trying to build better address from components'
               );

               // Try to build address from components first
               if (
                  data.result.address_components &&
                  data.result.address_components.length > 0
               ) {
                  const components = data.result.address_components;

                  const getComponent = (types: string[]) => {
                     const component = components.find((c: any) =>
                        types.some((type) => c.types.includes(type))
                     );
                     return component ? component.long_name : null;
                  };

                  const addressParts = [
                     getComponent(['street_number', 'premise']),
                     getComponent(['route', 'street_address']),
                     getComponent(['neighborhood', 'sublocality', 'locality']),
                     getComponent(['administrative_area_level_1']),
                     getComponent(['country']),
                  ].filter(Boolean);

                  if (addressParts.length >= 2) {
                     bestAddress = addressParts.join(', ');
                     console.log('Built address from components:', bestAddress);
                  } else if (
                     data.result.name &&
                     !data.result.name.match(/^[A-Z0-9]{4}\+/)
                  ) {
                     bestAddress = data.result.name;
                     console.log('Using place name as address:', bestAddress);
                  }
               }

               // If we still have a Plus Code, use the original search prediction text
               if (
                  bestAddress &&
                  bestAddress.match(/^[A-Z0-9]{4}\+[A-Z0-9]{2,3}$/) &&
                  selectedPrediction
               ) {
                  const predictionText = selectedPrediction.description;
                  if (
                     predictionText &&
                     !predictionText.match(/^[A-Z0-9]{4}\+/)
                  ) {
                     bestAddress = predictionText;
                     console.log(
                        'Using prediction text as address:',
                        bestAddress
                     );
                  }
               }
            }

            // If we still have a Plus Code, use a more descriptive format
            if (
               bestAddress &&
               bestAddress.match(/^[A-Z0-9]{4}\+[A-Z0-9]{2,3}$/)
            ) {
               bestAddress = `Location (${bestAddress})`;
            }

            const location: LocationData = {
               address: bestAddress,
               coordinates: {
                  latitude: data.result.geometry.location.lat,
                  longitude: data.result.geometry.location.lng,
               },
               placeId: placeId,
            };

            console.log('Selected location:', location);
            onLocationSelect(location);
            onClose();
         } else if (data.status === 'NOT_FOUND') {
            Alert.alert(
               'Location not found',
               'The selected location could not be found. Please try another location.'
            );
         } else {
            console.error('Invalid place details response:', data);
            Alert.alert(
               'Error',
               'Failed to get location details. Please try again.'
            );
         }
      } catch (error) {
         console.error('Error getting place details:', error);
         Alert.alert(
            'Network Error',
            'Failed to get location details. Please check your connection and try again.'
         );
      } finally {
         setIsLoading(false);
      }
   };

   const handleCurrentLocationSelect = () => {
      if (currentLocation) {
         onLocationSelect(currentLocation);
         onClose();
      }
   };

   const handleSearchChange = (text: string) => {
      console.log('Search text changed:', text);
      setSearchQuery(text);

      if (text.length === 0) {
         setShowPopularLocations(true);
         setPredictions([]);
      } else {
         searchPlaces(text);
      }
   };

   console.log(
      'LocationSelector rendered - isOpen:',
      isOpen,
      'predictions:',
      predictions.length
   );

   const renderPrediction = ({ item }: { item: GooglePlacePrediction }) => (
      <TouchableOpacity
         style={styles.predictionItem}
         onPress={() => {
            setSelectedPrediction(item);
            getPlaceDetails(item.place_id);
         }}
      >
         <Text style={styles.predictionMain}>
            {item.structured_formatting.main_text}
         </Text>
         <Text style={styles.predictionSecondary}>
            {item.structured_formatting.secondary_text}
         </Text>
      </TouchableOpacity>
   );

   return (
      <Modal
         visible={isOpen}
         animationType="fade"
         transparent={true}
         onRequestClose={onClose}
         statusBarTranslucent={true}
      >
         <View style={styles.modalOverlay}>
            <SafeAreaView style={styles.modalContainer}>
               <View style={styles.header}>
                  <Text style={styles.title}>{title}</Text>
                  <TouchableOpacity
                     onPress={onClose}
                     style={styles.closeButton}
                  >
                     <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
               </View>

               <View style={styles.searchContainer}>
                  <TextInput
                     style={styles.searchInput}
                     placeholder={placeholder}
                     value={searchQuery}
                     onChangeText={handleSearchChange}
                     autoFocus={true}
                  />
               </View>

               {currentLocation && (
                  <TouchableOpacity
                     style={styles.currentLocationButton}
                     onPress={handleCurrentLocationSelect}
                  >
                     <Text style={styles.currentLocationIcon}>📍</Text>
                     <View style={styles.currentLocationTextContainer}>
                        <Text style={styles.currentLocationTitle}>
                           Use Current Location
                        </Text>
                        <Text style={styles.currentLocationAddress}>
                           {currentLocation.address}
                        </Text>
                     </View>
                  </TouchableOpacity>
               )}

               {isLoading && (
                  <View style={styles.loadingContainer}>
                     <ActivityIndicator size="small" color="#00719c" />
                     <Text style={styles.loadingText}>Searching...</Text>
                  </View>
               )}

               {showPopularLocations && searchQuery.length === 0 && (
                  <View style={styles.popularLocationsContainer}>
                     <Text style={styles.popularLocationsTitle}>
                        Popular Locations Nearby
                     </Text>
                     <FlatList
                        data={popularLocations}
                        keyExtractor={(item) => item.place_id}
                        renderItem={renderPrediction}
                        style={styles.popularLocationsList}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                           <View style={styles.emptyStateContainer}>
                              <Text style={styles.emptyStateIcon}>🏢</Text>
                              <Text style={styles.emptyStateTitle}>
                                 Find Your Location
                              </Text>
                              <Text style={styles.emptyStateText}>
                                 Start typing to search for addresses,
                                 businesses, or landmarks near you
                              </Text>
                              <View style={styles.searchTipsContainer}>
                                 <Text style={styles.searchTipsTitle}>
                                    Search Tips:
                                 </Text>
                                 <Text style={styles.searchTipsItem}>
                                    • Try street names + city
                                 </Text>
                                 <Text style={styles.searchTipsItem}>
                                    • Business names
                                 </Text>
                                 <Text style={styles.searchTipsItem}>
                                    • Landmarks or buildings
                                 </Text>
                              </View>
                           </View>
                        }
                     />
                  </View>
               )}

               {!showPopularLocations && (
                  <FlatList
                     data={predictions}
                     keyExtractor={(item) => item.place_id}
                     renderItem={renderPrediction}
                     style={styles.predictionsList}
                     showsVerticalScrollIndicator={false}
                     ListEmptyComponent={
                        searchQuery.length >= 3 && !isLoading ? (
                           <View style={styles.emptyStateContainer}>
                              <Text style={styles.emptyStateIcon}>🔍</Text>
                              <Text style={styles.emptyStateTitle}>
                                 No results found
                              </Text>
                              <Text style={styles.emptyStateText}>
                                 Try a different search term or check your
                                 spelling
                              </Text>
                           </View>
                        ) : null
                     }
                  />
               )}
            </SafeAreaView>
         </View>
      </Modal>
   );
};

const styles = StyleSheet.create({
   modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'flex-start',
      paddingTop: 50,
   },
   modalContainer: {
      backgroundColor: 'white',
      borderRadius: 20,
      margin: 20,
      maxHeight: '85%',
      minHeight: '70%',
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: {
         width: 0,
         height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
   },
   header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#E0E0E0',
   },
   title: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
   },
   closeButton: {
      padding: 5,
   },
   closeButtonText: {
      fontSize: 20,
      color: '#666',
   },
   searchContainer: {
      padding: 20,
      paddingBottom: 10,
   },
   searchInput: {
      borderWidth: 1,
      borderColor: '#E0E0E0',
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
      backgroundColor: '#F8F8F8',
   },
   currentLocationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      marginHorizontal: 20,
      marginBottom: 10,
      backgroundColor: '#F0F8FF',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#00719c',
   },
   currentLocationIcon: {
      fontSize: 20,
      marginRight: 15,
   },
   currentLocationTextContainer: {
      flex: 1,
   },
   currentLocationTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#00719c',
      marginBottom: 2,
   },
   currentLocationAddress: {
      fontSize: 14,
      color: '#666',
   },
   loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
   },
   loadingText: {
      marginLeft: 10,
      color: '#666',
   },
   popularLocationsContainer: {
      paddingHorizontal: 20,
      marginBottom: 10,
   },
   popularLocationsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 10,
      paddingLeft: 10,
   },
   popularLocationsList: {
      maxHeight: 200,
   },
   predictionsList: {
      flex: 1,
      paddingHorizontal: 20,
   },
   predictionItem: {
      paddingVertical: 15,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
   },
   predictionMain: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333',
      marginBottom: 2,
   },
   predictionSecondary: {
      fontSize: 14,
      color: '#666',
   },
   emptyStateContainer: {
      alignItems: 'center',
      padding: 40,
      paddingHorizontal: 20,
   },
   emptyStateIcon: {
      fontSize: 48,
      marginBottom: 16,
   },
   emptyStateTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
      marginBottom: 8,
      textAlign: 'center',
   },
   emptyStateText: {
      fontSize: 14,
      color: '#666',
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
   },
   searchTipsContainer: {
      backgroundColor: '#F8F9FA',
      padding: 16,
      borderRadius: 8,
      width: '100%',
   },
   searchTipsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: '#00719c',
      marginBottom: 8,
   },
   searchTipsItem: {
      fontSize: 13,
      color: '#666',
      marginBottom: 4,
   },
});

export default LocationSelector;
