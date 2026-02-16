import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';

const CreateBattleScreen = () => {
  const navigation = useNavigation<any>();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionsCount, setQuestionsCount] = useState(10);
  const [betAmount, setBetAmount] = useState(50);

  const handleCreate = () => {
    // API call to create battle
    console.log('Creating battle...', { difficulty, questionsCount, betAmount });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Battle</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Difficulty</Text>
          <View style={styles.optionsRow}>
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.optionButton, difficulty === level && styles.optionButtonActive]}
                onPress={() => setDifficulty(level)}
              >
                <Text style={[styles.optionText, difficulty === level && styles.optionTextActive]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Questions</Text>
          <View style={styles.optionsRow}>
            {[5, 10, 15, 20].map((count) => (
              <TouchableOpacity
                key={count}
                style={[styles.optionButton, questionsCount === count && styles.optionButtonActive]}
                onPress={() => setQuestionsCount(count)}
              >
                <Text style={[styles.optionText, questionsCount === count && styles.optionTextActive]}>
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bet Amount (Coins)</Text>
          <TextInput
            style={styles.input}
            value={String(betAmount)}
            onChangeText={(text) => setBetAmount(Number(text) || 0)}
            keyboardType="numeric"
            placeholder="Enter bet amount"
          />
        </View>

        <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
          <Text style={styles.createButtonText}>Create Battle</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  backIcon: {
    fontSize: 32,
    color: '#111827',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EEF2FF',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionTextActive: {
    color: COLORS.primary,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  createButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default CreateBattleScreen;
