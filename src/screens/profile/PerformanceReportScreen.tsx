import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const PerformanceReportScreen = () => {
  const navigation = useNavigation<any>();
  const screenWidth = Dimensions.get('window').width;

  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [45, 60, 55, 70, 65, 80, 75],
      },
    ],
  };

  const subjectData = {
    labels: ['Math', 'English', 'GK', 'Reasoning'],
    datasets: [
      {
        data: [85, 70, 65, 90],
      },
    ],
  };

  const accuracyData = [
    { name: 'Correct', population: 75, color: '#10B981', legendFontColor: '#1F2937' },
    { name: 'Wrong', population: 15, color: '#EF4444', legendFontColor: '#1F2937' },
    { name: 'Skipped', population: 10, color: '#F59E0B', legendFontColor: '#1F2937' },
  ];

  const metrics = [
    { label: 'Accuracy', value: '75%', icon: 'checkmark-circle', color: '#10B981', change: '+5%' },
    { label: 'Avg Score', value: '72%', icon: 'star', color: '#FFD700', change: '+3%' },
    { label: 'Time/Q', value: '1.2m', icon: 'time', color: '#3B82F6', change: '-0.2m' },
    { label: 'Rank', value: '#245', icon: 'trophy', color: '#9C27B0', change: '↑12' },
  ];

  const strengths = [
    { subject: 'Reasoning', score: 90, color: '#10B981' },
    { subject: 'Mathematics', score: 85, color: '#3B82F6' },
    { subject: 'English', score: 70, color: '#F59E0B' },
  ];

  const weaknesses = [
    { subject: 'General Knowledge', score: 65, color: '#EF4444' },
    { subject: 'Current Affairs', score: 60, color: '#F59E0B' },
  ];

  const chartConfig = {
    backgroundColor: COLORS.white,
    backgroundGradientFrom: COLORS.white,
    backgroundGradientTo: COLORS.white,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: COLORS.primary,
    },
  };

  return (
    <View style={styles.container}>
      <Header 
        title="Performance Report" 
        onBackPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity>
            <Icon name="download-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Metrics Cards */}
        <View style={styles.metricsContainer}>
          {metrics.map((metric, index) => (
            <View key={index} style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: metric.color + '20' }]}>
                <Icon name={metric.icon} size={20} color={metric.color} />
              </View>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={[styles.metricChange, { color: metric.change.includes('-') || metric.change.includes('↓') ? '#EF4444' : '#10B981' }]}>
                {metric.change}
              </Text>
            </View>
          ))}
        </View>

        {/* Weekly Progress */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Weekly Progress</Text>
          <View style={styles.chartCard}>
            <LineChart
              data={weeklyData}
              width={screenWidth - 60}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        {/* Subject-wise Performance */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Subject-wise Score</Text>
          <View style={styles.chartCard}>
            <BarChart
              data={subjectData}
              width={screenWidth - 60}
              height={200}
              chartConfig={chartConfig}
              style={styles.chart}
              yAxisSuffix="%"
            />
          </View>
        </View>

        {/* Accuracy Distribution */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Accuracy Distribution</Text>
          <View style={styles.chartCard}>
            <PieChart
              data={accuracyData}
              width={screenWidth - 60}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        </View>

        {/* Strengths */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Strengths</Text>
          {strengths.map((item, index) => (
            <View key={index} style={styles.strengthCard}>
              <View style={styles.strengthLeft}>
                <Icon name="trending-up" size={20} color={item.color} />
                <Text style={styles.strengthSubject}>{item.subject}</Text>
              </View>
              <View style={styles.strengthRight}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${item.score}%`, backgroundColor: item.color }]} />
                </View>
                <Text style={[styles.strengthScore, { color: item.color }]}>{item.score}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Weaknesses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Areas to Improve</Text>
          {weaknesses.map((item, index) => (
            <View key={index} style={styles.strengthCard}>
              <View style={styles.strengthLeft}>
                <Icon name="trending-down" size={20} color={item.color} />
                <Text style={styles.strengthSubject}>{item.subject}</Text>
              </View>
              <View style={styles.strengthRight}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${item.score}%`, backgroundColor: item.color }]} />
                </View>
                <Text style={[styles.strengthScore, { color: item.color }]}>{item.score}%</Text>
              </View>
            </View>
          ))}
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
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  metricCard: {
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
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  chartCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chart: {
    borderRadius: 8,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  strengthCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  strengthLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  strengthSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  strengthRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  strengthScore: {
    fontSize: 14,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
});

export default PerformanceReportScreen;
