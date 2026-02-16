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

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Header title="Privacy Policy" onBackPress={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.lastUpdated}>
          <Icon name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.lastUpdatedText}>Last updated: January 27, 2026</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.paragraph}>
            MCQ Beast ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect information that you provide directly to us, including:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Personal information (name, email, phone number)</Text>
            <Text style={styles.bulletPoint}>• Profile information and preferences</Text>
            <Text style={styles.bulletPoint}>• Educational background and exam preferences</Text>
            <Text style={styles.bulletPoint}>• Usage data and performance metrics</Text>
            <Text style={styles.bulletPoint}>• Device information and analytics</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            We use the information we collect to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Provide, maintain, and improve our services</Text>
            <Text style={styles.bulletPoint}>• Personalize your learning experience</Text>
            <Text style={styles.bulletPoint}>• Send you technical notices and updates</Text>
            <Text style={styles.bulletPoint}>• Respond to your comments and questions</Text>
            <Text style={styles.bulletPoint}>• Monitor and analyze trends and usage</Text>
            <Text style={styles.bulletPoint}>• Detect and prevent fraud and abuse</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Security</Text>
          <Text style={styles.paragraph}>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information Sharing</Text>
          <Text style={styles.paragraph}>
            We do not sell your personal information. We may share your information with:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Service providers who assist in our operations</Text>
            <Text style={styles.bulletPoint}>• Analytics providers for app improvement</Text>
            <Text style={styles.bulletPoint}>• Law enforcement when required by law</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletPoint}>• Access your personal information</Text>
            <Text style={styles.bulletPoint}>• Correct inaccurate data</Text>
            <Text style={styles.bulletPoint}>• Request deletion of your data</Text>
            <Text style={styles.bulletPoint}>• Opt-out of marketing communications</Text>
            <Text style={styles.bulletPoint}>• Export your data</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.paragraph}>
            Our service is intended for users aged 13 and above. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to This Policy</Text>
          <Text style={styles.paragraph}>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy, please contact us at:
          </Text>
          <View style={styles.contactCard}>
            <View style={styles.contactRow}>
              <Icon name="mail-outline" size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>privacy@aspiranthub.com</Text>
            </View>
            <View style={styles.contactRow}>
              <Icon name="globe-outline" size={20} color={COLORS.primary} />
              <Text style={styles.contactText}>www.aspiranthub.com</Text>
            </View>
          </View>
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
});

export default PrivacyPolicyScreen;
