import { useState, useEffect } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';

import ComodoCard from '../../components/ComodoCard';
import CustomButton from '../../components/CustomButton';
import CustomTextInput from '../../components/CustomTextInput';
import ScreenBackground from '../../components/ScreenBackground';
import { IMG, ROUTES } from '../../utils';
import theme from '../../utils/theme';
import { authGoogleLogin, authLogin } from '../../app/actions';
import { GOOGLE_WEB_CLIENT_ID } from '../../app/api/config';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);

  useEffect(() => {
    if (!auth.isLoading && auth.isError && auth.error) {
      Alert.alert('Login failed', auth.error);
    }
  }, [auth.isLoading, auth.isError, auth.error]);

  return (
    <ScreenBackground source={IMG.STAR_TAROT} overlayColor={theme.overlay.login}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled">
          <ComodoCard>
            <View style={styles.logoWrap}>
              <Image
                source={IMG.LOGO}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to book seats and manage your tickets.
            </Text>

            <CustomTextInput
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
            />
            <CustomTextInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <CustomButton
              label="Sign In"
              variant="primary"
              containerStyle={styles.buttonWrap}
              onPress={() => {
                if (email === '' || password === '') {
                  Alert.alert(
                    'Invalid credentials',
                    'Please enter your email and password.',
                  );
                  return;
                }

                dispatch(authLogin({ email, password }));
              }}
            />

            {GOOGLE_WEB_CLIENT_ID ? (
              <CustomButton
                label="Continue with Google"
                variant="secondary"
                containerStyle={styles.googleBtn}
                onPress={() => dispatch(authGoogleLogin())}
              />
            ) : null}

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don&apos;t have an account?</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.REGISTER)}>
                <Text style={styles.footerLink}>Register here</Text>
              </TouchableOpacity>
            </View>
          </ComodoCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logo: {
    width: 220,
    height: 72,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: '600',
    color: theme.colors.tuatara,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.small,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  buttonWrap: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  googleBtn: {
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  footerText: {
    color: theme.colors.tuatara,
    fontSize: theme.fontSize.body,
  },
  footerLink: {
    color: theme.colors.butterscotch,
    fontWeight: '700',
    fontSize: theme.fontSize.body,
  },
});

export default Login;
