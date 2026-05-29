export function formatRelativeTime(timestamp) {
  if (!timestamp) {
    return '';
  }
  const diff = Date.now() - timestamp;
  if (diff < 60_000) {
    return 'just now';
  }
  if (diff < 3_600_000) {
    const mins = Math.floor(diff / 60_000);
    return `${mins}m ago`;
  }
  if (diff < 86_400_000) {
    const hours = Math.floor(diff / 3_600_000);
    return `${hours}h ago`;
  }
  const days = Math.floor(diff / 86_400_000);
  return `${days}d ago`;
}
