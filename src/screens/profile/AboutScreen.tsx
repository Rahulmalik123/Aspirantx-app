import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';

const AboutScreen = () => {
  const navigation = useNavigation<any>();

  const team = [
    { name: 'Rahul Kumar', role: 'Founder & CEO', icon: 'person-circle-outline' },
    { name: 'Priya Sharma', role: 'Head of Content', icon: 'person-circle-outline' },
    { name: 'Amit Verma', role: 'Lead Developer', icon: 'person-circle-outline' },
  ];

  const features = [
    { icon: 'book-outline', title: 'Comprehensive Content', description: '10,000+ practice questions' },
    { icon: 'trophy-outline', title: 'Live Tournaments', description: 'Compete with aspirants nationwide' },
    { icon: 'analytics-outline', title: 'AI Analytics', description: 'Personalized performance insights' },
    { icon: 'people-outline', title: 'Community', description: 'Connect with fellow aspirants' },
  ];

  const socialLinks = [
    { name: 'Website', icon: 'globe-outline', url: 'https://aspiranthub.com', color: '#3B82F6' },
    { name: 'Instagram', icon: 'logo-instagram', url: 'https://instagram.com/aspiranthub', color: '#E4405F' },
    { name: 'Twitter', icon: 'logo-twitter', url: 'https://twitter.com/aspiranthub', color: '#1DA1F2' },
    { name: 'LinkedIn', icon: 'logo-linkedin', url: 'https://linkedin.com/company/aspiranthub', color: '#0A66C2' },
  ];

  const handleOpenLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="About Us" onBackPress={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Logo & App Name */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Icon name="school" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.appName}>MCQ Beast</Text>
          <Text style={styles.tagline}>Your Ultimate Exam Preparation Companion</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <View style={styles.missionCard}>
            <Icon name="rocket-outline" size={32} color={COLORS.primary} />
            <Text style={styles.missionText}>
              To empower millions of aspirants across India with quality education, 
              making exam preparation accessible, engaging, and effective for everyone.
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Offer</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: COLORS.primary + '20' }]}>
                  <Icon name={feature.icon} size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1M+</Text>
            <Text style={styles.statLabel}>Active Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>10K+</Text>
            <Text style={styles.statLabel}>Questions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>15+</Text>
            <Text style={styles.statLabel}>Exams</Text>
          </View>
        </View>

        {/* Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Team</Text>
          {team.map((member, index) => (
            <View key={index} style={styles.teamCard}>
              <View style={styles.teamAvatar}>
                <Icon name={member.icon} size={32} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.teamName}>{member.name}</Text>
                <Text style={styles.teamRole}>{member.role}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Social Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.socialGrid}>
            {socialLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={styles.socialCard}
                onPress={() => handleOpenLink(link.url)}
              >
                <Icon name={link.icon} size={28} color={link.color} />
                <Text style={styles.socialName}>{link.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          <View style={styles.contactCard}>
            <TouchableOpacity style={styles.contactRow} onPress={() => handleOpenLink('mailto:hello@aspiranthub.com')}>
              <Icon name="mail-outline" size={24} color={COLORS.primary} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>hello@aspiranthub.com</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.contactRow} onPress={() => handleOpenLink('https://aspiranthub.com')}>
              <Icon name="globe-outline" size={24} color={COLORS.primary} />
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Website</Text>
                <Text style={styles.contactValue}>www.aspiranthub.com</Text>
              </View>
              <Icon name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.legalLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.legalDivider}>•</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
            <Text style={styles.legalLink}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        {/* Copyright */}
        <Text style={styles.copyright}>
          © 2026 MCQ Beast. All rights reserved.
        </Text>
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
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.white,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  version: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  missionCard: {
    backgroundColor: COLORS.primary + '10',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  missionText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  teamAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  teamRole: {
    fontSize: 13,
    color: '#6B7280',
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  socialName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  contactCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 12,
  },
  legalLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  legalDivider: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  copyright: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default AboutScreen;
