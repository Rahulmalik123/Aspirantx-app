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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import CustomIcon from '../../components/CustomIcon';
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
      
      // Better error messages for common issues
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <CustomIcon name="school" size={64} color={COLORS.primary} />
          <Text style={styles.title}>MCQ Beast</Text>
          <Text style={styles.subtitle}>Prepare smarter, perform better</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.instructionText}>
            Enter your phone number to receive an OTP
          </Text>

          <View style={styles.inputContainer}>
            <View style={styles.phoneInputWrapper}>
              <View style={styles.countryCode}>
                <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter 10-digit mobile number"
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
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSendOTP}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Send OTP</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate(ROUTES.REGISTER)}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>
              New user? <Text style={styles.registerLinkText}>Create Account</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
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
    paddingTop: SPACING.xl * 2,
    paddingBottom: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  instructionText: {
    fontSize: 15,
    color: COLORS.gray600,
    marginBottom: SPACING.xl,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray300,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gray100,
    borderRightWidth: 1,
    borderRightColor: COLORS.gray300,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.gray900,
  },
  errorContainer: {
    backgroundColor: COLORS.error + '15',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md + 2,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.sm,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray300,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    color: COLORS.gray500,
    fontSize: 14,
    fontWeight: '600',
  },
  registerButton: {
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  registerButtonText: {
    fontSize: 16,
    color: COLORS.gray700,
  },
  registerLinkText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  footer: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
