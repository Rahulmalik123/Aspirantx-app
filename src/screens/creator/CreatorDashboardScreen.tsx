import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import CustomIcon from '../../components/CustomIcon';
import creatorService from '../../api/services/creatorService';

const CreatorDashboardScreen = ({navigation}: any) => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await creatorService.getDashboard();
      setDashboard(data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Not a creator yet
        showBecomeCreatorPrompt();
      } else {
        Alert.alert('Error', 'Failed to load dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const showBecomeCreatorPrompt = () => {
    Alert.alert(
      'Become a Creator',
      'Start selling your content and earn money!',
      [
        {text: 'Cancel', onPress: () => navigation.goBack()},
        {
          text: 'Register',
          onPress: () => navigation.navigate('BecomeCreator'),
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <CustomIcon name="arrow-left" size={20} color="#1F2937" type="material-community" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>Creator Dashboard</Text>
          <Text style={styles.subGreeting}>Track your earnings & content</Text>
        </View>
       
      </View>

      {/* Earnings Overview */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Earnings</Text>
        <View style={styles.earningsGrid}>
          <View style={styles.earningsBox}>
            <Text style={styles.earningsLabel}>Total Earned</Text>
            <Text style={styles.earningsValue}>
              ₹{dashboard.earnings?.total?.toFixed(2) || '0.00'}
            </Text>
          </View>
          <View style={styles.earningsBox}>
            <Text style={styles.earningsLabel}>Available</Text>
            <Text style={[styles.earningsValue, styles.availableValue]}>
              ₹{dashboard.earnings?.available?.toFixed(2) || '0.00'}
            </Text>
          </View>
        </View>

        <View style={styles.earningsRow}>
          <View style={styles.earningsStat}>
            <Text style={styles.earningsStatLabel}>Pending</Text>
            <Text style={styles.earningsStatValue}>
              ₹{dashboard.earnings?.pending?.toFixed(2) || '0.00'}
            </Text>
          </View>
          <View style={styles.earningsStat}>
            <Text style={styles.earningsStatLabel}>Paid Out</Text>
            <Text style={styles.earningsStatValue}>
              ₹{dashboard.earnings?.paid?.toFixed(2) || '0.00'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.payoutButton}
          onPress={() => navigation.navigate('RequestPayout')}
          disabled={(dashboard.earnings?.available || 0) < 500}>
          <CustomIcon name="bank-transfer" size={20} color="#FFF" type="material-community" />
          <Text style={styles.payoutButtonText}>Request Payout</Text>
        </TouchableOpacity>
        {(dashboard.earnings?.available || 0) < 500 && (
          <Text style={styles.minPayoutText}>
            Minimum ₹500 required for payout
          </Text>
        )}
      </View>

      {/* Content Stats */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Content Overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={[styles.statIcon, {backgroundColor: '#DBEAFE'}]}>
              <CustomIcon name="file-document" size={20} color="#3B82F6" type="material-community" />
            </View>
            <Text style={styles.statValue}>{dashboard.content?.total || 0}</Text>
            <Text style={styles.statLabel}>Total Content</Text>
          </View>
          <View style={styles.statBox}>
            <View style={[styles.statIcon, {backgroundColor: '#D1FAE5'}]}>
              <CustomIcon name="check-circle" size={20} color="#10B981" type="material-community" />
            </View>
            <Text style={styles.statValue}>
              {dashboard.content?.approved || 0}
            </Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statBox}>
            <View style={[styles.statIcon, {backgroundColor: '#FEF3C7'}]}>
              <CustomIcon name="clock-outline" size={20} color="#F59E0B" type="material-community" />
            </View>
            <Text style={styles.statValue}>
              {dashboard.content?.pending || 0}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statBox}>
            <View style={[styles.statIcon, {backgroundColor: '#FEE2E2'}]}>
              <CustomIcon name="close-circle" size={20} color="#EF4444" type="material-community" />
            </View>
            <Text style={styles.statValue}>
              {dashboard.content?.rejected || 0}
            </Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('UploadContent')}>
            <CustomIcon name="upload" size={22} color="#6366F1" type="material-community" />
            <Text style={styles.actionText}>Upload Content</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('MyUploads')}>
            <CustomIcon name="folder" size={22} color="#8B5CF6" type="material-community" />
            <Text style={styles.actionText}>My Content</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('CreatorDashboard')}>
            <CustomIcon name="chart-line" size={22} color="#10B981" type="material-community" />
            <Text style={styles.actionText}>Dashboard</Text>
          </TouchableOpacity>
      
        </View>
      </View>

      {/* Recent Sales */}
      {dashboard.recentSales && dashboard.recentSales.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recent Sales</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyUploads')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {dashboard.recentSales.slice(0, 5).map((sale: any, index: number) => (
            <View key={index} style={styles.saleCard}>
              <View style={styles.saleIcon}>
                <CustomIcon name="cart" size={20} color="#10B981" type="material-community" />
              </View>
              <View style={styles.saleInfo}>
                <Text style={styles.saleContent} numberOfLines={1}>
                  {sale.content?.title || 'Unknown Content'}
                </Text>
                <Text style={styles.saleDate}>
                  {new Date(sale.purchaseDate).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.saleAmount}>
                +₹{sale.creatorEarning?.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  subGreeting: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  earningsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  earningsBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
  },
  earningsLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  earningsValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  availableValue: {
    color: '#10B981',
  },
  earningsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  earningsStat: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 10,
  },
  earningsStatLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  earningsStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  payoutButton: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    borderRadius: 10,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  payoutButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  minPayoutText: {
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statBox: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  viewAllText: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '600',
  },
  saleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 6,
  },
  saleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  saleInfo: {
    flex: 1,
  },
  saleContent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  saleDate: {
    fontSize: 11,
    color: '#6B7280',
  },
  saleAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
});

export default CreatorDashboardScreen;
