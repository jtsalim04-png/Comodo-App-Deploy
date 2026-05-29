import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { publishTicketSale } from '../../app/notifications/publish';
import CustomButton from '../../components/CustomButton';
import ComodoCard from '../../components/ComodoCard';
import ScreenBackground from '../../components/ScreenBackground';
import { fetchEvent } from '../../app/api/events';
import { purchaseTicket } from '../../app/api/tickets';
import { ROUTES, showApiError } from '../../utils';
import theme from '../../utils/theme';

const UserEventDetailScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const token = auth?.data?.token;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const loadEvent = useCallback(async () => {
    try {
      const data = await fetchEvent(token, eventId);
      setEvent(data);
    } catch (error) {
      showApiError(error, 'Could not load event');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [token, eventId, navigation]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadEvent();
    }, [loadEvent]),
  );

  const organizerName = () => {
    const org = event?.organizer;
    if (!org || typeof org !== 'object') {
      return 'Unknown organizer';
    }
    const parts = [org.firstName, org.lastName].filter(Boolean);
    return parts.length ? parts.join(' ') : org.email || 'Unknown organizer';
  };

  const completePurchase = async () => {
    if (!token) {
      Alert.alert('Sign in required', 'Please sign in to purchase tickets.', [
        {
          text: 'Sign in',
          onPress: () => navigation.navigate(ROUTES.LOGIN),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
      return;
    }

    setPurchasing(true);
    try {
      const ticket = await purchaseTicket(token, event);

      await publishTicketSale(dispatch, auth?.data, {
        event,
        ticket,
        user: auth?.data?.user,
        message: `Ticket purchased for "${event?.title}".`,
      });

      Alert.alert(
        'Purchase successful',
        'Ticket purchased successfully! Your payment is marked as completed.',
        [
          {
            text: 'View ticket',
            onPress: () =>
              navigation.navigate(ROUTES.USER_TICKET_DETAIL, {
                ticketId: ticket.id,
                ticket,
              }),
          },
          {
            text: 'My tickets',
            onPress: () => navigation.navigate(ROUTES.USER_MY_TICKETS),
          },
        ],
      );
    } catch (error) {
      // Surface the error in logs so `adb logcat` / `npx react-native log-android` show it
      console.error('purchaseTicket error', error);
      showApiError(error, 'Unable to purchase ticket.');
    } finally {
      setPurchasing(false);
    }
  };

  const onPurchase = () => {
    if (!event || purchasing) {
      return;
    }

    Alert.alert(
      'Purchase ticket',
      'Purchase this ticket now? Payment will be marked as completed.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Purchase Now', onPress: completePurchase },
      ],
    );
  };

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
        <ComodoCard>
          <Text style={styles.title}>{event?.title}</Text>
          <Text style={styles.organizer}>Hosted by {organizerName()}</Text>
          {event?.description ? (
            <Text style={styles.description}>{event.description}</Text>
          ) : null}
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Date & time</Text>
            <Text style={styles.metaValue}>
              {event?.eventDate
                ? new Date(event.eventDate).toLocaleString()
                : 'TBD'}
            </Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Location</Text>
            <Text style={styles.metaValue}>{event?.location || 'TBD'}</Text>
          </View>
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>Price</Text>
            <Text style={styles.metaValue}>
              ₱{Number(event?.price || 0).toFixed(2)}
            </Text>
          </View>
          {event?.seatType ? (
            <View style={styles.metaBlock}>
              <Text style={styles.metaLabel}>Seat type</Text>
              <Text style={styles.metaValue}>{event.seatType}</Text>
            </View>
          ) : null}
          <CustomButton
            label={purchasing ? 'Purchasing…' : 'Purchase Now'}
            variant="primary"
            containerStyle={styles.bookButton}
            onPress={onPurchase}
          />
        </ComodoCard>
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  loader: { marginTop: 48 },
  scroll: {
    padding: theme.spacing.lg,
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '600',
    color: theme.colors.tuatara,
    marginBottom: theme.spacing.xs,
  },
  organizer: {
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
    fontSize: theme.fontSize.small,
  },
  description: {
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  metaBlock: {
    marginBottom: theme.spacing.sm,
  },
  metaLabel: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.small,
  },
  metaValue: {
    color: theme.colors.tuatara,
    fontWeight: '600',
    fontSize: theme.fontSize.body,
  },
  bookButton: {
    marginTop: theme.spacing.lg,
  },
});

export default UserEventDetailScreen;
