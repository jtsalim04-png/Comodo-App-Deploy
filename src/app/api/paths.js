/**
 * JSON API paths on the Comodo website server (Symfony — Railway or local).
 * Events come from API Platform; tickets from ApiTicketController.
 */
export const API_PATHS = {
  entrypoint: '/api',
  login: '/api/login',
  googleAuth: '/api/auth/google',
  realtimeConfig: '/api/realtime/config',
  realtimeMercureToken: '/api/realtime/mercure-token',
  register: '/api/register',
  events: '/api/events',
  tickets: '/api/tickets',
};
