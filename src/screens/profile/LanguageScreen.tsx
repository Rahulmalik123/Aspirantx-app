import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';

interface Language {
  id: string;
  name: string;
  nativeName: string;
  code: string;
  flag: string;
}

const LanguageScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const languages: Language[] = [
    { id: '1', name: 'English', nativeName: 'English', code: 'en', flag: '🇬🇧' },
    { id: '2', name: 'Hindi', nativeName: 'हिंदी', code: 'hi', flag: '🇮🇳' },
    { id: '3', name: 'Bengali', nativeName: 'বাংলা', code: 'bn', flag: '🇧🇩' },
    { id: '4', name: 'Telugu', nativeName: 'తెలుగు', code: 'te', flag: '🇮🇳' },
    { id: '5', name: 'Marathi', nativeName: 'मराठी', code: 'mr', flag: '🇮🇳' },
    { id: '6', name: 'Tamil', nativeName: 'தமிழ்', code: 'ta', flag: '🇮🇳' },
    { id: '7', name: 'Gujarati', nativeName: 'ગુજરાતી', code: 'gu', flag: '🇮🇳' },
    { id: '8', name: 'Kannada', nativeName: 'ಕನ್ನಡ', code: 'kn', flag: '🇮🇳' },
    { id: '9', name: 'Malayalam', nativeName: 'മലയാളം', code: 'ml', flag: '🇮🇳' },
    { id: '10', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', code: 'pa', flag: '🇮🇳' },
  ];

  const handleSelectLanguage = (code: string) => {
    setSelectedLanguage(code);
    // Save language preference
    setTimeout(() => navigation.goBack(), 300);
  };

  const renderLanguage = ({ item }: { item: Language }) => (
    <TouchableOpacity
      style={[
        styles.languageCard,
        selectedLanguage === item.code && styles.languageCardSelected,
      ]}
      onPress={() => handleSelectLanguage(item.code)}
      activeOpacity={0.7}
    >
      <View style={styles.languageLeft}>
        <Text style={styles.flagEmoji}>{item.flag}</Text>
        <View>
          <Text style={[
            styles.languageName,
            selectedLanguage === item.code && styles.languageNameSelected,
          ]}>
            {item.name}
          </Text>
          <Text style={styles.nativeName}>{item.nativeName}</Text>
        </View>
      </View>
      
      {selectedLanguage === item.code && (
        <View style={styles.checkmark}>
          <Icon name="checkmark-circle" size={24} color={COLORS.primary} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Language" onBackPress={() => navigation.goBack()} />

      {/* Info */}
      <View style={styles.infoCard}>
        <Icon name="information-circle-outline" size={20} color={COLORS.primary} />
        <Text style={styles.infoText}>
          Select your preferred language. This will change the app interface and content language.
        </Text>
      </View>

      {/* Languages List */}
      <FlatList
        data={languages}
        keyExtractor={(item) => item.id}
        renderItem={renderLanguage}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '10',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
    lineHeight: 18,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  languageCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  languageCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  flagEmoji: {
    fontSize: 32,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  languageNameSelected: {
    color: COLORS.primary,
  },
  nativeName: {
    fontSize: 14,
    color: '#6B7280',
  },
  checkmark: {
    marginLeft: 12,
  },
});

export default LanguageScreen;
