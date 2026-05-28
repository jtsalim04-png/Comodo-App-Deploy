import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';

import auth from './auth';
import ws from './ws';

const sagaMiddleware = createSagaMiddleware();

const rootReducer = combineReducers({
  auth,
  ws,
});

export default () => {
  const store = createStore(rootReducer, applyMiddleware(sagaMiddleware));
  const runSaga = sagaMiddleware.run;

  return { store, runSaga };
};
