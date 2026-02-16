import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';

const TermsScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Header
        title="Terms & Conditions"
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.lastUpdated}>
          <Icon name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.lastUpdatedText}>Last updated: January 27, 2026</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agreement to Terms</Text>
          <Text style={styles.paragraph}>
            By accessing and using MCQ Beast, you accept and agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Accounts</Text>
          <Text style={styles.paragraph}>
            When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Safeguarding your account password</Text>
            <Text style={styles.bulletPoint}>• All activities that occur under your account</Text>
            <Text style={styles.bulletPoint}>• Notifying us of any unauthorized access</Text>
            <Text style={styles.bulletPoint}>• Maintaining the accuracy of your information</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acceptable Use</Text>
          <Text style={styles.paragraph}>
            You agree NOT to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Use the app for any unlawful purpose</Text>
            <Text style={styles.bulletPoint}>• Violate any laws in your jurisdiction</Text>
            <Text style={styles.bulletPoint}>• Infringe intellectual property rights</Text>
            <Text style={styles.bulletPoint}>• Transmit malicious code or viruses</Text>
            <Text style={styles.bulletPoint}>• Interfere with the security of the app</Text>
            <Text style={styles.bulletPoint}>• Attempt to access other users' accounts</Text>
            <Text style={styles.bulletPoint}>• Share or distribute content without permission</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intellectual Property</Text>
          <Text style={styles.paragraph}>
            All content, features, and functionality of MCQ Beast are owned by us and are protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our permission.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content and Services</Text>
          <Text style={styles.paragraph}>
            We reserve the right to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Modify or discontinue services at any time</Text>
            <Text style={styles.bulletPoint}>• Change pricing and features</Text>
            <Text style={styles.bulletPoint}>• Remove or restrict access to content</Text>
            <Text style={styles.bulletPoint}>• Update terms without prior notice</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscriptions and Payments</Text>
          <Text style={styles.paragraph}>
            • Subscriptions automatically renew unless canceled{'\n'}
            • Fees are non-refundable except as required by law{'\n'}
            • Price changes will be communicated in advance{'\n'}
            • You can cancel anytime from your account settings
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            MCQ Beast and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disclaimer</Text>
          <Text style={styles.paragraph}>
            The service is provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, secure, or error-free. Educational content is for informational purposes only.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Termination</Text>
          <Text style={styles.paragraph}>
            We may terminate or suspend your account immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the service will cease immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Text style={styles.paragraph}>
            For questions about these Terms, please contact us:
          </Text>
          <View style={styles.contactCard}>
            <View style={styles.contactRow}>
              <Icon name="mail-outline" size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>legal@aspiranthub.com</Text>
            </View>
            <View style={styles.contactRow}>
              <Icon name="globe-outline" size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>www.aspiranthub.com/terms</Text>
            </View>
          </View>
        </View>

        <View style={styles.acceptCard}>
          <Icon name="checkmark-circle" size={24} color="#10B981" />
          <Text style={styles.acceptText}>
            By continuing to use MCQ Beast, you acknowledge that you have read and agree to these Terms and Conditions.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
  },
  lastUpdatedText: {
    fontSize: 13,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletList: {
    marginTop: 8,
    gap: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    paddingLeft: 8,
  },
  contactCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    gap: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  acceptCard: {
    flexDirection: 'row',
    backgroundColor: '#10B981' + '10',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'flex-start',
  },
  acceptText: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
    lineHeight: 20,
  },
});

export default TermsScreen;
