'use client';

import { useState, useEffect, useRef } from 'react';
import { FiX, FiMapPin, FiNavigation } from 'react-icons/fi';

// Declare Google Maps types for TypeScript
declare global {
   interface Window {
      google: any;
      initMap?: () => void;
   }
}

interface MapViewModalProps {
   isOpen: boolean;
   onClose: () => void;
   order: {
      id: string;
      customer: string;
      pickupLocation?: {
         address: string;
         coordinates: {
            latitude: number;
            longitude: number;
         };
      };
      dropoffLocation?: {
         address: string;
         coordinates: {
            latitude: number;
            longitude: number;
         };
      };
      runnerLocation?: {
         latitude: number;
         longitude: number;
      };
      status: string;
   };
}

// Global flag to track script loading
let isGoogleMapsLoading = false;
let isGoogleMapsLoaded = false;

const loadGoogleMapsScript = (): Promise<void> => {
   return new Promise((resolve, reject) => {
      // If already loaded
      if (isGoogleMapsLoaded && window.google) {
         resolve();
         return;
      }

      // If currently loading, wait for it
      if (isGoogleMapsLoading) {
         const checkLoaded = () => {
            if (isGoogleMapsLoaded && window.google) {
               resolve();
            } else {
               setTimeout(checkLoaded, 100);
            }
         };
         checkLoaded();
         return;
      }

      // Check if script already exists
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
         if (window.google) {
            isGoogleMapsLoaded = true;
            resolve();
            return;
         }
         // Script exists but not loaded yet, wait for it
         const checkLoaded = () => {
            if (window.google) {
               isGoogleMapsLoaded = true;
               resolve();
            } else {
               setTimeout(checkLoaded, 100);
            }
         };
         checkLoaded();
         return;
      }

      // Load the script
      isGoogleMapsLoading = true;
      const script = document.createElement('script');
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

      if (!apiKey) {
         reject(new Error('Google Maps API key is not configured'));
         return;
      }

      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
         isGoogleMapsLoading = false;
         isGoogleMapsLoaded = true;
         resolve();
      };

      script.onerror = () => {
         isGoogleMapsLoading = false;
         reject(new Error('Failed to load Google Maps script'));
      };

      document.head.appendChild(script);

      // Timeout after 10 seconds
      setTimeout(() => {
         if (isGoogleMapsLoading) {
            isGoogleMapsLoading = false;
            reject(new Error('Google Maps script loading timeout'));
         }
      }, 10000);
   });
};

