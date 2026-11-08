/**
 * SpeedX API Service
 * Interacts with Cloudflare Workers speed-testing endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://speedx-api.stharunindu.workers.dev';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/api/health`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function fetchPingProbe() {
  const start = performance.now();
  const res = await fetch(`${API_BASE_URL}/api/ping?t=${Date.now()}_${Math.random()}`, {
    cache: 'no-store',
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
  return `${API_BASE_URL}/api/download?size=${size}&t=${Date.now()}_${Math.random()}`;
}

export async function uploadChunk(blob) {
  const start = performance.now();
  const res = await fetch(`${API_BASE_URL}/api/upload?t=${Date.now()}_${Math.random()}`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
    body: blob,
  });
  const clientDuration = performance.now() - start;
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  const data = await res.json();
  return {
    ...data,
    clientDuration,
  };
}

export async function fetchHistory() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/history?t=${Date.now()}`, {
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
    const res = await fetch(`${API_BASE_URL}/api/history`, {
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

export { API_BASE_URL };
