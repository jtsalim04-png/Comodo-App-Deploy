import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import TicketPass from '../../components/TicketPass';
import ScreenBackground from '../../components/ScreenBackground';
import { fetchAdminTicket } from '../../app/api/admin';
import { showAdminApiError } from '../../utils';
import theme from '../../utils/theme';

const AdminTicketDetailScreen = ({ route, navigation }) => {
  const { ticketId, ticket: initialTicket } = route.params || {};
  const token = useSelector(state => state.auth?.data?.token);
  const [ticket, setTicket] = useState(initialTicket || null);
  const [loading, setLoading] = useState(!initialTicket);

  const load = useCallback(async () => {
    if (initialTicket) {
      setTicket(initialTicket);
      setLoading(false);
      return;
    }
    try {
      setTicket(await fetchAdminTicket(token, ticketId));
    } catch (error) {
      showAdminApiError(error, 'Could not load ticket');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [token, ticketId, initialTicket, navigation]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loading) {
    return (
      <ScreenBackground>
        <ActivityIndicator
          style={styles.loader}
          color={theme.colors.butterscotch}
          size="large"
        />
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.adminNote}>Admin view — ticket #{ticket?.id}</Text>
        {ticket?.holderEmail ? (
          <Text style={styles.holder}>Customer: {ticket.holderEmail}</Text>
        ) : null}
        <TicketPass ticket={ticket} />
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  loader: { marginTop: 48 },
  scroll: { padding: theme.spacing.lg },
  adminNote: {
    fontWeight: '600',
    color: theme.colors.butterscotch,
    marginBottom: theme.spacing.xs,
  },
  holder: {
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
});

export default AdminTicketDetailScreen;
