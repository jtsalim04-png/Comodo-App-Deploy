import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import ScreenBackground from '../../components/ScreenBackground';
import { fetchAdminActivityLogs } from '../../app/api/admin';
import useAdminLiveUpdates from '../../hooks/useAdminLiveUpdates';
import theme from '../../utils/theme';
import { showAdminApiError } from '../../utils';

const formatDate = value => {
  if (!value) return '—';
  return new Date(value).toLocaleString();
};

const AdminActivityLogsScreen = () => {
  const token = useSelector(state => state.auth?.data?.token);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const result = await fetchAdminActivityLogs(token);
      setLogs(result.logs);
    } catch (error) {
      showAdminApiError(error, 'Could not load activity logs');
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

  return (
    <ScreenBackground overlayColor="rgba(34, 34, 33, 0.55)">
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator
            color={theme.colors.butterscotch}
            size="large"
            style={styles.loader}
          />
        ) : (
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={logs}
            keyExtractor={item => String(item.id)}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  load();
                }}
              />
            }
            ListEmptyComponent={
              <Text style={styles.empty}>No activity logs found.</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.action}>{item.action}</Text>
                <Text style={styles.user}>
                  {item.username || `User #${item.userId || '—'}`}
                </Text>
                <Text style={styles.role}>
                  {String(item.role || '').replace('ROLE_', '')}
                </Text>
                <Text style={styles.target} numberOfLines={3}>
                  {item.targetData || item.description || '—'}
                </Text>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
              </View>
            )}
          />
        )}
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: theme.spacing.lg },
  list: { flex: 1 },
  listContent: { paddingBottom: theme.spacing.xl },
  loader: { marginTop: 24 },
  empty: { textAlign: 'center', color: theme.colors.textMuted, marginTop: 24 },
  card: {
    backgroundColor: theme.colors.cream,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderMuted,
  },
  action: {
    fontWeight: '700',
    color: theme.colors.butterscotch,
    marginBottom: 4,
  },
  user: { color: theme.colors.tuatara, fontWeight: '600' },
  role: { color: theme.colors.textMuted, fontSize: theme.fontSize.small },
  target: {
    color: theme.colors.tuatara,
    marginTop: theme.spacing.xs,
    fontSize: theme.fontSize.small,
  },
  date: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.small,
    marginTop: theme.spacing.xs,
  },
});

export default AdminActivityLogsScreen;
