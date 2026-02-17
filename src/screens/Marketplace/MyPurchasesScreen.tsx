import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import CustomIcon from '../../components/CustomIcon';
import contentService, {Purchase} from '../../api/services/contentService';
import { COLORS } from '../../constants/colors';
import {Alert, Linking} from 'react-native';

const MyPurchasesScreen = ({navigation}: any) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      const data = await contentService.getMyPurchases();
      setPurchases(data);
    } catch (error) {
      console.error('Failed to load purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPurchases();
    setRefreshing(false);
  };

  const handleDownload = async (purchaseId: string) => {
    try {
      const response = await contentService.downloadContent(purchaseId);
      
      if (response.downloadLinks && response.downloadLinks.length > 0) {
        // Open first link
        const firstLink = response.downloadLinks[0];
        const supported = await Linking.canOpenURL(firstLink.url);
        
        if (supported) {
          await Linking.openURL(firstLink.url);
        } else {
          Alert.alert('Error', 'Cannot open download link');
        }
        
        // Show info about multiple files if applicable
        if (response.downloadLinks.length > 1) {
          Alert.alert(
            'Multiple Files',
            `This content has ${response.downloadLinks.length} files. Opening first file. Links expire in 24 hours.`,
          );
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Download failed');
    }
  };

  const renderPurchaseCard = ({item}: {item: Purchase}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.typeIcon}>
          <CustomIcon
            name={
              item.content.contentType === 'pdf'
                ? 'file-pdf-box'
                : item.content.contentType === 'video'
                ? 'video'
                : 'notebook'
            }
            size={24}
            color="COLORS.primary"
            type="material-community"
          />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {item.content.title}
          </Text>
          <Text style={styles.creator}>by {item.content.creator.name}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <CustomIcon name="calendar" size={14} color="#6B7280" type="material-community" />
          <Text style={styles.statText}>
            {new Date(item.purchasedAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.stat}>
          <CustomIcon name="download" size={14} color="#6B7280" type="material-community" />
          <Text style={styles.statText}>{item.downloadCount} downloads</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.price}>₹{item.finalPrice}</Text>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => handleDownload(item._id)}>
          <CustomIcon name="download" size={16} color="#FFF" type="material-community" />
          <Text style={styles.downloadButtonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="COLORS.primary" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {purchases.length === 0 ? (
        <View style={styles.emptyContainer}>
          <CustomIcon name="shopping" size={64} color="#DDD" type="material-community" />
          <Text style={styles.emptyText}>No purchases yet</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Marketplace')}>
            <Text style={styles.browseButtonText}>Browse Marketplace</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={purchases}
          renderItem={renderPurchaseCard}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: 'COLORS.primary',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  creator: {
    fontSize: 13,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'COLORS.primary',
  },
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: 'COLORS.primary',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MyPurchasesScreen;
