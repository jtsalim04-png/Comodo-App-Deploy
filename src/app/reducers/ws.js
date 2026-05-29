import {
  RT_CONNECTED,
  RT_DISCONNECTED,
  RT_MESSAGE,
} from '../actions';

const MAX_MESSAGES = 20;

const INITIALSTATE = {
  isConnected: false,
  lastMessage: null,
  lastMessageAt: null,
  messages: [],
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
        messages: [action.payload, ...state.messages].slice(0, MAX_MESSAGES),
      };
    default:
      return state;
  }
}

