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
import ScreenBackground from '../../components/ScreenBackground';
import {
  deleteAdminUser,
  fetchAdminUsers,
  resetAdminUserPassword,
  toggleAdminUserStatus,
} from '../../app/api/admin';
import useAdminLiveUpdates from '../../hooks/useAdminLiveUpdates';
import { ROUTES, showAdminApiError } from '../../utils';
import theme from '../../utils/theme';

const formatRole = role => {
  const r = String(role || '');
  if (r === 'ROLE_ADMIN') return 'Admin';
  if (r === 'ROLE_ORGANIZER') return 'Organizer';
  if (r === 'ROLE_USER') return 'User';
  return r.replace('ROLE_', '');
};

const AdminUsersScreen = () => {
  const navigation = useNavigation();
  const token = useSelector(state => state.auth?.data?.token);
  const currentUserId = useSelector(state => state.auth?.data?.user?.id);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setUsers(await fetchAdminUsers(token));
    } catch (error) {
      showAdminApiError(error, 'Could not load users');
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

  const onToggleStatus = user => {
    Alert.alert(
      user.isActive ? 'Deactivate user' : 'Activate user',
      `${user.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await toggleAdminUserStatus(token, user.id);
              load();
            } catch (error) {
              showAdminApiError(error, 'Could not update status');
            }
          },
        },
      ],
    );
  };

  const onResetPassword = user => {
    Alert.alert('Reset password', `Reset password for ${user.email}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        onPress: async () => {
          try {
            const result = await resetAdminUserPassword(token, user.id);
            Alert.alert(
              'Password reset',
              `Temporary password: ${result.temporaryPassword}`,
            );
          } catch (error) {
            showAdminApiError(error, 'Reset failed');
          }
        },
      },
    ]);
  };

  const onDelete = user => {
    Alert.alert('Delete user', `Remove ${user.email}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAdminUser(token, user.id);
            load();
          } catch (error) {
            showAdminApiError(error, 'Delete failed');
          }
        },
      },
    ]);
  };

  return (
    <ScreenBackground overlayColor="rgba(34, 34, 33, 0.55)">
      <View style={styles.container}>
        <CustomButton
          label="Create user"
          variant="primary"
          containerStyle={styles.createBtn}
          onPress={() =>
            navigation.navigate(ROUTES.ADMIN_USER_FORM, { mode: 'create' })
          }
        />

        {loading ? (
          <ActivityIndicator color={theme.colors.butterscotch} size="large" />
        ) : (
          <FlatList
            data={users}
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
              <Text style={styles.empty}>No users found.</Text>
            }
            renderItem={({ item }) => {
              const isSelf = item.id === currentUserId;
              return (
                <View style={styles.card}>
                  <Text style={styles.name}>
                    {item.firstName} {item.lastName}
                  </Text>
                  <Text style={styles.email}>{item.email}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.badge}>{formatRole(item.role)}</Text>
                    <Text
                      style={[
                        styles.status,
                        item.isActive ? styles.active : styles.inactive,
                      ]}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate(ROUTES.ADMIN_USER_FORM, {
                          mode: 'edit',
                          user: item,
                        })
                      }>
                      <Text style={styles.action}>Edit</Text>
                    </TouchableOpacity>
                    {!isSelf ? (
                      <>
                        <TouchableOpacity onPress={() => onToggleStatus(item)}>
                          <Text style={styles.action}>
                            {item.isActive ? 'Deactivate' : 'Activate'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onResetPassword(item)}>
                          <Text style={styles.action}>Reset pwd</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => onDelete(item)}>
                          <Text style={styles.danger}>Delete</Text>
                        </TouchableOpacity>
                      </>
                    ) : null}
                  </View>
                </View>
              );
            }}
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
  card: {
    backgroundColor: theme.colors.cream,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderMuted,
  },
  name: {
    fontSize: theme.fontSize.heading,
    fontWeight: '600',
    color: theme.colors.tuatara,
  },
  email: {
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  badge: {
    backgroundColor: theme.colors.butterscotch,
    color: theme.colors.timberwolf,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    fontSize: theme.fontSize.small,
    fontWeight: '600',
    overflow: 'hidden',
  },
  status: { fontWeight: '600', alignSelf: 'center' },
  active: { color: '#2e7d32' },
  inactive: { color: theme.colors.danger },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  action: { color: theme.colors.butterscotch, fontWeight: '600' },
  danger: { color: theme.colors.danger, fontWeight: '600' },
});

export default AdminUsersScreen;
