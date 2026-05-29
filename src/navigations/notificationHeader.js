import NotificationBellButton from '../components/NotificationBellButton';
import theme from '../utils/theme';

/** Stack / tab header bell (top-right). */
export const renderNotificationHeaderRight = () => <NotificationBellButton />;

export const appHeaderOptions = {
  headerStyle: { backgroundColor: theme.colors.tuatara },
  headerTintColor: theme.colors.timberwolf,
  headerTitleStyle: { fontWeight: '600', color: theme.colors.timberwolf },
  headerRight: renderNotificationHeaderRight,
};
