import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import CustomButton from '../../components/CustomButton';
import StatCard from '../../components/StatCard';
import { authLogout } from '../../app/actions';
import ScreenBackground from '../../components/ScreenBackground';
import { fetchEvents } from '../../app/api/events';
import useAdminLiveUpdates from '../../hooks/useAdminLiveUpdates';
import { ROUTES, showApiError } from '../../utils';
import theme from '../../utils/theme';

const AdminDashboardScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth?.data?.token);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchEvents(token);
      setEvents(data);
    } catch (error) {
      showApiError(error, 'Could not load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load]),
  );

  useAdminLiveUpdates(() => load());

  const stats = useMemo(() => {
    const revenue = events.reduce(
      (sum, event) => sum + Number(event.price || 0),
      0,
    );
    return {
      totalEvents: events.length,
      revenue: revenue.toFixed(2),
    };
  }, [events]);

  return (
    <ScreenBackground overlayColor="rgba(219, 216, 204, 0.72)">
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
          />
        }>
        <Text style={styles.title}>Admin dashboard</Text>
        <Text style={styles.subtitle}>
          Live updates when customers purchase tickets on the website (no refresh needed).
        </Text>
        <CustomButton
          label="Log out"
          variant="danger"
          containerStyle={styles.logout}
          onPress={() => dispatch(authLogout())}
        />

        {loading ? (
          <ActivityIndicator color={theme.colors.butterscotch} size="large" />
        ) : (
          <>
            <View style={styles.statsRow}>
              <StatCard label="Total events" value={String(stats.totalEvents)} />
              <StatCard
                label="Est. revenue"
                value={`₱${stats.revenue}`}
                variant="dark"
              />
            </View>

            <View style={styles.menu}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate(ROUTES.ADMIN_EVENTS)}>
                <Text style={styles.menuTitle}>Manage events</Text>
                <Text style={styles.menuDesc}>Create, edit, and remove events</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate(ROUTES.ADMIN_USERS)}>
                <Text style={styles.menuTitle}>Users</Text>
                <Text style={styles.menuDesc}>User management overview</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '600',
    color: theme.colors.tuatara,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  logout: {
    marginBottom: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  menu: {
    gap: theme.spacing.md,
  },
  menuItem: {
    backgroundColor: theme.colors.cream,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.butterscotch,
  },
  menuTitle: {
    fontSize: theme.fontSize.heading,
    fontWeight: '600',
    color: theme.colors.butterscotch,
    marginBottom: theme.spacing.xs,
  },
  menuDesc: {
    color: theme.colors.tuatara,
    fontSize: theme.fontSize.small,
  },
});

export default AdminDashboardScreen;
