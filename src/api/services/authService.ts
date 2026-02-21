import { api } from '../client';
import { ENDPOINTS } from '../endpoints';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  referralCode?: string;
}

export interface SendOTPRequest {
  phone: string;
  purpose: 'login' | 'registration' | 'forgot-password' | 'phone-verification';
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
  purpose: 'login' | 'registration' | 'forgot-password' | 'phone-verification';
}

export interface ResendOTPRequest {
  phone: string;
  type: 'email' | 'phone';
  purpose: 'login' | 'registration' | 'forgot-password' | 'phone-verification';
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  referralCode?: string;
}

export interface CompleteProfileRequest {
  phone: string;
  name: string;
  email: string;
  referralCode?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
      phone?: string;
      avatar?: string;
      targetExams: string[];
      role: string;
    };
    accessToken: string;
    refreshToken: string;
    isNewUser?: boolean;
  };
  message: string;
}

export interface RegisterResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
    };
    accessToken: string;
    refreshToken: string;
  };
  message: string;
}

export interface OTPResponse {
  success: boolean;
  message: string;
  data?: any;
}

class AuthService {
  async sendOTP(data: SendOTPRequest): Promise<OTPResponse> {
    console.log('🌐 [AuthService] sendOTP called:', ENDPOINTS.SEND_OTP_PHONE, data);
    const response = await api.post<OTPResponse>(ENDPOINTS.SEND_OTP_PHONE, data);
    console.log('🌐 [AuthService] sendOTP response:', response);
    return response;
  }

  async verifyOTP(data: VerifyOTPRequest): Promise<AuthResponse> {
    console.log('🌐 [AuthService] verifyOTP called:', ENDPOINTS.VERIFY_OTP_PHONE, data);
    const response = await api.post<AuthResponse>(ENDPOINTS.VERIFY_OTP_PHONE, data);
    console.log('🌐 [AuthService] verifyOTP response:', response);
    return response;
  }

  async resendOTP(data: ResendOTPRequest): Promise<OTPResponse> {
    console.log('🌐 [AuthService] resendOTP called:', ENDPOINTS.RESEND_OTP_API, data);
    const payload = {
      identifier: data.phone,
      type: data.type,
      purpose: data.purpose,
    };
    const response = await api.post<OTPResponse>(ENDPOINTS.RESEND_OTP_API, payload);
    console.log('🌐 [AuthService] resendOTP response:', response);
    return response;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<{ success: boolean; data: { user: any }; message: string }> {
    console.log('🌐 [AuthService] updateProfile called:', ENDPOINTS.UPDATE_PROFILE, data);
    const response = await api.put<{ success: boolean; data: { user: any }; message: string }>(ENDPOINTS.UPDATE_PROFILE, data);
    console.log('🌐 [AuthService] updateProfile response:', response);
    return response;
  }

  async completeProfile(data: CompleteProfileRequest): Promise<AuthResponse> {
    console.log('🌐 [AuthService] completeProfile called:', ENDPOINTS.COMPLETE_PROFILE, data);
    const response = await api.post<AuthResponse>(ENDPOINTS.COMPLETE_PROFILE, data);
    console.log('🌐 [AuthService] completeProfile response:', response);
    return response;
  }

  async refreshAuthToken(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string }> {
    return api.post<{ accessToken: string; refreshToken?: string }>(ENDPOINTS.REFRESH_TOKEN, { refreshToken });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    console.log('🌐 [AuthService] login called:', ENDPOINTS.LOGIN);
    const response = await api.post<AuthResponse>(ENDPOINTS.LOGIN, data);
    console.log('🌐 [AuthService] login response:', response);
    return response;
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return api.post<RegisterResponse>(ENDPOINTS.REGISTER, data);
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    return api.post<{ success: boolean; message: string }>(ENDPOINTS.FORGOT_PASSWORD, { email });
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return api.post<{ success: boolean; message: string }>(ENDPOINTS.RESET_PASSWORD, { email, otp, newPassword });
  }

  async logout(): Promise<void> {
    return api.post<void>(ENDPOINTS.LOGOUT);
  }

  async getProfile(): Promise<any> {
    console.log('🌐 [AuthService] getProfile called:', ENDPOINTS.PROFILE);
    const response = await api.get(ENDPOINTS.PROFILE);
    console.log('🌐 [AuthService] getProfile response:', response);
    return response;
  }
}

export default new AuthService();
