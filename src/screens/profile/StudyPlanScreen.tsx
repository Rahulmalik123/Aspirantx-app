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

interface StudyTask {
  id: string;
  subject: string;
  topic: string;
  duration: string;
  completed: boolean;
  time: string;
}

const StudyPlanScreen = () => {
  const navigation = useNavigation<any>();
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDay = new Date().getDay();
  
  const todayTasks: StudyTask[] = [
    { id: '1', subject: 'Mathematics', topic: 'Algebra - Quadratic Equations', duration: '45 min', completed: true, time: '09:00 AM' },
    { id: '2', subject: 'English', topic: 'Grammar - Tenses', duration: '30 min', completed: true, time: '10:00 AM' },
    { id: '3', subject: 'General Science', topic: 'Physics - Motion', duration: '60 min', completed: false, time: '11:00 AM' },
    { id: '4', subject: 'Current Affairs', topic: 'Weekly News Revision', duration: '30 min', completed: false, time: '02:00 PM' },
    { id: '5', subject: 'Reasoning', topic: 'Logical Reasoning', duration: '45 min', completed: false, time: '04:00 PM' },
  ];

  const stats = [
    { label: 'Daily Goal', value: '4h', icon: 'time-outline', color: '#3B82F6' },
    { label: 'Completed', value: '1.5h', icon: 'checkmark-circle-outline', color: '#10B981' },
    { label: 'Remaining', value: '2.5h', icon: 'hourglass-outline', color: '#F59E0B' },
  ];

  const toggleTaskComplete = (taskId: string) => {
    // Toggle task completion
    console.log('Toggle task:', taskId);
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Study Plan" 
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity style={styles.addButton}>
            <Icon name="add-circle-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Calendar Week View */}
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <Text style={styles.monthText}>January 2026</Text>
            <TouchableOpacity>
              <Icon name="calendar-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.weekDays}>
            {weekDays.map((day, index) => {
              const date = new Date();
              date.setDate(date.getDate() - currentDay + index + 1);
              const dayNumber = date.getDate();
              const isToday = dayNumber === selectedDay;
              
              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayCard, isToday && styles.dayCardActive]}
                  onPress={() => setSelectedDay(dayNumber)}
                >
                  <Text style={[styles.dayName, isToday && styles.dayNameActive]}>
                    {day}
                  </Text>
                  <Text style={[styles.dayNumber, isToday && styles.dayNumberActive]}>
                    {dayNumber}
                  </Text>
                  {isToday && <View style={styles.activeDot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Icon name={stat.icon} size={24} color={stat.color} />
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Today's Tasks */}
        <View style={styles.tasksSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Tasks</Text>
            <Text style={styles.taskCount}>{todayTasks.filter(t => t.completed).length}/{todayTasks.length}</Text>
          </View>

          <View style={styles.tasksList}>
            {todayTasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    task.completed && styles.checkboxCompleted
                  ]}
                  onPress={() => toggleTaskComplete(task.id)}
                >
                  {task.completed && <Icon name="checkmark" size={18} color={COLORS.white} />}
                </TouchableOpacity>

                <View style={styles.taskContent}>
                  <View style={styles.taskHeader}>
                    <Text style={[
                      styles.taskSubject,
                      task.completed && styles.taskCompleted
                    ]}>
                      {task.subject}
                    </Text>
                    <Text style={styles.taskTime}>{task.time}</Text>
                  </View>
                  <Text style={[
                    styles.taskTopic,
                    task.completed && styles.taskCompleted
                  ]}>
                    {task.topic}
                  </Text>
                  <View style={styles.taskFooter}>
                    <View style={styles.durationBadge}>
                      <Icon name="time-outline" size={14} color="#6B7280" />
                      <Text style={styles.durationText}>{task.duration}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Weekly Progress */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Weekly Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '65%' }]} />
          </View>
          <Text style={styles.progressText}>65% of weekly goal completed</Text>
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
  addButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  calendarContainer: {
    backgroundColor: COLORS.white,
    padding: 20,
    marginBottom: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  dayCardActive: {
    backgroundColor: COLORS.primary,
  },
  dayName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  dayNameActive: {
    color: COLORS.white,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  dayNumberActive: {
    color: COLORS.white,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.white,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
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
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  tasksSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  taskCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  tasksList: {
    gap: 12,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  taskContent: {
    flex: 1,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskSubject: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  taskTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  taskTopic: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginVertical: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default StudyPlanScreen;
