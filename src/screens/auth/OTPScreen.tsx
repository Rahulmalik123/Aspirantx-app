import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { ROUTES } from '../../constants/routes';
import { AppDispatch } from '../../store';
import { verifyOTP, resendOTP } from '../../store/slices/authSlice';

const OTPScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();

  const { phone, purpose } = route.params || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode?: string) => {
    const otpToVerify = otpCode || otp.join('');
    console.log('🔐 [OTPScreen] handleVerifyOTP called');
    console.log('📱 [OTPScreen] Phone:', phone, 'Purpose:', purpose);
    console.log('🔢 [OTPScreen] OTP:', otpToVerify);

    if (otpToVerify.length !== 6) {
      console.log('❌ [OTPScreen] Incomplete OTP');
      setError('Please enter complete OTP');
      return;
    }

    try {
      setLoading(true);
      console.log('🚀 [OTPScreen] Verifying OTP...');
      const result = await dispatch(verifyOTP({
        phone,
        otp: otpToVerify,
        purpose
      })).unwrap();
      console.log('✅ [OTPScreen] OTP verification result:', result);

      if (result.success) {
        console.log('✅ [OTPScreen] OTP verified successfully');
        const isNewUser = result.isNewUser || result.data?.isNewUser;
        const userPhone = result.phone || result.data?.phone || phone;

        if (isNewUser) {
          console.log('👤 [OTPScreen] New user detected, navigating to profile setup');
          navigation.navigate(ROUTES.PROFILE_SETUP, { phone: userPhone });
        } else {
          console.log('👤 [OTPScreen] Existing user, navigating to home');
          navigation.reset({
            index: 0,
            routes: [{ name: ROUTES.MAIN }],
          });
        }
      } else {
        console.log('❌ [OTPScreen] OTP verification failed:', result.message);
        setError(result.message || 'Invalid OTP');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      console.error('❌ [OTPScreen] Error verifying OTP:', err);
      setError(err.message || 'Verification failed');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    console.log('🔄 [OTPScreen] Resending OTP to:', phone);

    try {
      setLoading(true);
      setError('');

      const result = await dispatch(resendOTP({
        phone,
        type: 'phone',
        purpose
      })).unwrap();
      console.log('✅ [OTPScreen] Resend OTP result:', result);

      if (result.success) {
        setResendTimer(30);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        setError(result.message || 'Failed to resend OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Image
            source={require('../../assets/images/blue-icon-white-bg.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Verify your number</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{' '}
            <Text style={styles.phoneNumber}>{phone}</Text>
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  error && styles.otpInputError,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                autoFocus={index === 0}
              />
            ))}
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.button, (loading || otp.some(digit => !digit)) && styles.buttonDisabled]}
            onPress={() => handleVerifyOTP()}
            disabled={loading || otp.some(digit => !digit)}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            {canResend ? (
              <TouchableOpacity onPress={handleResendOTP} disabled={loading}>
                <Text style={styles.resendText}>
                  Didn't receive the code?{' '}
                  <Text style={styles.resendLink}>Resend</Text>
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>
                Resend code in <Text style={styles.timerNumber}>{resendTimer}s</Text>
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  backButtonText: {
    fontSize: 15,
    color: COLORS.gray500,
    fontWeight: '500',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 64,
    height: 64,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray500,
    lineHeight: 22,
    marginBottom: 32,
  },
  phoneNumber: {
    fontWeight: '600',
    color: COLORS.gray900,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 48,
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.gray300,
    borderRadius: 12,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: COLORS.gray900,
    backgroundColor: COLORS.gray100,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  otpInputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginBottom: 12,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    marginTop: 28,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: COLORS.gray500,
  },
  resendLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  timerText: {
    fontSize: 14,
    color: COLORS.gray400,
  },
  timerNumber: {
    fontWeight: '600',
    color: COLORS.gray600,
  },
});

export default OTPScreen;
