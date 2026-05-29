import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { rtPublish } from '../../app/actions';
import { deleteEvent, fetchEvents } from '../../app/api/events';
import { RT } from '../../app/realtime/types';
import EventCard from '../../components/EventCard';
import CustomButton from '../../components/CustomButton';
import ScreenBackground from '../../components/ScreenBackground';
import useAdminLiveUpdates from '../../hooks/useAdminLiveUpdates';
import { ROUTES, showApiError } from '../../utils';
import theme from '../../utils/theme';

const AdminEventsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth?.data?.token);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
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
      load();
    }, [load]),
  );

  useAdminLiveUpdates(() => load());

  const onDelete = event => {
    Alert.alert('Delete event', `Remove "${event.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEvent(token, event.id);
            dispatch(
              rtPublish({
                type: RT.EVENT_DELETED,
                eventTitle: event.title,
                eventId: event.id,
              }),
            );
            load();
          } catch (error) {
            showApiError(error, 'Delete failed');
          }
        },
      },
    ]);
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <CustomButton
          label="Create event"
          variant="primary"
          containerStyle={styles.createBtn}
          onPress={() =>
            navigation.navigate(ROUTES.ADMIN_EVENT_FORM, { mode: 'create' })
          }
        />

        {loading ? (
          <ActivityIndicator color={theme.colors.butterscotch} size="large" />
        ) : (
          <FlatList
            data={events}
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
              <Text style={styles.empty}>No events yet.</Text>
            }
            renderItem={({ item }) => (
              <View>
                <EventCard
                  event={item}
                  actionLabel="Edit"
                  onPress={() =>
                    navigation.navigate(ROUTES.ADMIN_EVENT_FORM, {
                      mode: 'edit',
                      event: item,
                    })
                  }
                />
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => onDelete(item)}>
                  <Text style={styles.deleteText}>Delete event</Text>
                </TouchableOpacity>
              </View>
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
  createBtn: {
    marginBottom: theme.spacing.md,
  },
  empty: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    marginTop: theme.spacing.lg,
  },
  deleteBtn: {
    alignSelf: 'flex-end',
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  deleteText: {
    color: theme.colors.danger,
    fontWeight: '600',
  },
});

export default AdminEventsScreen;
