/** Admin background refresh interval when polling (ms). */
export const ADMIN_POLL_INTERVAL_MS = 3000;

/** Realtime message types (WebSocket + Mercure SSE). */
export const RT = {
  TICKET_PURCHASED: 'ticket.purchased',
  EVENT_CREATED: 'event.created',
  EVENT_UPDATED: 'event.updated',
  EVENT_DELETED: 'event.deleted',
  ADMIN_POLL: 'admin.poll',
  WS_INFO: 'ws.info',
  WS_ECHO: 'ws.echo',
};

/** Types that should trigger a data refetch on subscribed screens. */
export const REFRESH_TYPES = [
  RT.TICKET_PURCHASED,
  RT.EVENT_CREATED,
  RT.EVENT_UPDATED,
  RT.EVENT_DELETED,
  RT.ADMIN_POLL,
];

export function isRefreshType(type) {
  return REFRESH_TYPES.includes(type);
}

export function isBusinessType(type) {
  return (
    type === RT.TICKET_PURCHASED ||
    type === RT.EVENT_CREATED ||
    type === RT.EVENT_UPDATED ||
    type === RT.EVENT_DELETED
  );
}