export default function MapViewModal({
   isOpen,
   onClose,
   order,
}: MapViewModalProps) {
   const mapRef = useRef<HTMLDivElement>(null);
   const [map, setMap] = useState<any>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const markersRef = useRef<any[]>([]);

   // Initialize Google Maps
   useEffect(() => {
      if (!isOpen) {
         return;
      }

      const initMap = async () => {
         try {
            setIsLoading(true);
            setError(null);

            console.log('MapViewModal: Starting map initialization...');
            console.log('Order data:', order);

            // Check if order has any location data
            if (!order.pickupLocation && !order.dropoffLocation) {
               console.log('No location data found in order');
               setError('No location data available for this order');
               setIsLoading(false);
               return;
            }

            console.log('Location data found, proceeding...');

            // Check if map container is available immediately
            if (!mapRef.current) {
               console.log('Map container ref not available, waiting...');
               // Wait a bit more for the DOM to be ready
               await new Promise((resolve) => setTimeout(resolve, 200));
            }

            if (!mapRef.current) {
               console.error(
                  'Map container ref still not available after waiting'
               );
               // Don't throw error, just fall back to showing location info
               setError(
                  'Map display unavailable. Showing location information below.'
               );
               setIsLoading(false);
               return;
            }

            console.log('Map container ref is available');

            // Check if we have a valid API key
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
            if (!apiKey || apiKey === 'your_actual_google_maps_api_key_here') {
               console.log(
                  'No valid Google Maps API key, showing location summary instead'
               );
               setError(
                  'Google Maps API key not configured. Showing location information below.'
               );
               setIsLoading(false);
               return;
            }

            // Load Google Maps script
            try {
               await loadGoogleMapsScript();
            } catch (mapError) {
               console.error('Failed to load Google Maps:', mapError);
               setError(
                  'Failed to load Google Maps. Showing location information below.'
               );
               setIsLoading(false);
               return;
            }

            if (!mapRef.current) {
               setError('Map container not found');
               setIsLoading(false);
               return;
            }

            // Clear existing markers
            markersRef.current.forEach((marker) => marker.setMap(null));
            markersRef.current = [];

            // Create map instance
            const center = order.pickupLocation?.coordinates ||
               order.dropoffLocation?.coordinates || {
                  latitude: 4.0511,
                  longitude: 9.7679,
               }; // Default to Douala

            const mapInstance = new window.google.maps.Map(mapRef.current, {
               zoom: 13,
               center: { lat: center.latitude, lng: center.longitude },
               mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            });

            setMap(mapInstance);

            const bounds = new window.google.maps.LatLngBounds();
            let hasMarkers = false;

            // Add pickup marker
            if (order.pickupLocation) {
               const pickupMarker = new window.google.maps.Marker({
                  position: {
                     lat: order.pickupLocation.coordinates.latitude,
                     lng: order.pickupLocation.coordinates.longitude,
                  },
                  map: mapInstance,
                  title: 'Pickup Location',
                  icon: {
                     path: window.google.maps.SymbolPath.CIRCLE,
                     fillColor: '#10B981', // Green
                     fillOpacity: 1,
                     strokeColor: '#065F46',
                     strokeWeight: 2,
                     scale: 10,
                  },
               });

               // Add pickup info window
               const pickupInfoWindow = new window.google.maps.InfoWindow({
                  content: `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="margin: 0 0 8px 0; color: #065F46; font-size: 14px; font-weight: bold;">
                  📍 Pickup Location
                </h3>
                <p style="margin: 0; font-size: 12px; color: #374151;">
                  ${order.pickupLocation.address}
                </p>
              </div>
            `,
               });

               pickupMarker.addListener('click', () => {
                  pickupInfoWindow.open(mapInstance, pickupMarker);
               });

               markersRef.current.push(pickupMarker);
               bounds.extend(pickupMarker.getPosition()!);
               hasMarkers = true;
            }

            // Add dropoff marker
            if (order.dropoffLocation) {
               const dropoffMarker = new window.google.maps.Marker({
                  position: {
                     lat: order.dropoffLocation.coordinates.latitude,
                     lng: order.dropoffLocation.coordinates.longitude,
                  },
                  map: mapInstance,
                  title: 'Dropoff Location',
                  icon: {
                     path: window.google.maps.SymbolPath.CIRCLE,
                     fillColor: '#EF4444', // Red
                     fillOpacity: 1,
                     strokeColor: '#991B1B',
                     strokeWeight: 2,
                     scale: 10,
                  },
               });

               // Add dropoff info window
               const dropoffInfoWindow = new window.google.maps.InfoWindow({
                  content: `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="margin: 0 0 8px 0; color: #991B1B; font-size: 14px; font-weight: bold;">
                  🏁 Dropoff Location
                </h3>
                <p style="margin: 0; font-size: 12px; color: #374151;">
                  ${order.dropoffLocation.address}
                </p>
              </div>
            `,
               });

               dropoffMarker.addListener('click', () => {
                  dropoffInfoWindow.open(mapInstance, dropoffMarker);
               });

               markersRef.current.push(dropoffMarker);
               bounds.extend(dropoffMarker.getPosition()!);
               hasMarkers = true;
            }

            // Add runner marker if available
            if (order.runnerLocation) {
               const runnerMarker = new window.google.maps.Marker({
                  position: {
                     lat: order.runnerLocation.latitude,
                     lng: order.runnerLocation.longitude,
                  },
                  map: mapInstance,
                  title: 'Runner Location',
                  icon: {
                     path: window.google.maps.SymbolPath.CIRCLE,
                     fillColor: '#3B82F6', // Blue
                     fillOpacity: 1,
                     strokeColor: '#1E40AF',
                     strokeWeight: 2,
                     scale: 8,
                  },
               });

               // Add runner info window
               const runnerInfoWindow = new window.google.maps.InfoWindow({
                  content: `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="margin: 0 0 8px 0; color: #1E40AF; font-size: 14px; font-weight: bold;">
                  🚚 Runner Location
                </h3>
                <p style="margin: 0; font-size: 12px; color: #374151;">
                  Current position
                </p>
              </div>
            `,
               });

               runnerMarker.addListener('click', () => {
                  runnerInfoWindow.open(mapInstance, runnerMarker);
               });

               markersRef.current.push(runnerMarker);
               bounds.extend(runnerMarker.getPosition()!);
               hasMarkers = true;
            }

            // Fit map to show all markers
            if (hasMarkers) {
               if (markersRef.current.length > 1) {
                  mapInstance.fitBounds(bounds);
                  // Ensure minimum zoom level
                  const maxZoom = 15;
                  const listener = window.google.maps.event.addListener(
                     mapInstance,
                     'idle',
                     () => {
                        if (mapInstance.getZoom() > maxZoom) {
                           mapInstance.setZoom(maxZoom);
                        }
                        window.google.maps.event.removeListener(listener);
                     }
                  );
               } else {
                  mapInstance.setZoom(15);
               }
            }

            setIsLoading(false);
         } catch (error) {
            console.error('Error initializing map:', error);
            setError(
               error instanceof Error ? error.message : 'Failed to load map'
            );
            setIsLoading(false);
         }
      };

      initMap();
   }, [isOpen, order]);

   // Cleanup markers when modal closes
   useEffect(() => {
      if (!isOpen) {
         markersRef.current.forEach((marker) => marker.setMap(null));
         markersRef.current = [];
         setMap(null);
      }
   }, [isOpen]);

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 p-4">
         {/* Gradient overlay that simulates blur effect */}
         <div
            className="absolute inset-0"
            style={{
               background:
                  'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.1) 100%)',
               backdropFilter: 'blur(12px) saturate(180%)',
               WebkitBackdropFilter: 'blur(12px) saturate(180%)',
            }}
         />
         {/* Modal content */}
         <div className="relative flex items-center justify-center h-full">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
               {/* Header */}
               <div className="flex justify-between items-center p-6 border-b">
                  <div>
                     <h2 className="text-xl font-semibold text-gray-900">
                        Order Location Map
                     </h2>
                     <p className="text-sm text-gray-500 mt-1">
                        Customer: {order.customer} • Status: {order.status}
                     </p>
                  </div>
                  <button
                     onClick={onClose}
                     className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                     <FiX className="w-5 h-5" />
                  </button>
               </div>

               {/* Content */}
               <div className="flex-1 min-h-0 relative">
                  {/* Always render the map container div so ref is available */}
                  <div
                     ref={mapRef}
                     className={`w-full h-96 ${
                        error || isLoading ? 'hidden' : ''
                     }`}
                  />

                  {error ? (
                     <div className="absolute inset-0 p-6 overflow-y-auto">
                        <div className="text-center mb-6">
                           <FiMapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                           <h3 className="text-lg font-medium text-gray-900 mb-2">
                              Map Unavailable
                           </h3>
                           <p className="text-gray-500 mb-4">{error}</p>
                           {error.includes('API key') && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                                 <h4 className="font-medium text-blue-900 mb-2">
                                    To enable Google Maps:
                                 </h4>
                                 <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                                    <li>
                                       Get an API key from{' '}
                                       <a
                                          href="https://console.cloud.google.com/"
                                          target="_blank"
                                          className="underline"
                                       >
                                          Google Cloud Console
                                       </a>
                                    </li>
                                    <li>
                                       Enable Maps JavaScript API and Places API
                                    </li>
                                    <li>Add the key to your .env.local file</li>
                                 </ol>
                              </div>
                           )}
                        </div>

                        {/* Show location information even without map */}
                        <div className="space-y-4">
                           <h4 className="font-medium text-gray-900 text-center mb-4">
                              Location Information
                           </h4>

                           {order.pickupLocation && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                 <div className="flex items-start space-x-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                       <h5 className="font-medium text-green-900">
                                          Pickup Location
                                       </h5>
                                       <p className="text-green-700 mt-1">
                                          {order.pickupLocation.address}
                                       </p>
                                       <p className="text-sm text-green-600 mt-1">
                                          Coordinates:{' '}
                                          {order.pickupLocation.coordinates.latitude.toFixed(
                                             6
                                          )}
                                          ,{' '}
                                          {order.pickupLocation.coordinates.longitude.toFixed(
                                             6
                                          )}
                                       </p>
                                    </div>
                                 </div>
                              </div>
                           )}

                           {order.dropoffLocation && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                 <div className="flex items-start space-x-3">
                                    <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                       <h5 className="font-medium text-red-900">
                                          Dropoff Location
                                       </h5>
                                       <p className="text-red-700 mt-1">
                                          {order.dropoffLocation.address}
                                       </p>
                                       <p className="text-sm text-red-600 mt-1">
                                          Coordinates:{' '}
                                          {order.dropoffLocation.coordinates.latitude.toFixed(
                                             6
                                          )}
                                          ,{' '}
                                          {order.dropoffLocation.coordinates.longitude.toFixed(
                                             6
                                          )}
                                       </p>
                                    </div>
                                 </div>
                              </div>
                           )}

                           {order.runnerLocation && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                 <div className="flex items-start space-x-3">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <div>
                                       <h5 className="font-medium text-blue-900">
                                          Runner Location
                                       </h5>
                                       <p className="text-blue-700 mt-1">
                                          Live tracking available
                                       </p>
                                       <p className="text-sm text-blue-600 mt-1">
                                          Coordinates:{' '}
                                          {order.runnerLocation.latitude.toFixed(
                                             6
                                          )}
                                          ,{' '}
                                          {order.runnerLocation.longitude.toFixed(
                                             6
                                          )}
                                       </p>
                                    </div>
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  ) : isLoading ? (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                           <p className="text-gray-500">Loading map...</p>
                        </div>
                     </div>
                  ) : null}
               </div>

               {/* Footer with location info */}
               <div className="p-6 border-t bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {order.pickupLocation && (
                        <div className="flex items-start space-x-3">
                           <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                           <div>
                              <h4 className="font-medium text-gray-900">
                                 Pickup Location
                              </h4>
                              <p className="text-sm text-gray-600">
                                 {order.pickupLocation.address}
                              </p>
                           </div>
                        </div>
                     )}
                     {order.dropoffLocation && (
                        <div className="flex items-start space-x-3">
                           <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                           <div>
                              <h4 className="font-medium text-gray-900">
                                 Dropoff Location
                              </h4>
                              <p className="text-sm text-gray-600">
                                 {order.dropoffLocation.address}
                              </p>
                           </div>
                        </div>
                     )}
                  </div>
                  {order.runnerLocation && (
                     <div className="mt-4 pt-4 border-t">
                        <div className="flex items-start space-x-3">
                           <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                           <div>
                              <h4 className="font-medium text-gray-900">
                                 Runner Location
                              </h4>
                              <p className="text-sm text-gray-600">
                                 Live tracking available
                              </p>
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
