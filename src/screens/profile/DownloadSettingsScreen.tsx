import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import Header from '../../components/common/Header';

const DownloadSettingsScreen = () => {
  const navigation = useNavigation<any>();
  const [autoDownload, setAutoDownload] = useState(false);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [downloadQuality, setDownloadQuality] = useState<'low' | 'medium' | 'high'>('medium');

  const storageInfo = {
    used: '2.5 GB',
    total: '32 GB',
    percentage: 7.8,
  };

  const qualityOptions = [
    { id: 'low', label: 'Low Quality', description: 'Saves storage, lower quality', size: '~50 MB/course' },
    { id: 'medium', label: 'Medium Quality', description: 'Balanced quality & size', size: '~150 MB/course' },
    { id: 'high', label: 'High Quality', description: 'Best quality, more storage', size: '~300 MB/course' },
  ];

  return (
    <View style={styles.container}>
      <Header title="Download Settings" onBackPress={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Storage Info */}
        <View style={styles.storageCard}>
          <View style={styles.storageHeader}>
            <Icon name="phone-portrait-outline" size={24} color={COLORS.primary} />
            <Text style={styles.storageTitle}>Device Storage</Text>
          </View>
          <View style={styles.storageBar}>
            <View style={[styles.storageFill, { width: `${storageInfo.percentage}%` }]} />
          </View>
          <Text style={styles.storageText}>
            {storageInfo.used} used of {storageInfo.total}
          </Text>
        </View>

        {/* Download Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Download Preferences</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <Icon name="download-outline" size={22} color={COLORS.primary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto Download</Text>
                <Text style={styles.settingDescription}>
                  Automatically download enrolled content
                </Text>
              </View>
            </View>
            <Switch
              value={autoDownload}
              onValueChange={setAutoDownload}
              trackColor={{ false: '#D1D5DB', true: COLORS.primary + '80' }}
              thumbColor={autoDownload ? COLORS.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingLeft}>
              <Icon name="wifi-outline" size={22} color={COLORS.primary} />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Download on Wi-Fi Only</Text>
                <Text style={styles.settingDescription}>
                  Prevent mobile data usage
                </Text>
              </View>
            </View>
            <Switch
              value={wifiOnly}
              onValueChange={setWifiOnly}
              trackColor={{ false: '#D1D5DB', true: COLORS.primary + '80' }}
              thumbColor={wifiOnly ? COLORS.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Download Quality */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Download Quality</Text>
          {qualityOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.qualityCard,
                downloadQuality === option.id && styles.qualityCardSelected,
              ]}
              onPress={() => setDownloadQuality(option.id as any)}
            >
              <View style={styles.qualityLeft}>
                <View style={[
                  styles.radioButton,
                  downloadQuality === option.id && styles.radioButtonSelected,
                ]}>
                  {downloadQuality === option.id && <View style={styles.radioDot} />}
                </View>
                <View>
                  <Text style={[
                    styles.qualityLabel,
                    downloadQuality === option.id && styles.qualityLabelSelected,
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={styles.qualityDescription}>{option.description}</Text>
                  <Text style={styles.qualitySize}>{option.size}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Downloaded Content */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Downloaded Content</Text>
          
          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionLeft}>
              <Icon name="folder-outline" size={22} color={COLORS.primary} />
              <Text style={styles.actionLabel}>View Downloads</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionLeft}>
              <Icon name="trash-outline" size={22} color="#EF4444" />
              <Text style={[styles.actionLabel, { color: '#EF4444' }]}>
                Clear All Downloads
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Icon name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Downloaded content is available offline. You can manage individual downloads from the course page.
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
  storageCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  storageBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  storageFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  storageText: {
    fontSize: 13,
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  settingCard: {
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
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  qualityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
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
  qualityCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '05',
  },
  qualityLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  radioButtonSelected: {
    borderColor: COLORS.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  qualityLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  qualityLabelSelected: {
    color: COLORS.primary,
  },
  qualityDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  qualitySize: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionCard: {
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
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '10',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
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
});

export default DownloadSettingsScreen;
