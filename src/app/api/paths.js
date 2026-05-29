/**
 * JSON API paths on the running Comodo website server (Symfony on port 8000).
 * Events come from API Platform; tickets from ApiTicketController.
 */
export const API_PATHS = {
  entrypoint: '/api',
  login: '/api/login',
  googleAuth: '/api/auth/google',
  register: '/api/register',
  events: '/api/events',
  tickets: '/api/tickets',
};
