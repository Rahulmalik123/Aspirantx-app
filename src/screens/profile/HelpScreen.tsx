import React, { useState } from 'react';
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

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HelpScreen = () => {
  const navigation = useNavigation<any>();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const faqs: FAQ[] = [
    {
      id: '1',
      category: 'Account',
      question: 'How do I create an account?',
      answer: 'You can create an account by clicking on the "Sign Up" button on the home screen. Enter your phone number, verify it with OTP, and complete your profile.',
    },
    {
      id: '2',
      category: 'Account',
      question: 'How do I reset my password?',
      answer: 'Go to Settings > Account > Change Password. You can also use the "Forgot Password" option on the login screen.',
    },
    {
      id: '3',
      category: 'Exams',
      question: 'How do I select my target exam?',
      answer: 'Go to Profile > Target Exams and select the exam(s) you are preparing for. You can select multiple exams.',
    },
    {
      id: '4',
      category: 'Exams',
      question: 'Can I attempt practice tests offline?',
      answer: 'Yes! Download the content when connected to Wi-Fi and access it offline anytime.',
    },
    {
      id: '5',
      category: 'Coins & Rewards',
      question: 'How do I earn coins?',
      answer: 'You can earn coins by completing daily tasks, maintaining streaks, referring friends, winning tournaments, and achieving perfect scores.',
    },
    {
      id: '6',
      category: 'Coins & Rewards',
      question: 'What can I do with coins?',
      answer: 'Coins can be used to unlock premium content, participate in tournaments, redeem rewards, and get access to exclusive features.',
    },
    {
      id: '7',
      category: 'Technical',
      question: 'The app is not loading properly. What should I do?',
      answer: 'Try these steps: 1) Check your internet connection 2) Clear app cache 3) Update to the latest version 4) Restart the app 5) Contact support if issue persists.',
    },
    {
      id: '8',
      category: 'Technical',
      question: 'How do I update the app?',
      answer: 'Go to Play Store (Android) or App Store (iOS), search for MCQ Beast, and click Update if available.',
    },
  ];

  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category)))];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFaqs = selectedCategory === 'All' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Help & FAQ" 
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity>
            <Icon name="search-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      {/* Contact Support Card */}
      <View style={styles.supportCard}>
        <View style={styles.supportIcon}>
          <Icon name="chatbubbles" size={32} color={COLORS.primary} />
        </View>
        <View style={styles.supportContent}>
          <Text style={styles.supportTitle}>Need More Help?</Text>
          <Text style={styles.supportDescription}>Our support team is here for you</Text>
        </View>
        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactButtonText}>Contact</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryChip,
              selectedCategory === category && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive,
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAQ List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredFaqs.map((faq) => (
          <TouchableOpacity
            key={faq.id}
            style={styles.faqCard}
            onPress={() => toggleFAQ(faq.id)}
            activeOpacity={0.7}
          >
            <View style={styles.faqHeader}>
              <View style={styles.questionContainer}>
                <Icon name="help-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.question}>{faq.question}</Text>
              </View>
              <Icon
                name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#6B7280"
              />
            </View>
            {expandedId === faq.id && (
              <View style={styles.answerContainer}>
                <Text style={styles.answer}>{faq.answer}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* Still Have Questions */}
        <View style={styles.bottomCard}>
          <Icon name="mail-outline" size={24} color={COLORS.primary} />
          <Text style={styles.bottomTitle}>Still have questions?</Text>
          <Text style={styles.bottomText}>
            Send us an email at support@aspiranthub.com
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
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  supportIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  supportDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  contactButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: COLORS.white,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  faqCard: {
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
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  question: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 22,
  },
  answerContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  answer: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  bottomCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bottomTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
    marginBottom: 8,
  },
  bottomText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default HelpScreen;
