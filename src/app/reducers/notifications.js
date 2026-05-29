import {
  NOTIFICATION_CLEAR,
  NOTIFICATION_INGEST,
  NOTIFICATION_MARK_ALL_READ,
  NOTIFICATION_MARK_READ,
  RESET_USER_LOGIN,
} from '../actions';
import { MAX_ITEMS } from '../notifications/ingest';

const INITIAL_STATE = {
  items: [],
  unreadCount: 0,
};

export default function notificationsReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case NOTIFICATION_INGEST: {
      const item = action.payload;
      if (!item?.id) {
        return state;
      }
      const items = [item, ...state.items].slice(0, MAX_ITEMS);
      return {
        items,
        unreadCount: state.unreadCount + 1,
      };
    }

    case NOTIFICATION_MARK_READ: {
      const id = action.payload;
      let marked = false;
      const items = state.items.map(entry => {
        if (entry.id !== id || entry.read) {
          return entry;
        }
        marked = true;
        return { ...entry, read: true };
      });
      return {
        items,
        unreadCount: marked
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    }

    case NOTIFICATION_MARK_ALL_READ:
      return {
        items: state.items.map(entry => ({ ...entry, read: true })),
        unreadCount: 0,
      };

    case NOTIFICATION_CLEAR:
    case RESET_USER_LOGIN:
      return INITIAL_STATE;

    default:
      return state;
  }
}
