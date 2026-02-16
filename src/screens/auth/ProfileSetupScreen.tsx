import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { ROUTES } from '../../constants/routes';
import { AppDispatch } from '../../store';
import { completeProfile, checkAuth } from '../../store/slices/authSlice';

const ProfileSetupScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  
  const phone = route.params?.phone || '';
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    console.log('👤 [ProfileSetup] handleContinue called');
    console.log('📱 [ProfileSetup] Phone:', phone);
    if (!validateForm()) {
      console.log('❌ [ProfileSetup] Form validation failed');
      return;
    }

    try {
      setLoading(true);
      console.log('🚀 [ProfileSetup] Completing profile:', { 
        phone,
        name: name.trim(), 
        email: email.trim(),
        referralCode: referralCode.trim() || undefined,
      });
      const result = await dispatch(completeProfile({ 
        phone,
        name: name.trim(),
        email: email.trim(),
        referralCode: referralCode.trim() || undefined,
      })).unwrap();
      console.log('✅ [ProfileSetup] Profile completed:', result);
      
      if (result.success) {
        console.log('✅ [ProfileSetup] Profile completed successfully');
        // Auth state is already updated, AppNavigator will handle navigation automatically
      } else {
        console.log('❌ [ProfileSetup] Failed to complete profile:', result.message);
        setErrors({ general: result.message || 'Failed to complete profile' });
      }
    } catch (err: any) {
      console.error('❌ [ProfileSetup] Error completing profile:', err);
      setErrors({ general: err.message || 'Something went wrong' });
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
          <Text style={styles.icon}>👤</Text>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Let's get to know you better
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Enter your full name"
              placeholderTextColor={COLORS.gray400}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name) {
                  setErrors({ ...errors, name: undefined });
                }
              }}
              autoCapitalize="words"
              autoFocus
            />
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.gray400}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors({ ...errors, email: undefined });
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Referral Code (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter referral code"
              placeholderTextColor={COLORS.gray400}
              value={referralCode}
              onChangeText={setReferralCode}
              autoCapitalize="characters"
            />
            <Text style={styles.hintText}>
              💰 Get bonus coins with a referral code
            </Text>
          </View>

          {errors.general ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTextGeneral}>⚠️ {errors.general}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={async () => {
              console.log('⏭️ [ProfileSetup] Skipping profile setup');
              // Reload auth state from AsyncStorage - this will trigger navigation to Main
              await dispatch(checkAuth());
            }}
            disabled={loading}
          >
            <Text style={styles.skipButtonText}>I'll do this later</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            ℹ️ You can always update this information later from your profile
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
    marginBottom: SPACING.xl * 1.5,
  },
  icon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.gray300,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 16,
    color: COLORS.gray900,
    backgroundColor: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.error + '10',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: SPACING.xs,
  },
  hintText: {
    color: COLORS.gray600,
    fontSize: 13,
    marginTop: SPACING.xs,
  },
  errorContainer: {
    backgroundColor: COLORS.error + '15',
    padding: SPACING.sm,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  errorTextGeneral: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
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
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  skipButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  skipButtonText: {
    fontSize: 15,
    color: COLORS.gray600,
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.gray700,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ProfileSetupScreen;
