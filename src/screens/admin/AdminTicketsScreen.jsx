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
import { useSelector } from 'react-redux';

import CustomButton from '../../components/CustomButton';
import TicketCard from '../../components/TicketCard';
import ScreenBackground from '../../components/ScreenBackground';
import { deleteAdminTicket, fetchAdminTickets } from '../../app/api/admin';
import useAdminLiveUpdates from '../../hooks/useAdminLiveUpdates';
import { ROUTES, showAdminApiError } from '../../utils';
import theme from '../../utils/theme';

const AdminTicketsScreen = () => {
  const navigation = useNavigation();
  const token = useSelector(state => state.auth?.data?.token);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setTickets(await fetchAdminTickets(token));
    } catch (error) {
      showAdminApiError(error, 'Could not load tickets');
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

  const onDelete = ticket => {
    Alert.alert('Delete ticket', `Remove ticket #${ticket.id}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAdminTicket(token, ticket.id);
            load();
          } catch (error) {
            showAdminApiError(error, 'Delete failed');
          }
        },
      },
    ]);
  };

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <CustomButton
          label="Create ticket"
          variant="primary"
          containerStyle={styles.createBtn}
          onPress={() => navigation.navigate(ROUTES.ADMIN_TICKET_FORM)}
        />

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
                  load();
                }}
              />
            }
            ListEmptyComponent={
              <Text style={styles.empty}>No tickets / sales yet.</Text>
            }
            renderItem={({ item }) => (
              <View>
                <TicketCard
                  ticket={item}
                  onPress={() =>
                    navigation.navigate(ROUTES.ADMIN_TICKET_DETAIL, {
                      ticketId: item.id,
                      ticket: item,
                    })
                  }
                />
                {item.holderEmail ? (
                  <Text style={styles.customer}>{item.holderEmail}</Text>
                ) : null}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => onDelete(item)}>
                  <Text style={styles.deleteText}>Delete ticket</Text>
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
  container: { flex: 1, padding: theme.spacing.lg },
  createBtn: { marginBottom: theme.spacing.md },
  empty: { textAlign: 'center', color: theme.colors.textMuted, marginTop: 24 },
  customer: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.small,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  deleteBtn: { alignSelf: 'flex-end', marginBottom: theme.spacing.md },
  deleteText: { color: theme.colors.danger, fontWeight: '600' },
});

export default AdminTicketsScreen;
