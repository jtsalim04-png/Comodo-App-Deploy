import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import EventCard from '../../components/EventCard';
import ScreenBackground from '../../components/ScreenBackground';
import { fetchEvents } from '../../app/api/events';
import useLiveUpdates from '../../hooks/useLiveUpdates';
import { ROUTES, showApiError } from '../../utils';
import theme from '../../utils/theme';

const UserEventsScreen = () => {
  const navigation = useNavigation();
  const token = useSelector(state => state.auth?.data?.token);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      setEvents(await fetchEvents(token));
    } catch (error) {
      showApiError(error, 'Could not load events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadEvents();
    }, [loadEvents]),
  );

  useLiveUpdates(() => loadEvents());

  return (
    <ScreenBackground>
      {loading ? (
        <ActivityIndicator
          style={styles.loader}
          color={theme.colors.butterscotch}
          size="large"
        />
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={events}
          keyExtractor={item => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadEvents();
              }}
            />
          }
          ListHeaderComponent={
            <Text style={styles.header}>
              Order tickets for any event. Tap an event to view details and
              purchase.
            </Text>
          }
          ListEmptyComponent={
            <Text style={styles.empty}>No events available.</Text>
          }
          renderItem={({ item }) => (
            <EventCard
              event={item}
              actionLabel="View & purchase"
              onPress={() =>
                navigation.navigate(ROUTES.USER_EVENT_DETAIL, {
                  eventId: item.id,
                })
              }
            />
          )}
        />
      )}
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  loader: { marginTop: 40 },
  list: { padding: theme.spacing.lg },
  header: {
    fontSize: theme.fontSize.heading,
    color: theme.colors.tuatara,
    marginBottom: theme.spacing.md,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: theme.colors.textMuted,
  },
});

export default UserEventsScreen;
