// Test Google Maps Loading
// This script helps debug Google Maps API loading issues

import { loadGoogleMaps, isGoogleMapsReady } from '../utils/googleMapsLoader';

export const testGoogleMapsLoading = async (): Promise<void> => {
   console.log('=== Google Maps Loading Test ===');

   try {
      console.log('1. Checking initial state...');
      console.log('Is Google Maps ready?', isGoogleMapsReady());
      console.log('window.google exists?', !!window.google);

      if (window.google) {
         console.log('window.google.maps exists?', !!window.google.maps);
         console.log(
            'window.google.maps.places exists?',
            !!window.google.maps?.places
         );
         console.log(
            'window.google.maps.places.Autocomplete exists?',
            !!window.google.maps?.places?.Autocomplete
         );
      }

      console.log('2. Loading Google Maps...');
      await loadGoogleMaps({
         libraries: ['places'],
         region: 'CM',
         language: 'en',
      });

      console.log('3. Verifying after load...');
      console.log('Is Google Maps ready?', isGoogleMapsReady());
      console.log('window.google exists?', !!window.google);
      console.log('window.google.maps exists?', !!window.google.maps);
      console.log(
         'window.google.maps.places exists?',
         !!window.google.maps.places
      );
      console.log(
         'window.google.maps.places.Autocomplete exists?',
         !!window.google.maps.places.Autocomplete
      );
      console.log(
         'window.google.maps.places.PlacesService exists?',
         !!window.google.maps.places.PlacesService
      );
      console.log(
         'window.google.maps.Geocoder exists?',
         !!window.google.maps.Geocoder
      );

      console.log('✅ Google Maps loading test completed successfully!');
   } catch (error) {
      console.error('❌ Google Maps loading test failed:', error);
      throw error;
   }
};

// Auto-run test when module is imported in development
if (process.env.NODE_ENV === 'development') {
   // Delay test to allow component to mount
   setTimeout(() => {
      testGoogleMapsLoading().catch(console.error);
   }, 2000);
}
