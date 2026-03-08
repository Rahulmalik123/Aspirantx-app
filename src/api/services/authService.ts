import { OTPWidget } from '@msg91comm/sendotp-react-native';
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
  reqId: string;
  purpose: 'login' | 'registration' | 'forgot-password' | 'phone-verification';
}

export interface ResendOTPRequest {
  phone: string;
  reqId: string;
  retryChannel?: number;
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
  // Send OTP via MSG91 Widget SDK
  async sendOTP(data: SendOTPRequest): Promise<OTPResponse & { reqId?: string }> {
    console.log('🌐 [AuthService] sendOTP via MSG91:', data);
    // MSG91 expects identifier without '+' e.g. '91XXXXXXXXXX'
    const identifier = data.phone.replace('+', '');
    const response = await OTPWidget.sendOTP({ identifier });
    console.log('🌐 [AuthService] MSG91 sendOTP response:', response);

    if (response?.type === 'success') {
      // MSG91 returns reqId in the message field
      const reqId = response.reqId || response.message;
      return {
        success: true,
        message: 'OTP sent successfully',
        data: { reqId },
      };
    }
    return {
      success: false,
      message: response?.message || 'Failed to send OTP',
    };
  }

  // Verify OTP via MSG91, then authenticate with backend
  async verifyOTP(data: VerifyOTPRequest): Promise<AuthResponse> {
    console.log('🌐 [AuthService] verifyOTP via MSG91:', data);

    // Step 1: Verify OTP with MSG91
    const msg91Response = await OTPWidget.verifyOTP({
      reqId: data.reqId,
      otp: data.otp,
    });
    console.log('🌐 [AuthService] MSG91 verifyOTP response:', msg91Response);

    if (msg91Response?.type !== 'success') {
      throw new Error(msg91Response?.message || 'Invalid OTP');
    }

    // Step 2: Call backend with MSG91 token for server-side verification
    const response = await api.post<AuthResponse>(ENDPOINTS.VERIFY_OTP_PHONE, {
      phone: data.phone,
      purpose: data.purpose,
      msg91Verified: true,
      msg91Token: msg91Response?.token || msg91Response?.message,
    });
    console.log('🌐 [AuthService] Backend verify response:', response);
    return response;
  }

  // Resend/Retry OTP via MSG91 Widget SDK
  async resendOTP(data: ResendOTPRequest): Promise<OTPResponse> {
    console.log('🌐 [AuthService] retryOTP via MSG91:', data);
    const body: any = { reqId: data.reqId };
    if (data.retryChannel) {
      body.retryChannel = data.retryChannel;
    }
    const response = await OTPWidget.retryOTP(body);
    console.log('🌐 [AuthService] MSG91 retryOTP response:', response);

    if (response?.type === 'success') {
      return {
        success: true,
        message: response.message || 'OTP resent successfully',
      };
    }
    return {
      success: false,
      message: response?.message || 'Failed to resend OTP',
    };
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
