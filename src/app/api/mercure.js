import EventSource from 'react-native-sse';
import { MERCURE_HUB_URL } from './config';

export function buildMercureUrl(topics = []) {
  const url = new URL(MERCURE_HUB_URL);
  for (const topic of topics) {
    url.searchParams.append('topic', topic);
  }
  return url.toString();
}

export function createMercureEventSource({ topics, mercureJwt } = {}) {
  const url = buildMercureUrl(topics);

  const headers = {
    Accept: 'text/event-stream',
    'Cache-Control': 'no-cache',
  };

  // Mercure authorization uses a *Mercure JWT* (not your API JWT).
  // If your hub is public, omit this header.
  if (mercureJwt) {
    headers.Authorization = `Bearer ${mercureJwt}`;
  }

  return new EventSource(url, {
    headers,
    timeout: 0, // keep alive
  });
}

