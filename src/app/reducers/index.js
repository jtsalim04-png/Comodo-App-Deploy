import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';

import auth from './auth';
import notifications from './notifications';
import ws from './ws';

const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers({
  auth,
  notifications,
  ws,
});

export default () => {
  const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));
  const runSaga = sagaMiddleware.run;

  return { store, runSaga };
};
