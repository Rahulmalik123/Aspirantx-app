import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import notificationService, { Notification } from '../../api/services/notificationService';
import { useFocusEffect } from '@react-navigation/native';

const TYPE_ICONS: Record<string, { name: string; color: string; bg: string }> = {
  achievement: { name: 'trophy',           color: '#F59E0B', bg: '#FEF3C7' },
  reward:      { name: 'gift',             color: '#8B5CF6', bg: '#EDE9FE' },
  reminder:    { name: 'alarm',            color: '#3B82F6', bg: '#DBEAFE' },
  alert:       { name: 'warning',          color: '#EF4444', bg: '#FEE2E2' },
  battle:      { name: 'flash',            color: '#F97316', bg: '#FFEDD5' },
  tournament:  { name: 'trophy-outline',   color: '#10B981', bg: '#D1FAE5' },
  success:     { name: 'checkmark-circle', color: '#10B981', bg: '#D1FAE5' },
  warning:     { name: 'warning-outline',  color: '#F59E0B', bg: '#FEF3C7' },
  info:        { name: 'information-circle', color: '#3B82F6', bg: '#DBEAFE' },
  system:      { name: 'megaphone',        color: '#6B7280', bg: '#F3F4F6' },
  general:     { name: 'notifications',    color: '#0040a1', bg: '#EFF6FF' },
};

function getIconConfig(type: string) {
  return TYPE_ICONS[type] ?? TYPE_ICONS.general;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const NotificationItem = ({
  item,
  onRead,
  onDelete,
}: {
  item: Notification;
  onRead: (n: Notification) => void;
  onDelete: (n: Notification) => void;
}) => {
  const icon = getIconConfig(item.type);

  return (
    <TouchableOpacity
      style={[styles.item, !item.isRead && styles.itemUnread]}
      onPress={() => onRead(item)}
      activeOpacity={0.75}
    >
      {/* Unread dot */}
      {!item.isRead && <View style={styles.unreadDot} />}

      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
        <Icon name={icon.name} size={20} color={icon.color} />
        {item.isBroadcast && (
          <View style={styles.broadcastBadge}>
            <Icon name="megaphone" size={8} color={COLORS.white} />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, !item.isRead && styles.titleUnread]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
          {item.priority === 'high' && (
            <View style={styles.highPriorityTag}>
              <Text style={styles.highPriorityText}>Important</Text>
            </View>
          )}
        </View>
      </View>

      {/* Delete (only for individual, not broadcast) */}
      {!item.isBroadcast && (
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(item)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="trash-outline" size={16} color={COLORS.gray400} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const NotificationScreen = () => {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const pageRef = useRef(1);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = useCallback(async (pageNum: number, replace: boolean) => {
    try {
      const res: any = await notificationService.getNotifications(pageNum, 20);
      const innerData = res?.data;
      const items: Notification[] = Array.isArray(innerData)
        ? innerData
        : (innerData?.data ?? []);
      if (replace) {
        setNotifications(items);
      } else {
        setNotifications(prev => [...prev, ...items]);
      }
      const pagination = Array.isArray(innerData) ? res?.pagination : innerData?.pagination;
      setHasMore(pagination?.hasMore ?? pagination?.hasNextPage ?? false);
      pageRef.current = pageNum;
    } catch {
      // silent — network error, keep existing data
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setPage(1);
    await fetchNotifications(1, true);
    setLoading(false);
  }, [fetchNotifications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchNotifications(1, true);
    setRefreshing(false);
  }, [fetchNotifications]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = pageRef.current + 1;
    setPage(next);
    await fetchNotifications(next, false);
    setLoadingMore(false);
  }, [loadingMore, hasMore, fetchNotifications]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleRead = useCallback(async (item: Notification) => {
    if (item.isRead) return;
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n._id === item._id ? { ...n, isRead: true } : n)
    );
    try {
      if (item.isBroadcast) {
        await notificationService.markBroadcastAsRead(item._id);
      } else {
        await notificationService.markAsRead(item._id);
      }
    } catch {
      // revert on failure
      setNotifications(prev =>
        prev.map(n => n._id === item._id ? { ...n, isRead: false } : n)
      );
    }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    if (unreadCount === 0) return;
    setMarkingAll(true);
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      await notificationService.markAllAsRead();
    } catch {
      // revert
      setNotifications(prev => prev.map(n => ({ ...n, isRead: false })));
    } finally {
      setMarkingAll(false);
    }
  }, [unreadCount]);

  const handleDelete = useCallback((item: Notification) => {
    Alert.alert('Delete Notification', 'Remove this notification?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setNotifications(prev => prev.filter(n => n._id !== item._id));
          try {
            await notificationService.deleteNotification(item._id);
          } catch {
            // re-insert on failure
            setNotifications(prev => [item, ...prev]);
          }
        },
      },
    ]);
  }, []);

  const renderItem = ({ item }: { item: Notification }) => (
    <NotificationItem item={item} onRead={handleRead} onDelete={handleDelete} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyWrap}>
      <Icon name="notifications-off-outline" size={64} color={COLORS.gray300} />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptySubtitle}>You're all caught up!</Text>
    </View>
  );

  const renderFooter = () =>
    loadingMore ? (
      <ActivityIndicator size="small" color={COLORS.primary} style={{ marginVertical: 16 }} />
    ) : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-back" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerText}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={handleMarkAllRead}
          disabled={unreadCount === 0 || markingAll}
          style={[styles.markAllBtn, (unreadCount === 0 || markingAll) && { opacity: 0.4 }]}
        >
          {markingAll ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.markAllText}>Mark all read</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : styles.listContent}
          showsVerticalScrollIndicator={false}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    gap: 8,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  countBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  markAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Item styles
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  itemUnread: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  unreadDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  broadcastBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  titleUnread: {
    fontWeight: '700',
  },
  message: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: COLORS.textTertiary,
  },
  highPriorityTag: {
    backgroundColor: '#FEE2E2',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  highPriorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EF4444',
  },
  deleteBtn: {
    justifyContent: 'center',
    padding: 4,
  },
  emptyWrap: {
    alignItems: 'center',
    gap: 12,
    paddingBottom: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default NotificationScreen;
