import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import ComodoCard from '../../components/ComodoCard';
import CustomButton from '../../components/CustomButton';
import ScreenBackground from '../../components/ScreenBackground';
import { authLogout } from '../../app/actions';
import { ROUTES } from '../../utils';
import theme from '../../utils/theme';

const UserProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const user = auth?.data?.user || {};
  const roles = user.roles || [];

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <ComodoCard>
          <Text style={styles.title}>My profile</Text>
          {user.firstName || user.lastName ? (
            <View style={styles.row}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>
                {[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}
              </Text>
            </View>
          ) : null}
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{roles.join(', ') || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Verified</Text>
            <Text style={styles.value}>
              {user.verified ? 'Yes' : 'No'}
            </Text>
          </View>
          <CustomButton
            label="WebSocket & notifications demo"
            variant="primary"
            containerStyle={styles.demoBtn}
            onPress={() => navigation.navigate(ROUTES.REALTIME_DEMO)}
          />
          <CustomButton
            label="Log out"
            variant="danger"
            containerStyle={styles.logout}
            onPress={() => dispatch(authLogout())}
          />
        </ComodoCard>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.fontSize.heading,
    fontWeight: '600',
    color: theme.colors.tuatara,
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
  value: {
    color: theme.colors.tuatara,
    fontWeight: '600',
    fontSize: theme.fontSize.body,
  },
  demoBtn: {
    marginTop: theme.spacing.lg,
  },
  logout: {
    marginTop: theme.spacing.sm,
  },
});

export default UserProfileScreen;
