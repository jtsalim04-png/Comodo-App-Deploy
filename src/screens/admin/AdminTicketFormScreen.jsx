import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import { publishTicketSale } from '../../app/notifications/publish';

import ComodoCard from '../../components/ComodoCard';
import CustomButton from '../../components/CustomButton';
import ScreenBackground from '../../components/ScreenBackground';
import { createAdminTicket } from '../../app/api/admin';
import { fetchAdminUsers } from '../../app/api/admin';
import { fetchEvents } from '../../app/api/events';
import { showAdminApiError } from '../../utils';
import theme from '../../utils/theme';

const AdminTicketFormScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const authData = useSelector(state => state.auth?.data);
  const token = authData?.token;
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [eventId, setEventId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [saving, setSaving] = useState(false);

  const loadOptions = useCallback(async () => {
    try {
      const [eventList, userList] = await Promise.all([
        fetchEvents(token),
        fetchAdminUsers(token),
      ]);
      setEvents(eventList);
      setUsers(userList.filter(u => u.role === 'ROLE_USER' || !u.role));
    } catch (error) {
      showAdminApiError(error, 'Could not load events or users');
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      loadOptions();
    }, [loadOptions]),
  );

  const onSave = async () => {
    const eid = Number(eventId);
    const cid = Number(customerId);
    if (!Number.isFinite(eid) || !Number.isFinite(cid)) {
      Alert.alert('Validation', 'Select an event and customer.');
      return;
    }

    setSaving(true);
    try {
      const ticket = await createAdminTicket(token, {
        eventId: eid,
        customerId: cid,
        status: 'confirmed',
      });
      const event = events.find(e => String(e.id) === String(eid));
      const customer = users.find(u => String(u.id) === String(cid));
      await publishTicketSale(dispatch, authData, {
        event,
        ticket,
        customer,
      });
      Alert.alert('Success', 'Ticket created.');
      navigation.goBack();
    } catch (error) {
      showAdminApiError(error, 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenBackground>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ComodoCard>
            <Text style={styles.label}>Event</Text>
            {events.map(event => (
              <TouchableOpacity
                key={event.id}
                style={[
                  styles.option,
                  String(eventId) === String(event.id) && styles.optionSelected,
                ]}
                onPress={() => setEventId(String(event.id))}>
                <Text style={styles.optionText}>{event.title}</Text>
              </TouchableOpacity>
            ))}

            <Text style={[styles.label, styles.spaced]}>Customer</Text>
            {users.map(user => (
              <TouchableOpacity
                key={user.id}
                style={[
                  styles.option,
                  String(customerId) === String(user.id) && styles.optionSelected,
                ]}
                onPress={() => setCustomerId(String(user.id))}>
                <Text style={styles.optionText}>
                  {user.firstName} {user.lastName} ({user.email})
                </Text>
              </TouchableOpacity>
            ))}

            <CustomButton
              label={saving ? 'Creating…' : 'Create ticket'}
              variant="primary"
              containerStyle={styles.saveBtn}
              onPress={onSave}
            />
          </ComodoCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: theme.spacing.lg, flexGrow: 1 },
  label: {
    fontWeight: '600',
    color: theme.colors.tuatara,
    marginBottom: theme.spacing.sm,
  },
  spaced: { marginTop: theme.spacing.md },
  option: {
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderMuted,
    marginBottom: theme.spacing.xs,
  },
  optionSelected: {
    borderColor: theme.colors.butterscotch,
    backgroundColor: 'rgba(246, 169, 12, 0.15)',
  },
  optionText: { color: theme.colors.tuatara },
  saveBtn: { marginTop: theme.spacing.lg },
});

export default AdminTicketFormScreen;
