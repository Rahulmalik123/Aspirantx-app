import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';

interface Exam {
  id: string;
  name: string;
  description: string;
  icon: string;
  isSelected: boolean;
}

const TargetExamsScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<Exam[]>([
    { id: '1', name: 'UPSC CSE', description: 'Civil Services Examination', icon: 'school-outline', isSelected: true },
    { id: '2', name: 'SSC CGL', description: 'Combined Graduate Level', icon: 'briefcase-outline', isSelected: false },
    { id: '3', name: 'Banking PO', description: 'Probationary Officer', icon: 'cash-outline', isSelected: false },
    { id: '4', name: 'Railway', description: 'Railway Recruitment Board', icon: 'train-outline', isSelected: false },
    { id: '5', name: 'GATE', description: 'Graduate Aptitude Test', icon: 'desktop-outline', isSelected: false },
    { id: '6', name: 'CAT', description: 'Common Admission Test', icon: 'business-outline', isSelected: false },
    { id: '7', name: 'NEET', description: 'Medical Entrance Exam', icon: 'medical-outline', isSelected: false },
    { id: '8', name: 'JEE', description: 'Joint Entrance Examination', icon: 'calculator-outline', isSelected: false },
    { id: '9', name: 'State PSC', description: 'State Public Service Commission', icon: 'location-outline', isSelected: false },
    { id: '10', name: 'NDA', description: 'National Defence Academy', icon: 'shield-outline', isSelected: false },
  ]);

  const toggleExam = (examId: string) => {
    setExams(exams.map(exam => 
      exam.id === examId ? { ...exam, isSelected: !exam.isSelected } : exam
    ));
  };

  const handleSave = () => {
    // Save selected exams to backend
    const selectedExams = exams.filter(exam => exam.isSelected);
    console.log('Selected exams:', selectedExams);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Header title="Target Exams" onBackPress={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Select the exams you are preparing for. We'll personalize your experience accordingly.
        </Text>

        <View style={styles.examsList}>
          {exams.map((exam) => (
            <TouchableOpacity
              key={exam.id}
              style={[styles.examCard, exam.isSelected && styles.examCardSelected]}
              onPress={() => toggleExam(exam.id)}
              activeOpacity={0.7}
            >
              <View style={styles.examCardLeft}>
                <View style={[
                  styles.examIcon,
                  exam.isSelected && styles.examIconSelected
                ]}>
                  <Icon 
                    name={exam.icon} 
                    size={24} 
                    color={exam.isSelected ? COLORS.white : COLORS.primary} 
                  />
                </View>
                <View style={styles.examInfo}>
                  <Text style={[
                    styles.examName,
                    exam.isSelected && styles.examNameSelected
                  ]}>
                    {exam.name}
                  </Text>
                  <Text style={styles.examDescription}>{exam.description}</Text>
                </View>
              </View>
              <View style={[
                styles.checkbox,
                exam.isSelected && styles.checkboxSelected
              ]}>
                {exam.isSelected && <Icon name="checkmark" size={18} color={COLORS.white} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
  },
  examsList: {
    gap: 12,
  },
  examCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  examCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
  },
  examCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  examIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  examIconSelected: {
    backgroundColor: COLORS.primary,
  },
  examInfo: {
    flex: 1,
  },
  examName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  examNameSelected: {
    color: COLORS.primary,
  },
  examDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  footer: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default TargetExamsScreen;
