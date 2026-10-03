import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, registerUser, sendOTP, saveToken, getToken, isTokenValid } from '@/services/authService';

export interface User {
  USER_ID: string;
  NAME: string;
  EMAIL: string;
  ROLE: string;
  token?:  string;
}

interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showLoginModal: boolean;
  showRegisterModal: boolean;
  registrationData: RegistrationData | null;
  otpSent: boolean;
  otpVerified: boolean;
  error: string | null;
}

const storedUser = localStorage.getItem('brundhavanam_user');
const token = getToken();

const initialState: AuthState = {
  user: storedUser && isTokenValid() ? JSON.parse(storedUser) : null,
  isAuthenticated: !!token && isTokenValid(),
  isLoading: false,
  showLoginModal: false,
  showRegisterModal: false,
  registrationData: null,
  otpSent: false,
  otpVerified: false,
  error: null,
};

export const loginAsync = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await loginUser({
        EMAIL: email,
        PASSWORD: password,
      });

      if (response.success && response.data?.user) {
        // Save token to localStorage and cookie
        saveToken(response.data.user.token);

        const userData: User = {
          USER_ID: response.data.user.USER_ID,
          NAME: response.data.user.NAME,
          EMAIL: response.data.user.EMAIL,
          ROLE: response.data.user.ROLE,
          token: response.data.user.token,
        };

        localStorage.setItem('brundhavanam_user', JSON.stringify(userData));
        return userData;
      }

      return rejectWithValue(response.message || 'Login failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const sendOtpAsync = createAsyncThunk(
  'auth/sendOtp',
  async (registrationData: RegistrationData, { rejectWithValue }) => {
    try {
      const response = await sendOTP({
        OTP_PLATFORM: 'EMAIL',
        OTP_TYPE: 'SIGNUP',
        PHONE: registrationData.phone,
        EMAIL: registrationData.email,
      });

      if (response.success) {
        return registrationData;
      }

      return rejectWithValue(response.message || 'Failed to send OTP');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send OTP');
    }
  }
);

export const verifyOtpAsync = createAsyncThunk(
  'auth/verifyOtp',
  async (
    { otp, registrationData }: { otp: string; registrationData: RegistrationData },
    { rejectWithValue }
  ) => {
    try {
      const response = await registerUser({
        NAME: registrationData.name,
        EMAIL: registrationData.email,
        PASSWORD: registrationData.password,
        OTP_VALUE: parseInt(otp),
        LOGIN_TYPE: 'SIGNUP',
        OTP_PLATFORM: 'EMAIL',
        PHONE: registrationData.phone || undefined,
      });

      if (response.success && response.data?.user) {
        // Save token to localStorage and cookie
        saveToken(response.data.user.token);

        const userData: User = {
          USER_ID: response.data.user.USER_ID,
          NAME: response.data.user.NAME,
          EMAIL: response.data.user.EMAIL,
          ROLE: response.data.user.ROLE,
          token: response.data.user.token,
        };

        localStorage.setItem('brundhavanam_user', JSON.stringify(userData));
        return userData;
      }

      return rejectWithValue(response.message || 'Registration failed');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setShowLoginModal: (state, action: PayloadAction<boolean>) => {
      state.showLoginModal = action.payload;
    },
    setShowRegisterModal: (state, action: PayloadAction<boolean>) => {
      state.showRegisterModal = action.payload;
      if (!action.payload) {
        state.otpSent = false;
        state.otpVerified = false;
        state.registrationData = null;
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('brundhavanam_user');
      localStorage.removeItem('brundhavanam_token');
      document.cookie = 'auth_token=; path=/; max-age=0';
    },
    resetOtpState: (state) => {
      state.otpSent = false;
      state.otpVerified = false;
      state.registrationData = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.showLoginModal = false;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Send OTP
      .addCase(sendOtpAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOtpAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = true;
        state.registrationData = action.payload;
        state.error = null;
      })
      .addCase(sendOtpAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Verify OTP & Register
      .addCase(verifyOtpAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtpAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.showRegisterModal = false;
        state.otpSent = false;
        state.otpVerified = true;
        state.registrationData = null;
        state.error = null;
      })
      .addCase(verifyOtpAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setShowLoginModal, setShowRegisterModal, logout, resetOtpState, clearError } = authSlice.actions;
export default authSlice.reducer;
