import React, { useRef, useState, useEffect } from 'react';
import {
   View,
   Text,
   TextInput,
   TouchableOpacity,
   StyleSheet,
   Animated,
   Alert,
   ActivityIndicator,
   KeyboardAvoidingView,
   Platform,
   ScrollView,
   Keyboard,
} from 'react-native';
import { useAuthStore } from '@/store/auth.store';
import { router } from 'expo-router';

const AuthScreen: React.FC = () => {
   const [isLogin, setIsLogin] = useState(true);
   const [loading, setLoading] = useState(false);
   const [errors, setErrors] = useState<Record<string, string>>({});
   const [fields, setFields] = useState({
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
   });

   const slideAnim = useRef(new Animated.Value(40)).current;
   const opacityAnim = useRef(new Animated.Value(0)).current;
   const scaleAnim = useRef(new Animated.Value(0.95)).current;

   React.useEffect(() => {
      Animated.parallel([
         Animated.timing(slideAnim, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
         }),
         Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
         }),
         Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
         }),
      ]).start();
   }, []);

   const handleChange = (name: string, value: string) => {
      setFields((prev) => ({ ...prev, [name]: value }));
      // Clear error when field is edited
      if (errors[name]) {
         setErrors((prev) => ({ ...prev, [name]: '' }));
      }
   };

   const validateEmail = (email: string): boolean => {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
   };

   const validatePhone = (phone: string): boolean => {
      // Simple phone validation - at least 10 digits
      const digitsOnly = phone.replace(/\D/g, '');
      return digitsOnly.length >= 10;
   };

   const validate = () => {
      const newErrors: Record<string, string> = {};
      let isValid = true;

      if (!fields.email) {
         newErrors.email = 'Email is required';
         isValid = false;
      } else if (!validateEmail(fields.email)) {
         newErrors.email = 'Email is invalid';
         isValid = false;
      }

      if (!fields.password) {
         newErrors.password = 'Password is required';
         isValid = false;
      } else if (fields.password.length < 6) {
         newErrors.password = 'Password must be at least 6 characters';
         isValid = false;
      }

      if (!isLogin) {
         if (!fields.username) {
            newErrors.username = 'Name is required';
            isValid = false;
         }

         if (!fields.phone) {
            newErrors.phone = 'Phone number is required';
            isValid = false;
         } else if (!validatePhone(fields.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
            isValid = false;
         }

         if (fields.password !== fields.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
         }
      }

      setErrors(newErrors);
      return isValid;
   };

   const { login, register } = useAuthStore();

   const handleSubmit = async () => {
      Keyboard.dismiss();

      if (!validate()) return;

      setLoading(true);

      try {
         let result;

         if (isLogin) {
            // Handle login
            result = await login(fields.email, fields.password);
         } else {
            // Handle register
            result = await register({
               name: fields.username,
               email: fields.email,
               phone: fields.phone,
               password: fields.password,
            });
         }

         if (result) {
            // Only show alert if needed, otherwise redirect immediately
            router.replace('/(tabs)');
         } else {
            throw new Error('Authentication failed');
         }
      } catch (err: any) {
         Alert.alert(
            'Error',
            err.message || (isLogin ? 'Login failed' : 'Registration failed')
         );
      } finally {
         setLoading(false);
      }
   };

   // Toggle between login and signup
   const toggleAuthMode = () => {
      setIsLogin((prev) => !prev);
      setErrors({}); // Clear errors when switching modes
   };

   return (
      <KeyboardAvoidingView
         style={{ flex: 1 }}
         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
         <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <Animated.View
               style={[
                  styles.container,
                  {
                     opacity: opacityAnim,
                     transform: [
                        { translateY: slideAnim },
                        { scale: scaleAnim },
                     ],
                  },
               ]}
            >
               <Text style={styles.title}>
                  {isLogin ? 'Welcome Back' : 'Create Account'}
               </Text>

               {!isLogin && (
                  <View>
                     <TextInput
                        style={[
                           styles.input,
                           errors.username ? styles.inputError : null,
                        ]}
                        placeholder="Full Name"
                        autoCapitalize="words"
                        value={fields.username}
                        onChangeText={(v) => handleChange('username', v)}
                        editable={!loading}
                     />
                     {errors.username ? (
                        <Text style={styles.errorText}>{errors.username}</Text>
                     ) : null}
                  </View>
               )}

               {!isLogin && (
                  <View>
                     <TextInput
                        style={[
                           styles.input,
                           errors.phone ? styles.inputError : null,
                        ]}
                        placeholder="Phone Number"
                        keyboardType="phone-pad"
                        value={fields.phone}
                        onChangeText={(v) => handleChange('phone', v)}
                        editable={!loading}
                     />
                     {errors.phone ? (
                        <Text style={styles.errorText}>{errors.phone}</Text>
                     ) : null}
                  </View>
               )}

               <View>
                  <TextInput
                     style={[
                        styles.input,
                        errors.email ? styles.inputError : null,
                     ]}
                     placeholder="Email"
                     autoCapitalize="none"
                     keyboardType="email-address"
                     value={fields.email}
                     onChangeText={(v) => handleChange('email', v)}
                     editable={!loading}
                  />
                  {errors.email ? (
                     <Text style={styles.errorText}>{errors.email}</Text>
                  ) : null}
               </View>

               <View>
                  <TextInput
                     style={[
                        styles.input,
                        errors.password ? styles.inputError : null,
                     ]}
                     placeholder="Password"
                     secureTextEntry
                     value={fields.password}
                     onChangeText={(v) => handleChange('password', v)}
                     editable={!loading}
                  />
                  {errors.password ? (
                     <Text style={styles.errorText}>{errors.password}</Text>
                  ) : null}
               </View>

               {!isLogin && (
                  <View>
                     <TextInput
                        style={[
                           styles.input,
                           errors.confirmPassword ? styles.inputError : null,
                        ]}
                        placeholder="Confirm Password"
                        secureTextEntry
                        value={fields.confirmPassword}
                        onChangeText={(v) => handleChange('confirmPassword', v)}
                        editable={!loading}
                     />
                     {errors.confirmPassword ? (
                        <Text style={styles.errorText}>
                           {errors.confirmPassword}
                        </Text>
                     ) : null}
                  </View>
               )}

               <TouchableOpacity
                  style={[styles.button, loading && { opacity: 0.7 }]}
                  onPress={handleSubmit}
                  disabled={loading}
               >
                  {loading ? (
                     <ActivityIndicator color="#fff" />
                  ) : (
                     <Text style={styles.buttonText}>
                        {isLogin ? 'Login' : 'Sign Up'}
                     </Text>
                  )}
               </TouchableOpacity>

               <TouchableOpacity onPress={toggleAuthMode} disabled={loading}>
                  <Text style={styles.toggleText}>
                     {isLogin
                        ? "Don't have an account? Sign Up"
                        : 'Already have an account? Login'}
                  </Text>
               </TouchableOpacity>
            </Animated.View>
         </ScrollView>
      </KeyboardAvoidingView>
   );
};

const styles = StyleSheet.create({
   container: {
      backgroundColor: 'transparent',
      marginHorizontal: 24,
   },
   logoImage: {
      width: 70,
      height: 70,
      alignSelf: 'center',
      marginBottom: 16,
   },
   title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#222',
      marginBottom: 28,
      alignSelf: 'center',
      letterSpacing: 0.5,
   },
   input: {
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      fontSize: 16,
      backgroundColor: '#fafafa',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
   },
   inputError: {
      borderColor: '#ff6b6b',
      borderWidth: 1,
   },
   errorText: {
      color: '#ff6b6b',
      fontSize: 12,
      marginLeft: 4,
      marginTop: -8,
      marginBottom: 10,
   },
   button: {
      backgroundColor: '#2D9CDB',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 12,
      marginBottom: 12,
      shadowColor: '#2D9CDB',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
   },
   buttonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 17,
      letterSpacing: 0.5,
   },
   toggleText: {
      color: '#27AE60',
      textAlign: 'center',
      marginTop: 16,
      fontSize: 16,
      fontWeight: '500',
   },
});

export default AuthScreen;
