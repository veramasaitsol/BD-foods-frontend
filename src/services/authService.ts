// API Service for Authentication
import { apiFetch, type ApiEnvelope } from '@/lib/api';

// Re-exported so existing call sites (authSlice, ProtectedRoute) don't need to change import paths.
export { saveToken, getToken, removeToken, isTokenValid } from '@/lib/tokenStorage';

export interface LoginPayload {
  EMAIL: string;
  PASSWORD: string;
}

export interface SendOTPPayload {
  OTP_PLATFORM: string;
  OTP_TYPE: string;
  PHONE: string;
  EMAIL: string;
}

export interface RegisterPayload {
  NAME: string;
  EMAIL: string;
  PASSWORD: string;
  OTP_VALUE: number;
  LOGIN_TYPE: string;
  OTP_PLATFORM: string;
  PHONE?: string;
}

export interface AuthUser {
  token: string;
  secure: boolean;
  USER_ID: string;
  NAME: string;
  EMAIL: string;
  ROLE: string;
}

// Login API
export const loginUser = (payload: LoginPayload): Promise<ApiEnvelope<{ user: AuthUser }>> =>
  apiFetch('/user/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: false,
  });

// Send OTP API
export const sendOTP = (payload: SendOTPPayload): Promise<ApiEnvelope<{ otp?: string }>> =>
  apiFetch('/user/send-otp', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: false,
  });

// Register API
export const registerUser = (payload: RegisterPayload): Promise<ApiEnvelope<{ user: AuthUser }>> =>
  apiFetch('/user/register', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: false,
  });
