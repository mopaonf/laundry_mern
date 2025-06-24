import React, { useState } from 'react';
import {
   View,
   StyleSheet,
   Text,
   TouchableOpacity,
   ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
   PRODUCTION_API_URL,
   DEVICE_API_URL,
   EMULATOR_API_URL,
   FALLBACK_IPS,
   checkApiConnectivity,
} from '../utils/api';

// Custom colors for our API test screen
const CustomColors = {
   primary: '#0a7ea4',
   success: '#4CAF50',
   error: '#F44336',
   light: '#B0BEC5',
};

// API URLs to test
const urlsToTest = [
   { name: 'Production', url: PRODUCTION_API_URL },
   { name: 'Device', url: DEVICE_API_URL },
   { name: 'Emulator', url: EMULATOR_API_URL },
   ...FALLBACK_IPS.map((url, index) => ({
      name: `Fallback ${index + 1}`,
      url,
   })),
];

export default function ApiTestScreen() {
   const [results, setResults] = useState<
      Record<
         string,
         { status: 'pending' | 'success' | 'error'; message: string }
      >
   >({});
   const [isLoading, setIsLoading] = useState(false);
   const [overallStatus, setOverallStatus] = useState<
      'pending' | 'success' | 'error'
   >('pending');

   // Test a single API URL
   const testApiUrl = async (name: string, url: string) => {
      try {
         setResults((prev) => ({
            ...prev,
            [name]: { status: 'pending', message: 'Testing...' },
         }));

         const controller = new AbortController();
         const timeoutId = setTimeout(() => controller.abort(), 5000);

         const response = await fetch(`${url}/health`, {
            method: 'GET',
            signal: controller.signal,
         });

         clearTimeout(timeoutId);

         // Try to parse as JSON if possible
         let responseText;
         try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
               const json = await response.json();
               responseText = JSON.stringify(json);
            } else {
               responseText = await response.text();
            }
         } catch (e) {
            responseText = 'Could not parse response';
         }

         setResults((prev) => ({
            ...prev,
            [name]: {
               status: response.ok ? 'success' : 'error',
               message: `${response.status} ${
                  response.statusText || ''
               }\n${responseText.substring(0, 100)}`,
            },
         }));

         return response.ok;
      } catch (error: any) {
         setResults((prev) => ({
            ...prev,
            [name]: {
               status: 'error',
               message: error?.message || 'Unknown error',
            },
         }));

         return false;
      }
   };

   // Test all API URLs
   const testAllApis = async () => {
      setIsLoading(true);

      let anySuccess = false;

      for (const { name, url } of urlsToTest) {
         const success = await testApiUrl(name, url);
         if (success) anySuccess = true;
      }

      // Also test connectivity checking function
      const connectivityResult = await checkApiConnectivity();
      setResults((prev) => ({
         ...prev,
         'Connectivity Check': {
            status: connectivityResult ? 'success' : 'error',
            message: connectivityResult
               ? 'API is reachable'
               : 'API is not reachable through any available URL',
         },
      }));

      setOverallStatus(anySuccess ? 'success' : 'error');
      setIsLoading(false);
   };

   return (
      <View style={styles.container}>
         <StatusBar style="auto" />

         <View style={styles.header}>
            <Text style={styles.headerText}>API Connectivity Test</Text>
         </View>

         <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
         >
            <TouchableOpacity
               style={[
                  styles.testButton,
                  isLoading ? styles.testButtonDisabled : null,
               ]}
               onPress={testAllApis}
               disabled={isLoading}
            >
               <Text style={styles.testButtonText}>
                  {isLoading ? 'Testing APIs...' : 'Test API Connectivity'}
               </Text>
            </TouchableOpacity>

            {Object.entries(results).length > 0 && (
               <View style={styles.resultsContainer}>
                  <View style={styles.overallResult}>
                     <Text style={styles.overallResultTitle}>
                        Overall Status:
                     </Text>
                     <View style={styles.statusIconContainer}>
                        {overallStatus === 'success' && (
                           <Ionicons
                              name="checkmark-circle"
                              size={24}
                              color={CustomColors.success}
                           />
                        )}
                        {overallStatus === 'error' && (
                           <Ionicons
                              name="close-circle"
                              size={24}
                              color={CustomColors.error}
                           />
                        )}
                        <Text
                           style={[
                              styles.overallResultText,
                              {
                                 color:
                                    overallStatus === 'success'
                                       ? CustomColors.success
                                       : CustomColors.error,
                              },
                           ]}
                        >
                           {overallStatus === 'success'
                              ? 'Connected'
                              : 'Not Connected'}
                        </Text>
                     </View>
                  </View>

                  {Object.entries(results).map(([name, result]) => (
                     <View key={name} style={styles.resultItem}>
                        <View style={styles.resultHeader}>
                           <Text style={styles.resultName}>{name}</Text>
                           <View style={styles.statusIconContainer}>
                              {result.status === 'pending' && (
                                 <Ionicons
                                    name="ellipsis-horizontal"
                                    size={24}
                                    color={CustomColors.primary}
                                 />
                              )}
                              {result.status === 'success' && (
                                 <Ionicons
                                    name="checkmark-circle"
                                    size={24}
                                    color={CustomColors.success}
                                 />
                              )}
                              {result.status === 'error' && (
                                 <Ionicons
                                    name="close-circle"
                                    size={24}
                                    color={CustomColors.error}
                                 />
                              )}
                           </View>
                        </View>
                        <Text style={styles.resultMessage}>
                           {result.message}
                        </Text>
                     </View>
                  ))}
               </View>
            )}
         </ScrollView>
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: '#fff',
   },
   header: {
      padding: 16,
      backgroundColor: CustomColors.primary,
   },
   headerText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
      textAlign: 'center',
   },
   scrollView: {
      flex: 1,
   },
   scrollContent: {
      padding: 16,
   },
   testButton: {
      backgroundColor: CustomColors.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20,
   },
   testButtonDisabled: {
      backgroundColor: CustomColors.light,
   },
   testButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
   },
   resultsContainer: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 16,
   },
   overallResult: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
      marginBottom: 16,
   },
   overallResultTitle: {
      fontSize: 16,
      fontWeight: 'bold',
   },
   overallResultText: {
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
   },
   resultItem: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: '#f5f5f5',
      borderRadius: 8,
   },
   resultHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
   },
   resultName: {
      fontSize: 16,
      fontWeight: 'bold',
   },
   statusIconContainer: {
      flexDirection: 'row',
      alignItems: 'center',
   },
   resultMessage: {
      fontSize: 14,
      color: '#555',
   },
});
