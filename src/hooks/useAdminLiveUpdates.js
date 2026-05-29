import { useEffect, useRef } from 'react';

import { ADMIN_POLL_INTERVAL_MS } from '../app/realtime/types';
import useLiveUpdates from './useLiveUpdates';

/**
 * Admin screens: Mercure/WebSocket push (useLiveUpdates) + 3s background refetch.
 * Polling runs in the hook so it works even if the realtime saga missed RT_CONNECT.
 */
export default function useAdminLiveUpdates(onRefresh, { enabled = true } = {}) {
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  useLiveUpdates(onRefresh, { enabled });

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const tick = () => onRefreshRef.current?.();
    tick();
    const id = setInterval(tick, ADMIN_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled]);
}
