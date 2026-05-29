import { apiRequest } from './client';
import { API_PATHS } from './paths';

export async function fetchRealtimeConfig() {
  return apiRequest(API_PATHS.realtimeConfig);
}

export async function fetchMercureSubscriberToken(token) {
  return apiRequest(API_PATHS.realtimeMercureToken, { token });
}
