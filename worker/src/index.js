/**
 * NHubX SpeedX — Cloudflare Worker API
 * Provides high-precision network measurement endpoints:
 * - GET  /api/ping
 * - GET  /api/download
 * - POST /api/upload
 * - GET  /api/history
 * - POST /api/history
 * - GET  /api/health
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma',
  'Access-Control-Expose-Headers': 'Content-Length, X-Response-Time, Server-Timing',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Timing-Allow-Origin': '*',
};

// Incompressible buffer cache (64KB random buffer repeated for fast streaming)
let cachedRandomChunk = null;
function getRandomChunk() {
  if (!cachedRandomChunk) {
    const chunk = new Uint8Array(65536);
    crypto.getRandomValues(chunk);
    cachedRandomChunk = chunk;
  }
  return cachedRandomChunk;
}

// Simple IP-based rate limiting window (in-memory)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 120;

function checkRateLimit(ip) {
  if (!ip) return true;
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.resetTime > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, resetTime: now });
    // cleanup stale entries if map grows large
    if (rateLimitMap.size > 2000) {
      for (const [k, v] of rateLimitMap.entries()) {
        if (now - v.resetTime > RATE_LIMIT_WINDOW_MS) {
          rateLimitMap.delete(k);
        }
      }
    }
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  entry.count++;
  return true;
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
      ...extraHeaders,
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || '127.0.0.1';

    // If request is not for /api/*, serve frontend from Cloudflare Pages
    if (!path.startsWith('/api')) {
      const pagesUrl = new URL(request.url);
      pagesUrl.hostname = 'speedx-8fd.pages.dev';
      pagesUrl.protocol = 'https:';
      pagesUrl.port = '';
      return fetch(new Request(pagesUrl, request));
    }

    // Rate limiting check (except for ping health checks)
    if (!checkRateLimit(clientIp)) {
      return jsonResponse({ error: 'Too Many Requests', message: 'Rate limit exceeded. Please wait a minute before retesting.' }, 429);
    }

    try {
      // 1. Health check
      if (path === '/' || path === '/api/health') {
        return jsonResponse({
          status: 'healthy',
          service: 'NHubX SpeedX API',
          version: '1.0.0',
          brand: 'NHubX',
          tagline: 'One Hub. Infinite Power.',
          colo: request.cf?.colo || 'LOCAL',
          city: request.cf?.city || 'Localhost',
          country: request.cf?.country || 'XX',
          timestamp: Date.now(),
        });
      }

      // 2. Ping endpoint
      if (path === '/api/ping') {
        const clientInfo = {
          timestamp: Date.now(),
          clientIp,
          colo: request.cf?.colo || 'EDGE',
          city: request.cf?.city || 'Local',
          region: request.cf?.region || '',
          country: request.cf?.country || 'Global',
          asn: request.cf?.asn || 0,
          isp: request.cf?.asOrganization || 'Cloudflare Edge Network',
          latitude: request.cf?.latitude || null,
          longitude: request.cf?.longitude || null,
          httpProtocol: request.cf?.httpProtocol || 'HTTP/2',
          tlsVersion: request.cf?.tlsVersion || 'TLSv1.3',
        };
        return jsonResponse(clientInfo);
      }

      // 3. Download endpoint (supports R2 test files or generated incompressible stream)
      if (path === '/api/download') {
        if (request.method !== 'GET' && request.method !== 'HEAD') {
          return jsonResponse({ error: 'Method not allowed' }, 405);
        }

        const sizeParam = url.searchParams.get('size') || '';
        let targetBytes = parseInt(url.searchParams.get('bytes') || '0', 10);

        // Predefined sizing options
        if (sizeParam === '1mb') targetBytes = 1048576;
        else if (sizeParam === '5mb') targetBytes = 5242880;
        else if (sizeParam === '10mb') targetBytes = 10485760;
        else if (sizeParam === '25mb') targetBytes = 26214400;

        // Default to 10MB if not specified or clamp between 64KB and 25MB
        if (!targetBytes || targetBytes <= 0) targetBytes = 10485760;
        const MAX_DOWNLOAD_BYTES = 26214400; // 25 MB max to respect Cloudflare limits
        targetBytes = Math.min(Math.max(targetBytes, 65536), MAX_DOWNLOAD_BYTES);

        // If R2 bucket is bound and standard file matches, try R2 first
        const r2Key = sizeParam === '1mb' ? 'test-1mb.bin'
                    : sizeParam === '5mb' ? 'test-5mb.bin'
                    : sizeParam === '10mb' ? 'test-10mb.bin'
                    : null;

        if (env.BUCKET && r2Key) {
          try {
            const object = await env.BUCKET.get(r2Key);
            if (object) {
              const headers = new Headers(CORS_HEADERS);
              headers.set('Content-Type', 'application/octet-stream');
              headers.set('Content-Length', object.size.toString());
              headers.set('Content-Disposition', `attachment; filename="${r2Key}"`);
              headers.set('X-Source', 'R2-Bucket');
              return new Response(object.body, { headers });
            }
          } catch (r2Err) {
            console.error('R2 read error, falling back to stream generator:', r2Err);
          }
        }

        // Fast streaming generator of incompressible pseudo-random bytes
        const chunk = getRandomChunk();
        const chunkSize = chunk.length;
        let bytesRemaining = targetBytes;

        const stream = new ReadableStream({
          pull(controller) {
            if (bytesRemaining <= 0) {
              controller.close();
              return;
            }
            const currentChunkSize = Math.min(bytesRemaining, chunkSize);
            const toSend = currentChunkSize === chunkSize ? chunk : chunk.subarray(0, currentChunkSize);
            controller.enqueue(toSend);
            bytesRemaining -= currentChunkSize;
          },
        });

        const headers = new Headers(CORS_HEADERS);
        headers.set('Content-Type', 'application/octet-stream');
        headers.set('Content-Length', targetBytes.toString());
        headers.set('Content-Disposition', 'attachment; filename="speedtest.bin"');
        headers.set('X-Source', 'Worker-Stream');

        return new Response(stream, { headers });
      }

      // 4. Upload endpoint
      if (path === '/api/upload') {
        if (request.method !== 'POST') {
          return jsonResponse({ error: 'Method not allowed' }, 405);
        }

        if (!request.body) {
          return jsonResponse({ error: 'Empty body' }, 400);
        }

        const startTime = Date.now();
        const reader = request.body.getReader();
        let bytesReceived = 0;
        const MAX_UPLOAD_BYTES = 26214400; // 25 MB max per request

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          bytesReceived += value.length;
          if (bytesReceived > MAX_UPLOAD_BYTES) {
            await reader.cancel();
            return jsonResponse({ error: 'Payload too large', maxAllowed: MAX_UPLOAD_BYTES }, 413);
          }
        }

        const elapsedMs = Math.max(1, Date.now() - startTime);

        return jsonResponse({
          status: 'ok',
          bytesReceived,
          elapsedMs,
          colo: request.cf?.colo || 'EDGE',
          timestamp: Date.now(),
        });
      }

      // 5. History GET endpoint
      if (path === '/api/history' && request.method === 'GET') {
        if (env.DB) {
          try {
            const results = await env.DB.prepare(
              'SELECT * FROM speed_tests ORDER BY timestamp DESC LIMIT 25'
            ).all();
            return jsonResponse({ results: results.results || [] });
          } catch (dbErr) {
            console.error('D1 query error:', dbErr);
            return jsonResponse({ results: [], error: dbErr.message }, 500);
          }
        }
        return jsonResponse({ results: [] });
      }

      // 6. History POST endpoint (save test result)
      if (path === '/api/history' && request.method === 'POST') {
        try {
          const body = await request.json();
          const {
            id = crypto.randomUUID(),
            timestamp = Date.now(),
            download_speed = 0,
            upload_speed = 0,
            ping = 0,
            jitter = 0,
            server_colo = request.cf?.colo || 'EDGE',
            server_location = request.cf?.city ? `${request.cf.city}, ${request.cf.country}` : 'Cloudflare Edge',
            client_country = request.cf?.country || 'XX',
            client_city = request.cf?.city || 'Unknown',
            client_isp = request.cf?.asOrganization || 'Unknown ISP',
            user_agent = request.headers.get('user-agent') || 'Browser',
          } = body;

          if (env.DB) {
            await env.DB.prepare(`
              INSERT INTO speed_tests (
                id, timestamp, ip, client_country, client_city, client_isp,
                server_colo, server_location, download_speed, upload_speed, ping, jitter, user_agent
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              id,
              timestamp,
              clientIp,
              client_country,
              client_city,
              client_isp,
              server_colo,
              server_location,
              download_speed,
              upload_speed,
              ping,
              jitter,
              user_agent.slice(0, 200)
            ).run();
          }

          return jsonResponse({ success: true, id });
        } catch (postErr) {
          console.error('D1 insert error:', postErr);
          return jsonResponse({ error: 'Failed to record test result', details: postErr.message }, 500);
        }
      }

      // Default 404
      return jsonResponse({ error: 'Endpoint not found' }, 404);
    } catch (err) {
      console.error('Unhandled worker error:', err);
      return jsonResponse({ error: 'Internal Server Error', message: err.message }, 500);
    }
  },
};
