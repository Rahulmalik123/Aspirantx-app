import React, { useState, useRef, useEffect } from 'react';
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
  Dimensions,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS } from '../../constants/colors';
import { ROUTES } from '../../constants/routes';
import { AppDispatch } from '../../store';
import { sendOTP } from '../../store/slices/authSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WaveSeparator = () => (
  <View style={{ width: SCREEN_WIDTH, height: 50, marginTop: -1 }}>
    <Svg
      width={SCREEN_WIDTH}
      height={50}
      viewBox={`0 0 ${SCREEN_WIDTH} 50`}
      preserveAspectRatio="none"
    >
      <Defs>
        <SvgLinearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#0040a1" />
          <Stop offset="1" stopColor="#1a6ddb" />
        </SvgLinearGradient>
      </Defs>
      <Path
        d={`M0,0 L${SCREEN_WIDTH},0 L${SCREEN_WIDTH},20 Q${SCREEN_WIDTH * 0.75},50 ${SCREEN_WIDTH * 0.5},35 Q${SCREEN_WIDTH * 0.25},20 0,45 L0,0 Z`}
        fill="url(#waveGrad)"
      />
    </Svg>
  </View>
);

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const inputSlide = useRef(new Animated.Value(40)).current;
  const buttonSlide = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(inputSlide, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(buttonSlide, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0040a1" translucent />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Gradient Header with Branding */}
          <LinearGradient
            colors={['#0040a1', '#1a6ddb', '#3b8af5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              {/* Back button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>

              {/* Decorative circles */}
              <View style={[styles.decorCircle, styles.decorCircle1]} />
              <View style={[styles.decorCircle, styles.decorCircle2]} />
              <View style={[styles.decorCircle, styles.decorCircle3]} />

              <Animated.View
                style={[
                  styles.logoContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: logoScale }],
                  },
                ]}
              >
                <View style={styles.logoWrapper}>
                  <Image
                    source={require('../../assets/images/blue-icon-white-bg.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.appName}>Aspirantx</Text>
                <Text style={styles.tagline}>Your Journey Starts Here</Text>
              </Animated.View>
            </View>
          </LinearGradient>

          {/* Wave Separator */}
          <WaveSeparator />

          {/* Form Section */}
          <View style={styles.formSection}>
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <Text style={styles.welcomeTitle}>Create Account</Text>
              <Text style={styles.welcomeSubtitle}>
                Enter your phone number to get started
              </Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.inputCard,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: inputSlide }],
                },
              ]}
            >
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View
                style={[
                  styles.phoneInputWrapper,
                  isFocused && styles.inputFocused,
                  error ? styles.inputError : null,
                ]}
              >
                <View style={styles.countryCodeBox}>
                  <Text style={styles.flagEmoji}>🇮🇳</Text>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <View style={styles.inputDivider} />
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Enter mobile number"
                  placeholderTextColor="#A0AEC0"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text.replace(/[^0-9]/g, ''));
                    setError('');
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  keyboardType="phone-pad"
                  maxLength={10}
                  autoFocus
                />
                {phone.length === 10 && (
                  <View style={styles.checkIcon}>
                    <Text style={{ color: COLORS.success, fontSize: 16 }}>✓</Text>
                  </View>
                )}
              </View>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>!</Text>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </Animated.View>

            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: buttonSlide }],
              }}
            >
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  loading && styles.buttonDisabled,
                  phone.length === 10 && !loading && styles.buttonActive,
                ]}
                onPress={handleSendOTP}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    phone.length === 10 && !loading
                      ? ['#0040a1', '#1a6ddb']
                      : ['#94a3b8', '#94a3b8']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} size="small" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Get OTP</Text>
                      <Text style={styles.buttonArrow}>→</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Secure badge */}
              <View style={styles.secureBadge}>
                <Text style={styles.secureIcon}>🔒</Text>
                <Text style={styles.secureText}>
                  We'll send a verification code to this number
                </Text>
              </View>
            </Animated.View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Already a member?</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => navigation.navigate(ROUTES.LOGIN)}
              activeOpacity={0.7}
            >
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' & '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
  },

  // --- Header Gradient ---
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 50,
    paddingBottom: 30,
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  backArrow: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  decorCircle1: {
    width: 200,
    height: 200,
    top: -60,
    right: -40,
  },
  decorCircle2: {
    width: 140,
    height: 140,
    bottom: -30,
    left: -30,
  },
  decorCircle3: {
    width: 80,
    height: 80,
    top: 20,
    left: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 56,
    height: 56,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
    letterSpacing: 0.5,
    fontWeight: '500',
  },

  // --- Form Section ---
  formSection: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#718096',
    marginBottom: 28,
    lineHeight: 22,
  },
  inputCard: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    height: 56,
    shadowColor: '#0040a1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inputFocused: {
    borderColor: '#0040a1',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 6,
  },
  flagEmoji: {
    fontSize: 20,
  },
  countryCodeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
  },
  inputDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#1A202C',
    height: '100%',
    fontWeight: '500',
    letterSpacing: 1,
  },
  checkIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E6FFFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  errorIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FED7D7',
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
    overflow: 'hidden',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  // --- Button ---
  continueButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 4,
  },
  buttonGradient: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonActive: {
    shadowColor: '#0040a1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonArrow: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    gap: 6,
  },
  secureIcon: {
    fontSize: 13,
  },
  secureText: {
    fontSize: 12,
    color: '#A0AEC0',
    fontWeight: '500',
  },

  // --- Footer ---
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 8,
    alignItems: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#A0AEC0',
    fontWeight: '500',
  },
  signInButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#0040a1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 64, 161, 0.04)',
    marginBottom: 24,
  },
  signInText: {
    color: '#0040a1',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#A0AEC0',
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#718096',
    fontWeight: '600',
  },
});

export default RegisterScreen;
