import EventSource from 'react-native-sse';

export function buildMercureUrl(hubUrl, topics = []) {
  const url = new URL(hubUrl);
  for (const topic of topics) {
    url.searchParams.append('topic', topic);
  }
  return url.toString();
}

export function createMercureEventSource({ hubUrl, topics, mercureJwt } = {}) {
  const url = buildMercureUrl(hubUrl, topics);

  const headers = {
    Accept: 'text/event-stream',
    'Cache-Control': 'no-cache',
  };

  if (mercureJwt) {
    headers.Authorization = `Bearer ${mercureJwt}`;
  }

  return new EventSource(url, {
    headers,
    timeout: 0,
  });
}
