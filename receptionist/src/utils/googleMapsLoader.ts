// Google Maps Loader Utility
// This prevents multiple Google Maps script loads which cause errors

// Global state tracking
let isGoogleMapsLoaded = false;
let isGoogleMapsLoading = false;
let loadPromise: Promise<void> | null = null;

// Global types
declare global {
   interface Window {
      google: any;
      initMap?: () => void;
   }
}

export interface GoogleMapsLoaderOptions {
   libraries?: string[];
   region?: string;
   language?: string;
}

/**
 * Load Google Maps JavaScript API
 * This function ensures the script is only loaded once and handles multiple concurrent requests
 */
export const loadGoogleMaps = (
   options: GoogleMapsLoaderOptions = {}
): Promise<void> => {
   // Default options
   const {
      libraries = ['places'],
      region = 'CM', // Cameroon
      language = 'en',
   } = options;

   // If already loaded, resolve immediately
   if (isGoogleMapsLoaded && window.google) {
      return Promise.resolve();
   }

   // If currently loading, return the existing promise
   if (isGoogleMapsLoading && loadPromise) {
      return loadPromise;
   }

   // Check if script already exists in DOM
   const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com"]'
   );
   if (existingScript) {
      if (window.google) {
         isGoogleMapsLoaded = true;
         return Promise.resolve();
      }

      // Script exists but not loaded yet, wait for it
      if (loadPromise) {
         return loadPromise;
      }

      loadPromise = new Promise((resolve, reject) => {
         const checkLoaded = () => {
            if (window.google) {
               isGoogleMapsLoaded = true;
               isGoogleMapsLoading = false;
               resolve();
            } else {
               setTimeout(checkLoaded, 100);
            }
         };

         // Start checking
         checkLoaded();

         // Timeout after 15 seconds
         setTimeout(() => {
            if (!isGoogleMapsLoaded) {
               isGoogleMapsLoading = false;
               reject(new Error('Google Maps script loading timeout'));
            }
         }, 15000);
      });

      return loadPromise;
   }

   // Create new loading promise
   isGoogleMapsLoading = true;
   loadPromise = new Promise((resolve, reject) => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

      if (!apiKey || apiKey === 'your_actual_google_maps_api_key_here') {
         isGoogleMapsLoading = false;
         reject(
            new Error(
               'Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_API_KEY in your environment variables.'
            )
         );
         return;
      }

      // Create script element
      const script = document.createElement('script');

      // Build URL with parameters
      const params = new URLSearchParams({
         key: apiKey,
         libraries: libraries.join(','),
         region,
         language,
         loading: 'async',
      });

      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
      script.async = true;
      script.defer = true;

      // Handle successful loading
      script.onload = () => {
         console.log('Google Maps script loaded, waiting for libraries...');

         // Wait for Google Maps and libraries to be fully available
         const checkLibraries = () => {
            if (
               window.google &&
               window.google.maps &&
               window.google.maps.places &&
               window.google.maps.places.Autocomplete
            ) {
               console.log('Google Maps API and libraries loaded successfully');
               isGoogleMapsLoading = false;
               isGoogleMapsLoaded = true;
               resolve();
            } else {
               console.log('Waiting for Google Maps libraries to load...');
               setTimeout(checkLibraries, 100);
            }
         };

         // Start checking immediately
         checkLibraries();
      };

      // Handle loading errors
      script.onerror = (error) => {
         console.error('Failed to load Google Maps API:', error);
         isGoogleMapsLoading = false;
         document.head.removeChild(script);
         reject(
            new Error(
               'Failed to load Google Maps script. Please check your API key and network connection.'
            )
         );
      };

      // Add script to head
      document.head.appendChild(script);

      // Timeout after 15 seconds
      setTimeout(() => {
         if (isGoogleMapsLoading) {
            isGoogleMapsLoading = false;
            if (script.parentNode) {
               document.head.removeChild(script);
            }
            reject(
               new Error(
                  'Google Maps script loading timeout. Please check your network connection.'
               )
            );
         }
      }, 15000);
   });

   return loadPromise;
};

/**
 * Check if Google Maps is loaded
 */
export const isGoogleMapsReady = (): boolean => {
   return (
      isGoogleMapsLoaded &&
      !!window.google &&
      !!window.google.maps &&
      !!window.google.maps.places &&
      !!window.google.maps.places.Autocomplete
   );
};

/**
 * Wait for Google Maps to be ready
 */
export const waitForGoogleMaps = (): Promise<void> => {
   if (isGoogleMapsReady()) {
      return Promise.resolve();
   }

   return loadGoogleMaps();
};

/**
 * Reset the loader state (useful for testing)
 */
export const resetGoogleMapsLoader = (): void => {
   isGoogleMapsLoaded = false;
   isGoogleMapsLoading = false;
   loadPromise = null;
};

export default loadGoogleMaps;
