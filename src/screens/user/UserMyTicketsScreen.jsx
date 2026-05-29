import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import TicketCard from '../../components/TicketCard';
import ScreenBackground from '../../components/ScreenBackground';
import { fetchMyTickets } from '../../app/api/tickets';
import useLiveUpdates from '../../hooks/useLiveUpdates';
import { ROUTES, showApiError } from '../../utils';
import theme from '../../utils/theme';

const UserMyTicketsScreen = () => {
  const navigation = useNavigation();
  const token = useSelector(state => state.auth?.data?.token);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiUnavailable, setApiUnavailable] = useState(false);

  const loadTickets = useCallback(async () => {
    try {
      setApiUnavailable(false);
      const data = await fetchMyTickets(token);
      setTickets(data);
    } catch (error) {
      if (error?.isRouteNotFound) {
        setApiUnavailable(true);
        setTickets([]);
        return;
      }
      showApiError(error, 'Could not load tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadTickets();
    }, [loadTickets]),
  );

  useLiveUpdates(() => loadTickets());

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <Text style={styles.title}>My tickets</Text>
          <TouchableOpacity
            style={styles.orderMoreBtn}
            onPress={() => navigation.navigate(ROUTES.USER_EVENTS)}>
            <Text style={styles.orderMoreText}>Order more tickets</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.colors.butterscotch} size="large" />
        ) : (
          <FlatList
            data={tickets}
            keyExtractor={item => String(item.id)}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  loadTickets();
                }}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyBlock}>
                <Text style={styles.empty}>
                  {apiUnavailable
                    ? 'Tickets cannot be loaded from the app yet.'
                    : 'You have not purchased any tickets yet.'}
                </Text>
                {apiUnavailable ? (
                  <Text style={styles.hint}>
                    Make sure your Comodo website is running on port 8000 (symfony
                    server:start in ComodoWebsite), then run php bin/console
                    cache:clear and reload.
                  </Text>
                ) : null}
                <TouchableOpacity
                  style={styles.orderMoreBtnLarge}
                  onPress={() => navigation.navigate(ROUTES.USER_EVENTS)}>
                  <Text style={styles.orderMoreText}>Order tickets</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => (
              <TicketCard
                ticket={item}
                onPress={() =>
                  navigation.navigate(ROUTES.USER_TICKET_DETAIL, {
                    ticketId: item.id,
                    ticket: item,
                  })
                }
              />
            )}
          />
        )}
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  topRow: {
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '600',
    color: theme.colors.tuatara,
    marginBottom: theme.spacing.sm,
  },
  orderMoreBtn: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.butterscotch,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
  },
  orderMoreBtnLarge: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.butterscotch,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.radius.pill,
  },
  orderMoreText: {
    color: theme.colors.timberwolf,
    fontWeight: '600',
  },
  emptyBlock: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  empty: {
    textAlign: 'center',
    color: theme.colors.tuatara,
    fontSize: theme.fontSize.body,
    marginBottom: theme.spacing.sm,
  },
  hint: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.small,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
});

export default UserMyTicketsScreen;
