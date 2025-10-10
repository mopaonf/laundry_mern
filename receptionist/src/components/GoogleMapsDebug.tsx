import React, { useState, useEffect } from 'react';
import { loadGoogleMaps, isGoogleMapsReady } from '../utils/googleMapsLoader';

/**
 * Debug component to test Google Maps loading
 * Add this to a page temporarily to verify Google Maps is loading correctly
 */
export default function GoogleMapsDebug() {
   const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
      'loading'
   );
   const [error, setError] = useState<string | null>(null);
   const [details, setDetails] = useState<any>({});

   useEffect(() => {
      const testGoogleMaps = async () => {
         try {
            setStatus('loading');
            console.log('🔄 Starting Google Maps loading test...');

            // Test the loader
            await loadGoogleMaps();

            console.log('✅ Google Maps loaded successfully');

            // Check if everything is available
            const checks = {
               googleExists: !!window.google,
               mapsExists: !!(window.google && window.google.maps),
               placesExists: !!(
                  window.google &&
                  window.google.maps &&
                  window.google.maps.places
               ),
               autocompleteExists: !!(
                  window.google &&
                  window.google.maps &&
                  window.google.maps.places &&
                  window.google.maps.places.Autocomplete
               ),
               geocoderExists: !!(
                  window.google &&
                  window.google.maps &&
                  window.google.maps.Geocoder
               ),
               placesServiceExists: !!(
                  window.google &&
                  window.google.maps &&
                  window.google.maps.places &&
                  window.google.maps.places.PlacesService
               ),
               isReady: isGoogleMapsReady(),
            };

            setDetails(checks);

            if (checks.autocompleteExists) {
               setStatus('loaded');
               console.log('✅ All Google Maps APIs are ready');
            } else {
               setStatus('error');
               setError('Some Google Maps APIs are missing');
               console.error('❌ Missing Google Maps APIs:', checks);
            }
         } catch (err) {
            setStatus('error');
            setError(err instanceof Error ? err.message : 'Unknown error');
            console.error('❌ Google Maps loading failed:', err);
         }
      };

      testGoogleMaps();
   }, []);

   return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
         <h3 className="text-lg font-semibold mb-4">
            Google Maps Debug Status
         </h3>

         <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center space-x-2">
               <span className="font-medium">Status:</span>
               {status === 'loading' && (
                  <span className="flex items-center space-x-2 text-blue-600">
                     <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                     <span>Loading...</span>
                  </span>
               )}
               {status === 'loaded' && (
                  <span className="text-green-600 font-medium">
                     ✅ Loaded Successfully
                  </span>
               )}
               {status === 'error' && (
                  <span className="text-red-600 font-medium">❌ Error</span>
               )}
            </div>

            {/* Error */}
            {error && (
               <div className="bg-red-50 border border-red-200 rounded p-3">
                  <span className="text-red-700 font-medium">Error: </span>
                  <span className="text-red-600">{error}</span>
               </div>
            )}

            {/* Details */}
            {Object.keys(details).length > 0 && (
               <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <h4 className="font-medium mb-2">API Availability:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                     {Object.entries(details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                           <span className="text-gray-600">{key}:</span>
                           <span
                              className={
                                 value ? 'text-green-600' : 'text-red-600'
                              }
                           >
                              {value ? '✅' : '❌'}
                           </span>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* Test Actions */}
            {status === 'loaded' && (
               <div className="space-y-2">
                  <button
                     onClick={() => {
                        try {
                           const autocomplete =
                              new window.google.maps.places.Autocomplete(
                                 document.createElement('input'),
                                 { types: ['address'] }
                              );
                           console.log(
                              '✅ Autocomplete instance created successfully:',
                              autocomplete
                           );
                           alert('✅ Autocomplete test passed!');
                        } catch (err) {
                           console.error('❌ Autocomplete test failed:', err);
                           alert(
                              '❌ Autocomplete test failed: ' +
                                 (err as Error).message
                           );
                        }
                     }}
                     className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                  >
                     Test Autocomplete
                  </button>

                  <button
                     onClick={() => {
                        try {
                           const geocoder = new window.google.maps.Geocoder();
                           console.log(
                              '✅ Geocoder instance created successfully:',
                              geocoder
                           );
                           alert('✅ Geocoder test passed!');
                        } catch (err) {
                           console.error('❌ Geocoder test failed:', err);
                           alert(
                              '❌ Geocoder test failed: ' +
                                 (err as Error).message
                           );
                        }
                     }}
                     className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                     Test Geocoder
                  </button>
               </div>
            )}
         </div>
      </div>
   );
}
