import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/api';

// Auth State Interface
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth Action Types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

// Initial State
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Auth Context Interface
interface AuthContextType extends AuthState {
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (data: any) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  logout: (isSessionTimeout?: boolean) => Promise<void>;
  clearError: () => void;
  updateUser: (user: User) => void;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log('AuthContext: Checking authentication...');
      const token = localStorage.getItem('auth_token');
      console.log('AuthContext: Token found:', !!token);
      
      if (token) {
        try {
          console.log('AuthContext: Attempting to get current user...');
          dispatch({ type: 'AUTH_START' });
          const response = await authService.getCurrentUser();
          console.log('AuthContext: User response:', response);
          
          if (response.status === 'success') {
            console.log('AuthContext: User authenticated successfully');
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: response.data, token },
            });
          } else {
            console.log('AuthContext: Failed to get user data');
            throw new Error('Failed to get user data');
          }
        } catch (error) {
          console.log('AuthContext: Error getting user:', error);
          localStorage.removeItem('auth_token');
          dispatch({ type: 'AUTH_FAILURE', payload: 'Authentication failed' });
        }
      } else {
        console.log('AuthContext: No token found, setting loading to false');
        // No token found - set loading to false without error
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string, remember?: boolean) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.login({ email, password, remember });
      
      if (response.status === 'success') {
        const { user, token } = response.data;
        localStorage.setItem('auth_token', token);
        if (remember) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Register function
  const register = async (data: any) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.register(data);
      
      if (response.status === 'success') {
        // Don't automatically login after registration, wait for OTP verification
        dispatch({ type: 'CLEAR_ERROR' });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Verify OTP function
  const verifyOTP = async (email: string, otp: string) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.verifyOTP({ email, otp });
      
      if (response.status === 'success') {
        const { user, token } = response.data;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      } else {
        throw new Error(response.message || 'OTP verification failed');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'OTP verification failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  // Resend OTP function
  const resendOTP = async (email: string) => {
    try {
      const response = await authService.resendOTP({ email });
      
      if (response.status !== 'success') {
        throw new Error(response.message || 'Failed to resend OTP');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend OTP';
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = async (isSessionTimeout = false) => {
    try {
      if (!isSessionTimeout) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('last_activity');
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Update user function
  const updateUser = (user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
    localStorage.setItem('user', JSON.stringify(user));
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    verifyOTP,
    resendOTP,
    logout,
    clearError,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
