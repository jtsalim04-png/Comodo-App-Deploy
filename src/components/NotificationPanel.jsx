import { useMemo } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import {
  notificationMarkAllRead,
  notificationMarkRead,
} from '../app/actions';
import { navigateFromNotificationItem } from '../app/notifications/navigate';
import { useNotificationPanel } from '../context/NotificationPanelContext';
import { formatRelativeTime } from '../utils/relativeTime';
import theme from '../utils/theme';
import BellIcon from './BellIcon';
const PANEL_WIDTH = Math.min(Dimensions.get('window').width * 0.88, 400);

const NotificationPanel = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const items = useSelector(state => state.notifications?.items ?? []);
  const unreadCount = useSelector(state => state.notifications?.unreadCount ?? 0);
  const {
    panelOpen,
    minimized,
    filter,
    setFilter,
    closePanel,
    minimizePanel,
    restorePanel,
  } = useNotificationPanel();

  const filtered = useMemo(() => {
    if (filter === 'unread') {
      return items.filter(item => !item.read);
    }
    return items;
  }, [filter, items]);

  const onPressItem = item => {
    if (!item.read) {
      dispatch(notificationMarkRead(item.id));
    }
    closePanel();
    navigateFromNotificationItem(item);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.cardUnread]}
      onPress={() => onPressItem(item)}
      activeOpacity={0.85}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardBody} numberOfLines={3}>
        {item.body}
      </Text>
      <Text style={styles.cardTime}>{formatRelativeTime(item.createdAt)}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      {minimized ? (
        <Pressable
          style={[styles.minimizedChip, { top: insets.top + 72 }]}
          onPress={restorePanel}
          accessibilityRole="button"
          accessibilityLabel="Open notifications">
          <View style={styles.chipIconWrap}>
            <BellIcon size={18} color={theme.colors.butterscotch} />
          </View>
          {unreadCount > 0 ? (
            <View style={styles.chipBadge}>
              <Text style={styles.chipBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      ) : null}

      <Modal
        visible={panelOpen}
        animationType="slide"
        transparent
        onRequestClose={closePanel}>
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={closePanel} />
          <View
            style={[
              styles.panel,
              {
                width: PANEL_WIDTH,
                paddingTop: insets.top + theme.spacing.sm,
                paddingBottom: insets.bottom + theme.spacing.sm,
              },
            ]}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Notifications</Text>
              <View style={styles.headerActions}>
                {unreadCount > 0 ? (
                  <Pressable onPress={() => dispatch(notificationMarkAllRead())}>
                    <Text style={styles.markAll}>Mark all read</Text>
                  </Pressable>
                ) : null}
                <Pressable onPress={minimizePanel} hitSlop={8}>
                  <Text style={styles.headerBtn}>−</Text>
                </Pressable>
                <Pressable onPress={closePanel} hitSlop={8}>
                  <Text style={styles.headerBtn}>×</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.tabs}>
              <Pressable
                onPress={() => setFilter('all')}
                style={[styles.tab, filter === 'all' && styles.tabActive]}>
                <Text
                  style={[
                    styles.tabText,
                    filter === 'all' && styles.tabTextActive,
                  ]}>
                  All
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setFilter('unread')}
                style={[styles.tab, filter === 'unread' && styles.tabActive]}>
                <Text
                  style={[
                    styles.tabText,
                    filter === 'unread' && styles.tabTextActive,
                  ]}>
                  Unread
                </Text>
              </Pressable>
            </View>

            <FlatList
              data={filtered}
              keyExtractor={item => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.empty}>You&apos;re all caught up</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(34, 34, 33, 0.45)',
  },
  panel: {
    backgroundColor: theme.colors.cream,
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.borderMuted,
    paddingHorizontal: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.fontSize.heading,
    fontWeight: '700',
    color: theme.colors.tuatara,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  markAll: {
    color: theme.colors.butterscotch,
    fontWeight: '600',
    fontSize: theme.fontSize.small,
    marginRight: theme.spacing.xs,
  },
  headerBtn: {
    fontSize: 24,
    color: theme.colors.tuatara,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
  },
  tab: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginRight: theme.spacing.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.butterscotch,
  },
  tabText: {
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  tabTextActive: {
    color: theme.colors.tuatara,
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
    flexGrow: 1,
  },
  card: {
    backgroundColor: theme.colors.timberwolf,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderMuted,
  },
  cardUnread: {
    backgroundColor: 'rgba(169, 129, 82, 0.18)',
    borderColor: theme.colors.butterscotch,
  },
  cardTitle: {
    fontWeight: '700',
    color: theme.colors.tuatara,
    marginBottom: 4,
    fontSize: theme.fontSize.body,
  },
  cardBody: {
    color: theme.colors.tuatara,
    fontSize: theme.fontSize.small,
    lineHeight: 20,
  },
  cardTime: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  empty: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xl,
    fontSize: theme.fontSize.body,
  },
  minimizedChip: {
    position: 'absolute',
    right: 0,
    zIndex: 1000,
    backgroundColor: theme.colors.tuatara,
    borderTopLeftRadius: theme.radius.lg,
    borderBottomLeftRadius: theme.radius.lg,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.butterscotch,
    borderRightWidth: 0,
  },
  chipIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(219, 216, 204, 0.15)',
    borderWidth: 1,
    borderColor: theme.colors.butterscotch,
  },
  chipBadge: {
    marginLeft: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  chipBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default NotificationPanel;
