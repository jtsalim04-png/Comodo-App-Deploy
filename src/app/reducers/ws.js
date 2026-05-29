import {
  RT_CONNECTED,
  RT_DISCONNECTED,
  RT_MESSAGE,
  RT_PUBLISH,
} from '../actions';

const MAX_MESSAGES = 20;

const INITIALSTATE = {
  isConnected: false,
  /** 'backend' | 'demo' | null */
  connectionMode: null,
  lastMessage: null,
  lastMessageAt: null,
  /** Increments on each RT_MESSAGE / RT_PUBLISH (for live-update hooks). */
  messageSeq: 0,
  messages: [],
};

export default function reducer(state = INITIALSTATE, action) {
  switch (action.type) {
    case RT_CONNECTED:
      return {
        ...state,
        isConnected: true,
        connectionMode: action.payload?.mode ?? 'backend',
      };
    case RT_DISCONNECTED:
      return { ...state, isConnected: false, connectionMode: null };
    case RT_MESSAGE:
    case RT_PUBLISH:
      return {
        ...state,
        lastMessage: action.payload ?? null,
        lastMessageAt: Date.now(),
        messageSeq: state.messageSeq + 1,
        messages: [action.payload, ...state.messages].slice(0, MAX_MESSAGES),
      };
    default:
      return state;
  }
}

