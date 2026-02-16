import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService, { 
  LoginRequest, 
  RegisterRequest, 
  VerifyOTPRequest,
  SendOTPRequest,
  ResendOTPRequest,
  UpdateProfileRequest,
  CompleteProfileRequest,
} from '../../api/services/authService';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  loading: false,
  error: null,
};

// Async thunks
export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (data: SendOTPRequest, { rejectWithValue }) => {
    console.log('📤 [AuthSlice] sendOTP thunk called with:', data);
    try {
      const response = await authService.sendOTP(data);
      console.log('✅ [AuthSlice] sendOTP response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ [AuthSlice] sendOTP error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (data: VerifyOTPRequest, { rejectWithValue }) => {
    console.log('📤 [AuthSlice] verifyOTP thunk called with:', data);
    try {
      const response = await authService.verifyOTP(data);
      console.log('✅ [AuthSlice] verifyOTP response:', response);
      
      // Check both response structures (root level and data level)
      const accessToken = response.accessToken || response.data?.accessToken;
      const refreshToken = response.refreshToken || response.data?.refreshToken;
      const user = response.user || response.data?.user;
      
      if (response.success && accessToken) {
        console.log('💾 [AuthSlice] Saving auth data to AsyncStorage');
        await AsyncStorage.setItem('authToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        if (user) {
          await AsyncStorage.setItem('userData', JSON.stringify(user));
        }
        console.log('✅ [AuthSlice] Auth data saved');
      }
      return response;
    } catch (error: any) {
      console.error('❌ [AuthSlice] verifyOTP error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const resendOTP = createAsyncThunk(
  'auth/resendOTP',
  async (data: ResendOTPRequest, { rejectWithValue }) => {
    try {
      const response = await authService.resendOTP(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: UpdateProfileRequest, { rejectWithValue }) => {
    console.log('📤 [AuthSlice] updateProfile thunk called with:', data);
    try {
      const response = await authService.updateProfile(data);
      console.log('✅ [AuthSlice] updateProfile response:', response);
      return response;
    } catch (error: any) {
      console.error('❌ [AuthSlice] updateProfile error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const completeProfile = createAsyncThunk(
  'auth/completeProfile',
  async (data: CompleteProfileRequest, { rejectWithValue }) => {
    console.log('📤 [AuthSlice] completeProfile thunk called with:', data);
    try {
      const response = await authService.completeProfile(data);
      console.log('✅ [AuthSlice] completeProfile response:', response);
      const accessToken = response.accessToken || response.data?.accessToken;
      const refreshToken = response.refreshToken || response.data?.refreshToken;
      const user = response.user || response.data?.user;
      
      if (response.success && accessToken) {
        console.log('💾 [AuthSlice] Saving auth data to AsyncStorage');
        await AsyncStorage.setItem('authToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        if (user) {
          await AsyncStorage.setItem('userData', JSON.stringify(user));
        }
        console.log('✅ [AuthSlice] Auth data saved');
      }
      return response;
    } catch (error: any) {
      console.error('❌ [AuthSlice] completeProfile error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      await AsyncStorage.setItem('authToken', response.data.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authService.register(data);
      await AsyncStorage.setItem('authToken', response.data.accessToken);
      await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // No API call - just clear local data
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userData');
      console.log('🗑️ [AuthSlice] All auth data cleared from AsyncStorage');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    console.log('🔍 [AuthSlice] checkAuth thunk called');
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      console.log('🔑 [AuthSlice] Token from storage:', token ? 'Found' : 'Not found');
      console.log('👤 [AuthSlice] User data from storage:', userData ? 'Found' : 'Not found');
      
      if (!token) {
        throw new Error('No token found');
      }
      
      // Try to use cached user data first
      let user = null;
      if (userData) {
        try {
          user = JSON.parse(userData);
          console.log('✅ [AuthSlice] Using cached user data');
        } catch (e) {
          console.log('⚠️ [AuthSlice] Failed to parse cached user data');
        }
      }
      
      // If no cached data, fetch from API
      if (!user) {
        console.log('👤 [AuthSlice] Fetching user profile from API...');
        const userProfile = await authService.getProfile();
        console.log('✅ [AuthSlice] User profile fetched:', userProfile);
        // Handle both response structures: data.user or just data
        user = userProfile.data?.user || userProfile.data;
        console.log('✅ [AuthSlice] Extracted user:', user);
        // Save to cache
        if (user) {
          await AsyncStorage.setItem('userData', JSON.stringify(user));
        }
      }
      
      return { token, user };
    } catch (error: any) {
      console.error('❌ [AuthSlice] checkAuth error:', error);
      console.log('🗑️ [AuthSlice] Removing auth data from storage');
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userData');
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
    updateFollowingCount: (state, action: PayloadAction<'increment' | 'decrement'>) => {
      if (state.user) {
        const currentFollowing = state.user.following || 0;
        state.user = {
          ...state.user,
          following: action.payload === 'increment' ? currentFollowing + 1 : Math.max(0, currentFollowing - 1),
        };
      }
    },
  },
  extraReducers: (builder) => {
    // Send OTP
    builder.addCase(sendOTP.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(sendOTP.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(sendOTP.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Verify OTP
    builder.addCase(verifyOTP.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(verifyOTP.fulfilled, (state, action) => {
      state.loading = false;
      // Check both response structures (root level and data level)
      const accessToken = action.payload.accessToken || action.payload.data?.accessToken;
      const user = action.payload.user || action.payload.data?.user;
      
      if (accessToken) {
        state.isAuthenticated = true;
        state.token = accessToken;
        state.user = user;
      }
    });
    builder.addCase(verifyOTP.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Resend OTP
    builder.addCase(resendOTP.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(resendOTP.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(resendOTP.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Profile
    builder.addCase(updateProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.loading = false;
      console.log('✅ [AuthSlice] updateProfile fulfilled, payload:', action.payload);
      if (action.payload.data) {
        state.user = action.payload.data.user;
        console.log('✅ [AuthSlice] User updated in state:', state.user);
      }
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Complete Profile
    builder.addCase(completeProfile.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(completeProfile.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload.data?.accessToken) {
        state.isAuthenticated = true;
        state.token = action.payload.data.accessToken;
        state.user = action.payload.data.user;
      }
    });
    builder.addCase(completeProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(login.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.data.accessToken;
      state.user = action.payload.data.user;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.data.accessToken;
      state.user = action.payload.data.user;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    });

    // Check Auth
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
    builder.addCase(checkAuth.rejected, (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    });
  },
});

export const { clearError, setUser, updateFollowingCount } = authSlice.actions;
export default authSlice.reducer;
