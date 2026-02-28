import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { ROUTES } from '../../constants/routes';
import { AppDispatch } from '../../store';
import { sendOTP } from '../../store/slices/authSlice';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validatePhone = (phoneNumber: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phoneNumber);
  };

  const handleSendOTP = async () => {
    console.log('🔐 [LoginScreen] handleSendOTP called');
    setError('');

    if (!phone.trim()) {
      console.log('❌ [LoginScreen] Phone number empty');
      setError('Please enter your phone number');
      return;
    }

    if (!validatePhone(phone)) {
      console.log('❌ [LoginScreen] Invalid phone format:', phone);
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setLoading(true);
      console.log('📞 [LoginScreen] Sending OTP to:', `+91${phone}`);
      const result = await dispatch(sendOTP({ phone: `+91${phone}`, purpose: 'login' })).unwrap();
      console.log('✅ [LoginScreen] OTP sent successfully:', result);

      if (result.success) {
        console.log('✅ [LoginScreen] Navigating to OTP screen');
        navigation.navigate(ROUTES.OTP, {
          phone: `+91${phone}`,
          purpose: 'login'
        });
      } else {
        console.log('❌ [LoginScreen] OTP send failed:', result.message);
        setError(result.message || 'Failed to send OTP');
      }
    } catch (err: any) {
      console.error('❌ [LoginScreen] Error sending OTP:', err);

      let errorMessage = 'Something went wrong. Please try again.';

      if (err.message?.includes('timeout') || err.message?.includes('buffering')) {
        errorMessage = 'Server is taking too long to respond. Please check your connection and try again.';
      } else if (err.message?.includes('Network Error') || err.message?.includes('Network request failed')) {
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
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
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/blue-icon-white-bg.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>Aspirantx</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Sign in with your phone number
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={[styles.phoneInputWrapper, error ? styles.inputError : null]}>
              <Text style={styles.countryCodeText}>+91</Text>
              <View style={styles.inputDivider} />
              <TextInput
                style={styles.phoneInput}
                placeholder="10-digit mobile number"
                placeholderTextColor={COLORS.gray400}
                value={phone}
                onChangeText={(text) => {
                  setPhone(text.replace(/[^0-9]/g, ''));
                  setError('');
                }}
                keyboardType="phone-pad"
                maxLength={10}
                autoFocus
              />
            </View>
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendOTP}
            disabled={loading}
            activeOpacity={0.7}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.REGISTER)}
            activeOpacity={0.7}
          >
            <Text style={styles.footerText}>
              Don't have an account?{' '}
              <Text style={styles.footerLink}>Create Account</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms</Text> &{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 12,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  formContainer: {
    marginBottom: 32,
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
    marginBottom: 28,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.gray300,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
    height: 52,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray700,
    paddingHorizontal: 16,
  },
  inputDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.gray300,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.gray900,
    height: '100%',
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
  footer: {
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.gray500,
    marginBottom: 20,
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: COLORS.gray400,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.gray500,
    fontWeight: '500',
  },
});

export default LoginScreen;
