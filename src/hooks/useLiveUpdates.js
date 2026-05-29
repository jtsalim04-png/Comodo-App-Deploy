import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import { isRefreshType } from '../app/realtime/types';

/**
 * Refetches screen data when a realtime message arrives (Mercure, WebSocket, or local publish).
 */
export default function useLiveUpdates(onRefresh, { enabled = true } = {}) {
  const lastMessage = useSelector(state => state.ws?.lastMessage);
  const messageSeq = useSelector(state => state.ws?.messageSeq);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useEffect(() => {
    if (!enabled || !messageSeq || !lastMessage) {
      return;
    }

    if (isRefreshType(lastMessage?.type)) {
      onRefreshRef.current?.();
    }
  }, [enabled, lastMessage, messageSeq]);
}
