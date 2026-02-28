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

const RegisterScreen = () => {
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
    setError('');

    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setLoading(true);
      const result = await dispatch(sendOTP({ phone: `+91${phone}`, purpose: 'registration' })).unwrap();

      if (result.success) {
        navigation.navigate(ROUTES.OTP, {
          phone: `+91${phone}`,
          purpose: 'registration'
        });
      } else {
        setError(result.message || 'Failed to send OTP');
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
          <Text style={styles.appName}>Aspirantx</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to get started
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
            onPress={() => navigation.navigate(ROUTES.LOGIN)}
            activeOpacity={0.7}
          >
            <Text style={styles.footerText}>
              Already have an account?{' '}
              <Text style={styles.footerLink}>Sign In</Text>
            </Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By creating an account, you agree to our{' '}
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
    flex: 1,
    justifyContent: 'flex-end',
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

export default RegisterScreen;
