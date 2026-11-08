/**
 * SpeedX Formatters and Calculations
 */

export function formatSpeed(mbps) {
  if (mbps === undefined || mbps === null || isNaN(mbps)) return '0.00';
  if (mbps < 0.1 && mbps > 0) return mbps.toFixed(2);
  if (mbps < 10) return mbps.toFixed(2);
  if (mbps < 100) return mbps.toFixed(1);
  return Math.round(mbps).toString();
}

export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function formatPing(ms) {
  if (ms === undefined || ms === null || isNaN(ms)) return '0';
  if (ms < 10) return ms.toFixed(1);
  return Math.round(ms).toString();
}

export function formatDate(timestamp) {
  if (!timestamp) return 'Just now';
  const d = new Date(timestamp);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Calculates RFC 3550 standard jitter from sequential ping latencies.
 * Jitter is the mean absolute deviation of consecutive delays:
 * sum(|RTT[i] - RTT[i-1]|) / (N - 1)
 */
export function calculateJitter(latencies) {
  if (!latencies || latencies.length < 2) return 0;
  let sumDiff = 0;
  for (let i = 1; i < latencies.length; i++) {
    sumDiff += Math.abs(latencies[i] - latencies[i - 1]);
  }
  return sumDiff / (latencies.length - 1);
}

/**
 * Returns rating evaluation based on network parameters
 */
export function evaluateQuality(download, upload, ping) {
  const d = Number(download) || 0;
  const u = Number(upload) || 0;
  const p = Number(ping) || 0;

  const gaming = p < 25 && d > 25 ? 'Elite' : p < 50 && d > 15 ? 'Great' : p < 100 ? 'Good' : 'Laggy';
  const streaming = d >= 50 ? '4K Ultra HD' : d >= 25 ? '1080p FHD' : d >= 10 ? '720p HD' : 'Standard';
  const videoCalls = p < 50 && u >= 5 && d >= 10 ? 'Flawless' : p < 100 && u >= 2 ? 'Clear' : 'Buffering';
  const downloads = d >= 200 ? 'Lightning' : d >= 50 ? 'Very Fast' : d >= 20 ? 'Moderate' : 'Slow';

  return { gaming, streaming, videoCalls, downloads };
}
