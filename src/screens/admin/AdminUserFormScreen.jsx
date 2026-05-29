import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';

import ComodoCard from '../../components/ComodoCard';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import ScreenBackground from '../../components/ScreenBackground';
import { createAdminUser, updateAdminUser } from '../../app/api/admin';
import { showAdminApiError } from '../../utils';
import theme from '../../utils/theme';

const ROLES = [
  { label: 'User', value: 'ROLE_USER' },
  { label: 'Organizer', value: 'ROLE_ORGANIZER' },
  { label: 'Admin', value: 'ROLE_ADMIN' },
];

const AdminUserFormScreen = ({ route, navigation }) => {
  const { mode, user } = route.params || {};
  const isEdit = mode === 'edit';
  const token = useSelector(state => state.auth?.data?.token);

  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user?.role || 'ROLE_USER');
  const [isActive, setIsActive] = useState(user?.isActive !== false);
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (!email.trim() || !firstName.trim() || !lastName.trim()) {
      Alert.alert('Validation', 'Email, first name, and last name are required.');
      return;
    }
    if (!isEdit && !password.trim()) {
      Alert.alert('Validation', 'Password is required for new users.');
      return;
    }

    const payload = {
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      isActive,
    };
    if (password.trim()) {
      payload.password = password.trim();
    }

    setSaving(true);
    try {
      if (isEdit) {
        await updateAdminUser(token, user.id, payload);
      } else {
        await createAdminUser(token, payload);
      }
      Alert.alert('Success', `User ${isEdit ? 'updated' : 'created'}.`);
      navigation.goBack();
    } catch (error) {
      showAdminApiError(error, 'Save failed');
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
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <CustomTextInput
              label="First name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <CustomTextInput
              label="Last name"
              value={lastName}
              onChangeText={setLastName}
            />
            <CustomTextInput
              label={isEdit ? 'Password (leave blank to keep)' : 'Password'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <CustomTextInput
              label="Role (ROLE_USER, ROLE_ORGANIZER, ROLE_ADMIN)"
              value={role}
              onChangeText={setRole}
            />
            {ROLES.map(r => (
              <CustomButton
                key={r.value}
                label={`Set role: ${r.label}`}
                variant={role === r.value ? 'primary' : 'secondary'}
                containerStyle={styles.roleBtn}
                onPress={() => setRole(r.value)}
              />
            ))}
            <CustomButton
              label={isActive ? 'Account active (tap to deactivate)' : 'Account inactive (tap to activate)'}
              variant={isActive ? 'primary' : 'danger'}
              containerStyle={styles.roleBtn}
              onPress={() => setIsActive(!isActive)}
            />
            <CustomButton
              label={saving ? 'Saving…' : isEdit ? 'Update user' : 'Create user'}
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
  scroll: { padding: theme.spacing.lg, flexGrow: 1 },
  roleBtn: { marginBottom: theme.spacing.sm },
});

export default AdminUserFormScreen;
