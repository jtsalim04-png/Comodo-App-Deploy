import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import ComodoCard from '../../components/ComodoCard';
import CustomButton from '../../components/CustomButton';
import ScreenBackground from '../../components/ScreenBackground';
import { wsSendPing } from '../../app/actions';
import { showLocalNotification } from '../../app/api/notifications';
import { WS_DEMO_ECHO_URL, WS_URL } from '../../app/api/config';
import theme from '../../utils/theme';

const RealtimeDemoScreen = () => {
  const dispatch = useDispatch();
  const ws = useSelector(state => state.ws);

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ComodoCard>
          <Text style={styles.title}>WebSocket realtime demo</Text>
          <Text style={styles.subtitle}>
            Shows live connection status, incoming messages, and local notifications
            when updates arrive.
          </Text>

          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text
              style={[
                styles.badge,
                ws.isConnected ? styles.badgeOn : styles.badgeOff,
              ]}>
              {ws.isConnected ? 'Connected' : 'Disconnected'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Backend URL</Text>
            <Text style={styles.mono}>{WS_URL}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Demo fallback</Text>
            <Text style={styles.mono}>{WS_DEMO_ECHO_URL}</Text>
          </View>

          <CustomButton
            label="Send WebSocket ping"
            variant="primary"
            containerStyle={styles.btn}
            onPress={() => dispatch(wsSendPing())}
          />

          <CustomButton
            label="Send test local notification"
            variant="secondary"
            containerStyle={styles.btn}
            onPress={() =>
              showLocalNotification({
                title: 'Comodo test',
                body: 'Local notification demo (foreground/background).',
                data: { type: 'test' },
              })
            }
          />

          <Text style={styles.section}>Recent messages</Text>
          {ws.messages.length === 0 ? (
            <Text style={styles.empty}>No messages yet.</Text>
          ) : (
            ws.messages.map((msg, index) => (
              <Text key={`${ws.lastMessageAt}-${index}`} style={styles.message}>
                {JSON.stringify(msg)}
              </Text>
            ))
          )}
        </ComodoCard>
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.fontSize.heading,
    fontWeight: '600',
    color: theme.colors.tuatara,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textMuted,
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  row: {
    marginBottom: theme.spacing.md,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.fontSize.small,
    marginBottom: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    fontWeight: '700',
    color: theme.colors.timberwolf,
  },
  badgeOn: {
    backgroundColor: '#2e7d32',
  },
  badgeOff: {
    backgroundColor: '#c62828',
  },
  mono: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: theme.colors.tuatara,
  },
  btn: {
    marginBottom: theme.spacing.sm,
  },
  section: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
    color: theme.colors.tuatara,
  },
  empty: {
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  message: {
    fontSize: 11,
    color: theme.colors.tuatara,
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});

export default RealtimeDemoScreen;
