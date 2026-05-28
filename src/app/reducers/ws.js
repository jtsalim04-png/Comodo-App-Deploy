import {
  RT_CONNECTED,
  RT_DISCONNECTED,
  RT_MESSAGE,
} from '../actions';

const INITIALSTATE = {
  isConnected: false,
  lastMessage: null,
  lastMessageAt: null,
};

export default function reducer(state = INITIALSTATE, action) {
  switch (action.type) {
    case RT_CONNECTED:
      return { ...state, isConnected: true };
    case RT_DISCONNECTED:
      return { ...state, isConnected: false };
    case RT_MESSAGE:
      return {
        ...state,
        lastMessage: action.payload ?? null,
        lastMessageAt: Date.now(),
      };
    default:
      return state;
  }
}

