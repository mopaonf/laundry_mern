import AsyncStorage from '@react-native-async-storage/async-storage';

// API configuration with sensible defaults
const API_CONFIG = {
   // Default to the IP address of your PC on the hotspot network
   baseURL: 'http://172.20.10.5:5000',
   timeout: 10000,
   headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
   },
};

// Function to get the current API configuration
export const getApiConfig = async () => {
   try {
      // Try to get custom API URL from storage
      const storedBaseUrl = await AsyncStorage.getItem('api_base_url');

      if (storedBaseUrl) {
         return {
            ...API_CONFIG,
            baseURL: storedBaseUrl,
         };
      }

      return API_CONFIG;
   } catch (error) {
      console.error('Failed to load API config:', error);
      return API_CONFIG;
   }
};

// Function to update the API base URL
export const setApiBaseUrl = async (url: string) => {
   if (!url) return false;

   try {
      await AsyncStorage.setItem('api_base_url', url);
      return true;
   } catch (error) {
      console.error('Failed to save API base URL:', error);
      return false;
   }
};

export default API_CONFIG;
