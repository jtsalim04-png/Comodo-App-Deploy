import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';

import { useNotificationPanel } from '../context/NotificationPanelContext';
import theme from '../utils/theme';
import BellIcon from './BellIcon';

const NotificationBellButton = () => {
  const unreadCount = useSelector(state => state.notifications?.unreadCount ?? 0);
  const { openPanel } = useNotificationPanel();

  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <Pressable
      onPress={openPanel}
      style={({ pressed }) => [
        styles.hit,
        pressed && styles.hitPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Notifications, ${unreadCount} unread`}>
      <View style={styles.circle}>
        <BellIcon size={20} color={theme.colors.butterscotch} />
      </View>
      {unreadCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  hit: {
    marginRight: theme.spacing.md,
    position: 'relative',
  },
  hitPressed: {
    opacity: 0.85,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(219, 216, 204, 0.12)',
    borderWidth: 1.5,
    borderColor: theme.colors.butterscotch,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.colors.danger,
    borderWidth: 2,
    borderColor: theme.colors.tuatara,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: theme.colors.cream,
    fontSize: 10,
    fontWeight: '700',
  },
});

export default NotificationBellButton;
