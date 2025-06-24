import React, { useState, useEffect } from 'react';
import {
   View,
   Text,
   TextInput,
   StyleSheet,
   TouchableOpacity,
   Alert,
   ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { getApiConfig, setApiBaseUrl } from '@/utils/api.config';
import { ApiService } from '@/utils/api.service';

export default function ServerConfigScreen() {
   const [baseUrl, setBaseUrl] = useState('');
   const [isTesting, setIsTesting] = useState(false);
   const [testResult, setTestResult] = useState<{
      success: boolean;
      message: string;
   } | null>(null);

   // Load current API config on mount
   useEffect(() => {
      const loadConfig = async () => {
         const config = await getApiConfig();
         setBaseUrl(config.baseURL);
      };

      loadConfig();
   }, []);

   // Save API URL configuration
   const saveConfig = async () => {
      if (!baseUrl) {
         Alert.alert('Error', 'Please enter a valid API URL');
         return;
      }

      const success = await setApiBaseUrl(baseUrl);

      if (success) {
         Alert.alert('Success', 'API URL has been updated');
      } else {
         Alert.alert('Error', 'Failed to save API URL');
      }
   };

   // Test API connection
   const testConnection = async () => {
      setIsTesting(true);
      setTestResult(null);

      try {
         // First save the config
         await setApiBaseUrl(baseUrl);

         // Then test health endpoint
         const response = await ApiService.get('/health');

         if (response.success) {
            setTestResult({
               success: true,
               message: `Connection successful! Server responded: ${JSON.stringify(
                  response.data
               )}`,
            });
         } else {
            setTestResult({
               success: false,
               message: `Failed to connect: ${
                  response.error || 'Unknown error'
               }`,
            });
         }
      } catch (error) {
         setTestResult({
            success: false,
            message: `Error: ${
               error instanceof Error ? error.message : 'Unknown error'
            }`,
         });
      } finally {
         setIsTesting(false);
      }
   };

   return (
      <View style={styles.container}>
         <Stack.Screen
            options={{
               title: 'Server Configuration',
               headerShown: true,
            }}
         />

         <Text style={styles.label}>API Server URL:</Text>
         <TextInput
            style={styles.input}
            value={baseUrl}
            onChangeText={setBaseUrl}
            placeholder="http://172.20.10.5:5000"
            autoCapitalize="none"
            autoCorrect={false}
         />

         <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={saveConfig}>
               <Text style={styles.buttonText}>Save Configuration</Text>
            </TouchableOpacity>

            <TouchableOpacity
               style={[styles.button, styles.testButton]}
               onPress={testConnection}
               disabled={isTesting}
            >
               {isTesting ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                     <ActivityIndicator
                        color="#fff"
                        style={{ marginRight: 8 }}
                     />
                     <Text style={styles.buttonText}>Testing...</Text>
                  </View>
               ) : (
                  <Text style={styles.buttonText}>Test Connection</Text>
               )}
            </TouchableOpacity>
         </View>

         {testResult && (
            <View
               style={[
                  styles.resultContainer,
                  testResult.success
                     ? styles.successResult
                     : styles.errorResult,
               ]}
            >
               <Text style={styles.resultText}>{testResult.message}</Text>
            </View>
         )}

         <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Troubleshooting Tips:</Text>
            <Text style={styles.infoText}>
               1. Make sure your backend server is running
            </Text>
            <Text style={styles.infoText}>
               2. Use your device's IP address on your shared network
            </Text>
            <Text style={styles.infoText}>
               3. Include the port number (e.g., :5000)
            </Text>
            <Text style={styles.infoText}>
               4. Make sure the device can reach the server (no firewall
               blocking)
            </Text>
         </View>

         <StatusBar style="auto" />
      </View>
   );
}

const styles = StyleSheet.create({
   container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#fff',
   },
   label: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
   },
   input: {
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      marginBottom: 24,
   },
   buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
   },
   button: {
      backgroundColor: '#28B9F4',
      borderRadius: 8,
      padding: 12,
      flex: 1,
      marginRight: 12,
      alignItems: 'center',
   },
   testButton: {
      backgroundColor: '#4CAF50',
      marginRight: 0,
      marginLeft: 12,
   },
   buttonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
   },
   resultContainer: {
      padding: 16,
      borderRadius: 8,
      marginBottom: 24,
   },
   successResult: {
      backgroundColor: '#E8F5E9',
      borderColor: '#4CAF50',
      borderWidth: 1,
   },
   errorResult: {
      backgroundColor: '#FFEBEE',
      borderColor: '#F44336',
      borderWidth: 1,
   },
   resultText: {
      fontSize: 14,
      lineHeight: 20,
   },
   infoContainer: {
      backgroundColor: '#F5F5F5',
      padding: 16,
      borderRadius: 8,
   },
   infoTitle: {
      fontWeight: '600',
      fontSize: 16,
      marginBottom: 8,
   },
   infoText: {
      fontSize: 14,
      lineHeight: 22,
      color: '#555',
      marginBottom: 4,
   },
});
