import React, { useEffect } from 'react';
import { enableScreens } from 'react-native-screens';

enableScreens();

import AppNav from './src/navigations';

import rootSaga from './src/app/sagas';
import configureStore from './src/app/reducers';
import { Provider } from 'react-redux';
import { authBootstrap, rtConnect } from './src/app/actions';
import {
  ensureNotificationChannel,
  requestNotificationPermission,
} from './src/app/api/notifications';
import { configureGoogleSignIn } from './src/app/api/googleSignIn';

const { store, runSaga } = configureStore();
runSaga(rootSaga);

const App = () => {
  console.log('App rendering started');

  useEffect(() => {
    configureGoogleSignIn();
    ensureNotificationChannel();
    requestNotificationPermission();
    store.dispatch(authBootstrap());
    store.dispatch(rtConnect());
  }, []);

  return (
    <Provider store={store}>
      <AppNav />
    </Provider>
  );
};

export default App;
