import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { rtPublish } from '../../app/actions';
import { RT } from '../../app/realtime/types';
import ComodoCard from '../../components/ComodoCard';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import ScreenBackground from '../../components/ScreenBackground';
import { createEvent, updateEvent } from '../../app/api/events';
import { showApiError } from '../../utils';
import theme from '../../utils/theme';

const toApiDate = value => {
  if (!value) {
    return new Date().toISOString();
  }
  const parsed = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  return parsed.toISOString();
};

const AdminEventFormScreen = ({ route, navigation }) => {
  const { mode, event } = route.params || {};
  const isEdit = mode === 'edit';
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth?.data?.token);

  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [location, setLocation] = useState(event?.location || '');
  const [price, setPrice] = useState(String(event?.price ?? ''));
  const [seatType, setSeatType] = useState(event?.seatType || '');
  const [eventDate, setEventDate] = useState(
    event?.eventDate
      ? new Date(event.eventDate).toISOString().slice(0, 16).replace('T', ' ')
      : '',
  );
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Title is required.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      price: Number(price) || 0,
      seatType: seatType.trim() || null,
      eventDate: toApiDate(eventDate),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await updateEvent(token, event.id, payload);
        dispatch(
          rtPublish({
            type: RT.EVENT_UPDATED,
            eventTitle: payload.title,
            eventId: event.id,
          }),
        );
      } else {
        const created = await createEvent(token, payload);
        dispatch(
          rtPublish({
            type: RT.EVENT_CREATED,
            eventTitle: payload.title,
            eventId: created?.id,
          }),
        );
      }
      Alert.alert('Success', `Event ${isEdit ? 'updated' : 'created'}.`);
      navigation.goBack();
    } catch (error) {
      showApiError(error, 'Save failed');
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
            <CustomTextInput
              label="Title"
              placeholder="Event title"
              value={title}
              onChangeText={setTitle}
            />
            <CustomTextInput
              label="Description"
              placeholder="Event description"
              value={description}
              onChangeText={setDescription}
            />
            <CustomTextInput
              label="Location"
              placeholder="Venue or location"
              value={location}
              onChangeText={setLocation}
            />
            <CustomTextInput
              label="Price (PHP)"
              placeholder="0.00"
              value={price}
              onChangeText={setPrice}
            />
            <CustomTextInput
              label="Seat type"
              placeholder="e.g. VIP, General"
              value={seatType}
              onChangeText={setSeatType}
            />
            <CustomTextInput
              label="Date & time"
              placeholder="YYYY-MM-DD HH:mm"
              value={eventDate}
              onChangeText={setEventDate}
            />
            <CustomButton
              label={saving ? 'Saving…' : isEdit ? 'Update event' : 'Create event'}
              variant="primary"
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
  scroll: {
    padding: theme.spacing.lg,
    flexGrow: 1,
  },
});

export default AdminEventFormScreen;
