import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Share,
  Clipboard,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';

const ReferralScreen = () => {
  const navigation = useNavigation<any>();
  const referralCode = 'ASPIRE2024';
  const referralLink = `https://aspiranthub.com/ref/${referralCode}`;

  const stats = [
    { label: 'Invited', value: '12', icon: 'people-outline', color: '#3B82F6' },
    { label: 'Joined', value: '8', icon: 'checkmark-circle-outline', color: '#10B981' },
    { label: 'Coins Earned', value: '400', icon: 'logo-bitcoin', color: '#FFD700' },
  ];

  const rewards = [
    { milestone: '1 Friend', reward: '50 Coins', icon: 'gift-outline', unlocked: true },
    { milestone: '5 Friends', reward: '250 Coins + Badge', icon: 'medal-outline', unlocked: true },
    { milestone: '10 Friends', reward: '500 Coins + Premium', icon: 'star-outline', unlocked: false },
    { milestone: '25 Friends', reward: '1500 Coins + Trophy', icon: 'trophy-outline', unlocked: false },
  ];

  const handleCopyCode = () => {
    Clipboard.setString(referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const handleCopyLink = () => {
    Clipboard.setString(referralLink);
    Alert.alert('Copied!', 'Referral link copied to clipboard');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Join me on MCQ Beast! Use my referral code: ${referralCode} or click: ${referralLink}`,
        title: 'Join MCQ Beast',
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Refer & Earn" onBackPress={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Icon name="gift" size={48} color={COLORS.primary} />
          <Text style={styles.heroTitle}>Invite Friends, Earn Rewards!</Text>
          <Text style={styles.heroSubtitle}>
            Share your referral code and get 50 coins for each friend who joins
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color + '20' }]}>
                <Icon name={stat.icon} size={24} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Referral Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Referral Code</Text>
          <View style={styles.codeCard}>
            <View style={styles.codeLeft}>
              <Icon name="ticket-outline" size={24} color={COLORS.primary} />
              <Text style={styles.codeText}>{referralCode}</Text>
            </View>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
              <Icon name="copy-outline" size={20} color={COLORS.white} />
              <Text style={styles.copyButtonText}>Copy</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Referral Link */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share Your Link</Text>
          <View style={styles.linkCard}>
            <Text style={styles.linkText} numberOfLines={1}>{referralLink}</Text>
            <View style={styles.linkActions}>
              <TouchableOpacity style={styles.linkButton} onPress={handleCopyLink}>
                <Icon name="copy-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkButton} onPress={handleShare}>
                <Icon name="share-social-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Share via Social */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share via</Text>
          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Icon name="logo-whatsapp" size={24} color="#25D366" />
              <Text style={styles.socialButtonText}>WhatsApp</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Icon name="mail-outline" size={24} color="#3B82F6" />
              <Text style={styles.socialButtonText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Icon name="chatbubble-outline" size={24} color="#10B981" />
              <Text style={styles.socialButtonText}>SMS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Icon name="ellipsis-horizontal" size={24} color="#6B7280" />
              <Text style={styles.socialButtonText}>More</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rewards Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referral Rewards</Text>
          {rewards.map((reward, index) => (
            <View
              key={index}
              style={[styles.rewardCard, !reward.unlocked && styles.rewardCardLocked]}
            >
              <View style={[
                styles.rewardIcon,
                { backgroundColor: reward.unlocked ? COLORS.primary + '20' : '#E5E7EB' }
              ]}>
                <Icon
                  name={reward.icon}
                  size={24}
                  color={reward.unlocked ? COLORS.primary : '#9CA3AF'}
                />
              </View>
              <View style={styles.rewardContent}>
                <Text style={[
                  styles.rewardMilestone,
                  !reward.unlocked && styles.rewardMilestoneLocked
                ]}>
                  {reward.milestone}
                </Text>
                <Text style={styles.rewardText}>{reward.reward}</Text>
              </View>
              {reward.unlocked && (
                <Icon name="checkmark-circle" size={24} color="#10B981" />
              )}
            </View>
          ))}
        </View>

        {/* Terms */}
        <View style={styles.termsCard}>
          <Text style={styles.termsTitle}>How it works</Text>
          <Text style={styles.termsText}>
            • Share your unique referral code with friends{'\n'}
            • They sign up using your code{'\n'}
            • You both get 50 coins instantly{'\n'}
            • Unlock more rewards as you refer more friends
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
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: COLORS.primary + '15',
    margin: 20,
    marginBottom: 12,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  codeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  codeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  linkCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  linkText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  linkActions: {
    flexDirection: 'row',
    gap: 12,
  },
  linkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  socialButtonText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardCardLocked: {
    opacity: 0.6,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardContent: {
    flex: 1,
  },
  rewardMilestone: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  rewardMilestoneLocked: {
    color: '#6B7280',
  },
  rewardText: {
    fontSize: 13,
    color: '#6B7280',
  },
  termsCard: {
    backgroundColor: COLORS.primary + '10',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
  },
  termsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 20,
  },
});

export default ReferralScreen;
