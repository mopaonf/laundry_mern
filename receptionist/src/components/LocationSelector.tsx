import React, { useState, useEffect, useRef } from 'react';
import { loadGoogleMaps } from '../utils/googleMapsLoader';

interface Location {
   address: string;
   coordinates: {
      latitude: number;
      longitude: number;
   } | null;
   placeId: string | null;
}

interface LocationSelectorProps {
   onLocationSelect: (location: Location) => void;
   defaultLocation?: Location | null;
   placeholder?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
   onLocationSelect,
   defaultLocation = null,
   placeholder = 'Enter delivery address',
}) => {
   const [address, setAddress] = useState(defaultLocation?.address || '');
   const [suggestions, setSuggestions] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [showSuggestions, setShowSuggestions] = useState(false);
   const autocompleteRef = useRef<HTMLInputElement>(null);
   const debounceRef = useRef<NodeJS.Timeout | null>(null);

   useEffect(() => {
      // Load Google Maps API using centralized loader
      const initMaps = async () => {
         try {
            console.log('LocationSelector: Loading Google Maps...');
            await loadGoogleMaps();
            console.log(
               'LocationSelector: Google Maps loaded, initializing autocomplete...'
            );
            initializeAutocomplete();
         } catch (error) {
            console.error(
               'LocationSelector: Failed to load Google Maps:',
               error
            );
         }
      };

      initMaps();
   }, []);

   const initializeAutocomplete = () => {
      if (!autocompleteRef.current) {
         console.log('LocationSelector: Autocomplete ref not available yet');
         return;
      }

      if (!window.google || !window.google.maps || !window.google.maps.places) {
         console.error(
            'LocationSelector: Google Maps or Places API not available'
         );
         return;
      }

      try {
         console.log('LocationSelector: Creating autocomplete instance...');
         const autocomplete = new window.google.maps.places.Autocomplete(
            autocompleteRef.current,
            {
               types: ['address'],
               componentRestrictions: { country: 'cm' }, // Restrict to Cameroon
            }
         );

         autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.geometry) {
               const location: Location = {
                  address: place.formatted_address || '',
                  coordinates: {
                     latitude: place.geometry.location.lat(),
                     longitude: place.geometry.location.lng(),
                  },
                  placeId: place.place_id || null,
               };

               setAddress(place.formatted_address || '');
               onLocationSelect(location);
               setShowSuggestions(false);
            }
         });

         console.log('LocationSelector: Autocomplete initialized successfully');
      } catch (error) {
         console.error(
            'LocationSelector: Error initializing autocomplete:',
            error
         );
      }
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setAddress(value);

      // Clear previous debounce
      if (debounceRef.current) {
         clearTimeout(debounceRef.current);
      }

      // Debounce the search
      debounceRef.current = setTimeout(() => {
         if (value.length > 2 && window.google) {
            searchPlaces(value);
         } else {
            setSuggestions([]);
            setShowSuggestions(false);
         }
      }, 300);
   };

   const searchPlaces = (query: string) => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
         console.error(
            'LocationSelector: Google Maps Places API not available for search'
         );
         return;
      }

      setIsLoading(true);
      const service = new window.google.maps.places.AutocompleteService();

      service.getPlacePredictions(
         {
            input: query,
            componentRestrictions: { country: 'cm' },
            types: ['address'],
         },
         (predictions: any, status: any) => {
            setIsLoading(false);
            if (
               status === window.google.maps.places.PlacesServiceStatus.OK &&
               predictions
            ) {
               setSuggestions(predictions.slice(0, 5)); // Limit to 5 suggestions
               setShowSuggestions(true);
            } else {
               console.log(
                  'LocationSelector: No predictions found or error:',
                  status
               );
               setSuggestions([]);
               setShowSuggestions(false);
            }
         }
      );
   };

   const handleSuggestionSelect = (suggestion: any) => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
         console.error(
            'LocationSelector: Google Maps Places API not available for place details'
         );
         return;
      }

      const service = new window.google.maps.places.PlacesService(
         document.createElement('div')
      );

      service.getDetails(
         {
            placeId: suggestion.place_id,
            fields: ['formatted_address', 'geometry', 'place_id'],
         },
         (place: any, status: any) => {
            if (
               status === window.google.maps.places.PlacesServiceStatus.OK &&
               place
            ) {
               const location: Location = {
                  address: place.formatted_address || '',
                  coordinates: place.geometry?.location
                     ? {
                          latitude: place.geometry.location.lat(),
                          longitude: place.geometry.location.lng(),
                       }
                     : null,
                  placeId: place.place_id || null,
               };

               setAddress(place.formatted_address || '');
               onLocationSelect(location);
               setShowSuggestions(false);
            } else {
               console.error(
                  'LocationSelector: Failed to get place details:',
                  status
               );
            }
         }
      );
   };

   const handleManualEntry = () => {
      if (address.trim()) {
         if (!window.google || !window.google.maps) {
            console.error(
               'LocationSelector: Google Maps API not available for geocoding'
            );
            // Still allow manual entry without geocoding
            const location: Location = {
               address: address,
               coordinates: null,
               placeId: null,
            };
            onLocationSelect(location);
            setShowSuggestions(false);
            return;
         }

         // For manual entry, we'll geocode the address
         const geocoder = new window.google.maps.Geocoder();
         geocoder.geocode({ address: address }, (results: any, status: any) => {
            if (status === 'OK' && results && results[0]) {
               const location: Location = {
                  address: results[0].formatted_address || address,
                  coordinates: results[0].geometry?.location
                     ? {
                          latitude: results[0].geometry.location.lat(),
                          longitude: results[0].geometry.location.lng(),
                       }
                     : null,
                  placeId: results[0].place_id || null,
               };

               setAddress(results[0].formatted_address || address);
               onLocationSelect(location);
            } else {
               console.log('LocationSelector: Geocoding failed:', status);
               // If geocoding fails, still allow manual entry
               const location: Location = {
                  address: address,
                  coordinates: null,
                  placeId: null,
               };
               onLocationSelect(location);
            }
         });
      }
      setShowSuggestions(false);
   };

   return (
      <div className="relative">
         <div className="flex">
            <input
               ref={autocompleteRef}
               type="text"
               value={address}
               onChange={handleInputChange}
               onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
               onFocus={() => {
                  if (suggestions.length > 0) {
                     setShowSuggestions(true);
                  }
               }}
               placeholder={placeholder}
               className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
               type="button"
               onClick={handleManualEntry}
               className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
               Use Address
            </button>
         </div>

         {/* Loading indicator */}
         {isLoading && (
            <div className="absolute right-3 top-3">
               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
         )}

         {/* Suggestions dropdown */}
         {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
               {suggestions.map((suggestion, index) => (
                  <div
                     key={suggestion.place_id}
                     onClick={() => handleSuggestionSelect(suggestion)}
                     className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                     <div className="font-medium text-sm">
                        {suggestion.structured_formatting.main_text}
                     </div>
                     <div className="text-xs text-gray-600">
                        {suggestion.structured_formatting.secondary_text}
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
};

export default LocationSelector;
