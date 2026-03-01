import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface LanguageToggleProps {
  language: 'en' | 'hi';
  onToggle: () => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ language, onToggle }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onToggle} activeOpacity={0.7}>
      <View style={[styles.option, language === 'en' && styles.activeOption]}>
        <Text style={[styles.text, language === 'en' && styles.activeText]}>EN</Text>
      </View>
      <View style={[styles.option, language === 'hi' && styles.activeOption]}>
        <Text style={[styles.text, language === 'hi' && styles.activeText]}>हि</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  option: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeOption: {
    backgroundColor: COLORS.primary,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  activeText: {
    color: '#FFF',
  },
});

export default LanguageToggle;
