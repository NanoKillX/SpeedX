/**
 * SpeedX API Service
 * Interacts with Cloudflare Workers speed-testing endpoints
 */

export function getApiBaseUrl() {
  if (typeof window !== 'undefined') {
    // If running on speedx.nhubx.com or localhost proxy, use relative path for 0-CORS overhead
    const host = window.location.hostname;
    if (host === 'speedx.nhubx.com' || host === 'localhost' || host === '127.0.0.1') {
      return '';
    }
  }
  return import.meta.env.VITE_API_BASE_URL || 'https://api-speedx.nhubx.com';
}

export const API_BASE_URL = getApiBaseUrl();

export async function fetchHealth() {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/health`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function fetchPingProbe(signal) {
  const base = getApiBaseUrl();
  const start = performance.now();
  const res = await fetch(`${base}/api/ping?t=${Date.now()}_${Math.random()}`, {
    cache: 'no-store',
    signal,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
  const duration = performance.now() - start;
  if (!res.ok) throw new Error(`Ping failed: ${res.status}`);
  const data = await res.json();
  return {
    ...data,
    duration,
  };
}

export function getDownloadUrl(size = '10mb') {
  const base = getApiBaseUrl();
  return `${base}/api/download?size=${size}&t=${Date.now()}_${Math.random()}`;
}

export async function uploadChunk(payload, signal) {
  const base = getApiBaseUrl();
  const start = performance.now();
  const body = payload instanceof Blob ? payload : new Blob([payload], { type: 'application/octet-stream' });

  const res = await fetch(`${base}/api/upload?t=${Date.now()}_${Math.random()}`, {
    method: 'POST',
    cache: 'no-store',
    signal,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
    body,
  });

  const clientDuration = performance.now() - start;
  if (!res.ok) throw new Error(`Upload failed with status: ${res.status}`);
  const data = await res.json();
  return {
    ...data,
    clientDuration,
  };
}

export async function fetchHistory() {
  try {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/api/history?t=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`History fetch failed: ${res.status}`);
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.warn('Backend history unavailable, falling back to local storage:', err);
    return [];
  }
}

export async function saveTestResult(result) {
  try {
    const base = getApiBaseUrl();
    const res = await fetch(`${base}/api/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    });
    if (!res.ok) throw new Error(`Save history failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Failed to save to remote D1, saving locally:', err);
    return { success: false };
  }
}
