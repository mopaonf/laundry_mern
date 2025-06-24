import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiService } from '@/utils/api.service';

// User interface
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

// Auth state interface
interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Methods
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initAuth: () => Promise<void>;
  clearError: () => void;
}

// Create auth store
export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,

  // Login method
  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      console.log('Attempting login with:', { email });

      const response = await ApiService.post('/api/auth/login', {
        email,
        password,
      });

      if (!response.success) {
        set({
          isLoading: false,
          error: response.error || 'Authentication failed',
        });
        return false;
      }

      const { token, ...userData } = response.data;

      // Save auth data to storage
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));

      set({
        token,
        user: userData,
        isLoading: false,
        isAuthenticated: true,
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      });
      return false;
    }
  },

  // Logout method
  logout: async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
    } catch (error) {
      console.error('Logout error:', error);
    }

    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },

  // Initialize auth state from storage
  initAuth: async () => {
    set({ isLoading: true });

    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');

      if (token && userData) {
        set({
          token,
          user: JSON.parse(userData),
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
