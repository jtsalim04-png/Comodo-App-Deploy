import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import CustomButton from '../../components/CustomButton';
import StatCard from '../../components/StatCard';
import { fetchAdminDashboard } from '../../app/api/admin';
import ScreenBackground from '../../components/ScreenBackground';
import useAdminLiveUpdates from '../../hooks/useAdminLiveUpdates';
import { ROUTES, classifyAdminLoadError, showAdminApiError } from '../../utils';
import theme from '../../utils/theme';

const AdminDashboardScreen = () => {
  const navigation = useNavigation();
  const token = useSelector(state => state.auth?.data?.token);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const load = useCallback(async () => {
    try {
      setApiUnavailable(false);
      setAccessDenied(false);
      const data = await fetchAdminDashboard(token);
      setDashboard(data);
    } catch (error) {
      if (
        classifyAdminLoadError(error, {
          setApiUnavailable,
          setAccessDenied,
        })
      ) {
        setDashboard(null);
        return;
      }
      showAdminApiError(error, 'Could not load dashboard');
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

  const stats = dashboard?.stats;
  const roleChart = dashboard?.roleChart;
  const topEvents = dashboard?.topEvents || [];

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
          Overview, users, events, tickets, and activity — aligned with the web
          admin panel.
        </Text>
        <CustomButton
          label="Account & log out"
          variant="secondary"
          containerStyle={styles.accountBtn}
          onPress={() => navigation.navigate(ROUTES.USER_PROFILE)}
        />

        {loading ? (
          <ActivityIndicator color={theme.colors.butterscotch} size="large" />
        ) : accessDenied ? (
          <View style={styles.hintCard}>
            <Text style={styles.hintTitle}>Admin access required</Text>
            <Text style={styles.hintBody}>
              Your account does not have ROLE_ADMIN. Sign in with an
              administrator account to view the dashboard.
            </Text>
          </View>
        ) : apiUnavailable ? (
          <View style={styles.hintCard}>
            <Text style={styles.hintTitle}>Admin API not available</Text>
            <Text style={styles.hintBody}>
              GET /api/admin/dashboard returned 404 on the server. Deploy the
              latest Comodo website with ApiAdminController, then reload. Events
              and tickets still work via /api/events and /api/tickets.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <StatCard label="Total users" value={String(stats?.totalUsers ?? 0)} />
              <StatCard
                label="Total events"
                value={String(stats?.totalEvents ?? 0)}
                variant="dark"
              />
              <StatCard
                label="Total tickets"
                value={String(stats?.totalTickets ?? 0)}
              />
              <StatCard
                label="Total revenue"
                value={`₱${Number(stats?.totalRevenue ?? 0).toFixed(2)}`}
                variant="dark"
              />
            </View>

            {roleChart?.labels?.length ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>User roles</Text>
                {roleChart.labels.map((label, index) => (
                  <View key={label} style={styles.roleRow}>
                    <Text style={styles.roleLabel}>{label}</Text>
                    <Text style={styles.roleValue}>
                      {roleChart.data?.[index] ?? 0}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top events by revenue</Text>
              {topEvents.length === 0 ? (
                <Text style={styles.muted}>No ticket sales yet.</Text>
              ) : (
                topEvents.map(event => (
                  <View key={event.eventId} style={styles.eventRow}>
                    <Text style={styles.eventTitle} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text style={styles.eventMeta}>
                      ₱{Number(event.revenue).toFixed(2)} · {event.tickets}{' '}
                      ticket{event.tickets === 1 ? '' : 's'}
                    </Text>
                  </View>
                ))
              )}
            </View>

            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => navigation.navigate(ROUTES.ADMIN_USERS)}>
              <Text style={styles.linkText}>Manage users →</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.linkRow}
              onPress={() => navigation.navigate(ROUTES.ADMIN_TICKETS)}>
              <Text style={styles.linkText}>Tickets / sales →</Text>
            </TouchableOpacity>
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
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  accountBtn: {
    marginBottom: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  section: {
    backgroundColor: theme.colors.cream,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderMuted,
  },
  sectionTitle: {
    fontSize: theme.fontSize.heading,
    fontWeight: '600',
    color: theme.colors.tuatara,
    marginBottom: theme.spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
  },
  roleLabel: {
    color: theme.colors.tuatara,
    fontWeight: '500',
  },
  roleValue: {
    color: theme.colors.butterscotch,
    fontWeight: '700',
  },
  eventRow: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderMuted,
  },
  eventTitle: {
    fontWeight: '600',
    color: theme.colors.tuatara,
    marginBottom: 2,
  },
  eventMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.small,
  },
  muted: {
    color: theme.colors.textMuted,
  },
  linkRow: {
    paddingVertical: theme.spacing.sm,
  },
  linkText: {
    color: theme.colors.butterscotch,
    fontWeight: '600',
    fontSize: theme.fontSize.body,
  },
  hintCard: {
    backgroundColor: theme.colors.cream,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.butterscotch,
  },
  hintTitle: {
    fontWeight: '600',
    fontSize: theme.fontSize.heading,
    color: theme.colors.tuatara,
    marginBottom: theme.spacing.sm,
  },
  hintBody: {
    color: theme.colors.textMuted,
    lineHeight: 22,
  },
});

export default AdminDashboardScreen;
