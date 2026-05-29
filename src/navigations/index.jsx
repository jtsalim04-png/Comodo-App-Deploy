import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { Alert, Platform, StatusBar, useColorScheme } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { authLogout } from '../app/actions';
import {
  clearUnauthorizedHandler,
  setUnauthorizedHandler,
} from '../app/api/session';
import { isTokenExpired } from '../app/api/token';
import { NotificationPanelProvider } from '../context/NotificationPanelContext';
import { isAdmin } from '../utils/roles';
import AuthNav from './AuthNav';
import UserNav from './UserNav';
import AdminNav from './AdminNav';
import NotificationHost from './NotificationHost';
import { navigationRef } from './navigationRef';

const AppNavigation = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);
  const token = auth?.data?.token;
  const isLoggedIn = !!token;
  const expiryHandled = useRef(false);

  useEffect(() => {
    setUnauthorizedHandler(message => {
      dispatch(authLogout());
      Alert.alert('Session expired', message);
    });
    return () => clearUnauthorizedHandler();
  }, [dispatch]);

  useEffect(() => {
    if (!isLoggedIn) {
      expiryHandled.current = false;
      return;
    }
    if (expiryHandled.current || !isTokenExpired(token)) {
      return;
    }
    expiryHandled.current = true;
    dispatch(authLogout());
    Alert.alert(
      'Session expired',
      'Your login session has expired. Please sign in again.',
    );
  }, [dispatch, isLoggedIn, token]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBarStyle('light-content', true);
    }
  }, [isDarkMode]);

  const renderMain = () => {
    if (isAdmin(auth.data)) {
      return <AdminNav />;
    }
    return <UserNav />;
  };

  return (
    <NavigationContainer ref={navigationRef}>
      {isLoggedIn ? (
        <NotificationPanelProvider>
          <NotificationHost enabled>
            {renderMain()}
          </NotificationHost>
        </NotificationPanelProvider>
      ) : (
        <AuthNav />
      )}
    </NavigationContainer>
  );
};

export default AppNavigation;
