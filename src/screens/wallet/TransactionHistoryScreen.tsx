import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {COLORS} from '../../constants/colors';
import {FONT_FAMILY, FONT_SIZE} from '../../constants/typography';
import {SPACING, BORDER_RADIUS} from '../../constants/spacing';
import Header from '../../components/common/Header';
import CustomIcon from '../../components/CustomIcon';
import walletService, {Transaction} from '../../api/services/walletService';

type FilterType = 'all' | 'credit' | 'debit';

const TransactionHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 20;

  const fetchTransactions = useCallback(
    async (pageNum = 1, isRefresh = false) => {
      try {
        if (pageNum === 1 && !isRefresh) {
          setLoading(true);
        }

        const res: any = await walletService.getTransactions(
          pageNum,
          PAGE_SIZE,
        );
        const newTransactions =
          res?.data?.data || res?.data?.transactions || res?.transactions || [];
        const total = res?.data?.total || res?.total || 0;

        if (pageNum === 1) {
          setTransactions(newTransactions);
        } else {
          setTransactions(prev => [...prev, ...newTransactions]);
        }

        setHasMore(pageNum * PAGE_SIZE < total);
        setPage(pageNum);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions(1, true);
  }, [fetchTransactions]);

  const onLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      fetchTransactions(page + 1);
    }
  }, [loadingMore, hasMore, loading, page, fetchTransactions]);

  const filteredTransactions = transactions.filter(txn => {
    if (activeFilter === 'all') return true;
    return txn.type === activeFilter;
  });

  const getTypeColor = (type: string) =>
    type === 'credit' ? COLORS.success : COLORS.error;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return {text: 'Success', bg: '#D1FAE5', color: '#065F46'};
      case 'pending':
        return {text: 'Pending', bg: '#FEF3C7', color: '#92400E'};
      case 'failed':
        return {text: 'Failed', bg: '#FEE2E2', color: '#991B1B'};
      default:
        return {text: 'Unknown', bg: COLORS.gray100, color: COLORS.gray500};
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTransaction = ({item}: {item: Transaction}) => {
    const statusBadge = getStatusBadge(item.status);
    const typeColor = getTypeColor(item.type);

    return (
      <View style={styles.transactionRow}>
        <View style={[styles.iconDot, {backgroundColor: typeColor + '12'}]}>
          <CustomIcon
            name={item.type === 'credit' ? 'arrow-down' : 'arrow-up'}
            size={16}
            color={typeColor}
          />
        </View>

        <View style={styles.transactionContent}>
          <Text style={styles.transactionDesc} numberOfLines={1}>
            {item.description || 'Transaction'}
          </Text>
          <View style={styles.transactionMeta}>
            <Text style={styles.transactionDate}>
              {formatDate(item.createdAt)}
            </Text>
            <View style={[styles.statusDot, {backgroundColor: statusBadge.color}]} />
            <Text style={[styles.statusLabel, {color: statusBadge.color}]}>
              {statusBadge.text}
            </Text>
          </View>
        </View>

        <Text style={[styles.transactionAmount, {color: typeColor}]}>
          {item.type === 'credit' ? '+' : '-'}{item.amount}
        </Text>
      </View>
    );
  };

  const filters: {key: FilterType; label: string}[] = [
    {key: 'all', label: 'All'},
    {key: 'credit', label: 'Credit'},
    {key: 'debit', label: 'Debit'},
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Transaction History"
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.filterRow}>
        {filters.map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              activeFilter === filter.key
                ? styles.filterChipActive
                : styles.filterChipInactive,
            ]}
            onPress={() => setActiveFilter(filter.key)}>
            <Text
              style={[
                styles.filterLabel,
                activeFilter === filter.key
                  ? styles.filterLabelActive
                  : styles.filterLabelInactive,
              ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
          onEndReached={onLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <CustomIcon
                name="receipt-outline"
                size={48}
                color={COLORS.gray300}
              />
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySubText}>
                {activeFilter !== 'all'
                  ? `No ${activeFilter} transactions found`
                  : 'Your transaction history will appear here'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    backgroundColor: COLORS.white,
  },
  filterChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: BORDER_RADIUS.full,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipInactive: {
    backgroundColor: COLORS.gray100,
  },
  filterLabel: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONT_FAMILY.medium,
  },
  filterLabelActive: {
    color: COLORS.white,
  },
  filterLabelInactive: {
    color: COLORS.textSecondary,
  },
  list: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.md,
    flexGrow: 1,
    backgroundColor: COLORS.white,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  iconDot: {
    width: 34,
    height: 34,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm + 4,
  },
  transactionContent: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONT_FAMILY.medium,
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.textTertiary,
  },
  statusDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: SPACING.xs + 2,
  },
  statusLabel: {
    fontSize: FONT_SIZE.xs,
    fontFamily: FONT_FAMILY.regular,
  },
  transactionAmount: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONT_FAMILY.semiBold,
  },
  emptyState: {
    paddingVertical: SPACING['4xl'],
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FONT_SIZE.base,
    fontFamily: FONT_FAMILY.semiBold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubText: {
    fontSize: FONT_SIZE.sm,
    fontFamily: FONT_FAMILY.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
});

export default TransactionHistoryScreen;
