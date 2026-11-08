/**
 * NHubX SpeedX — Real Network Speed Testing Engine
 * High-precision, zero-simulation bandwidth and latency analyzer.
 */

import { fetchPingProbe, getDownloadUrl, uploadChunk, saveTestResult } from './api';
import { calculateJitter } from '../utils/formatters';

// Generate reusable high-entropy incompressible byte buffer for upload tests
// Web Cryptography API specifies a maximum of 65,536 bytes (64 KB) per getRandomValues call.
let uploadPayloadBuffer = null;

function getUploadPayload(sizeInBytes = 1048576) {
  if (!uploadPayloadBuffer || uploadPayloadBuffer.byteLength !== sizeInBytes) {
    const buffer = new Uint8Array(sizeInBytes);
    const MAX_CHUNK = 65536; // 64 KB hard limit for crypto.getRandomValues

    // Fill buffer in safe 64KB chunks to prevent QuotaExceededError in all browsers
    for (let offset = 0; offset < sizeInBytes; offset += MAX_CHUNK) {
      const chunkSize = Math.min(MAX_CHUNK, sizeInBytes - offset);
      const sub = new Uint8Array(buffer.buffer, offset, chunkSize);
      crypto.getRandomValues(sub);
      // XOR with offset to prevent any compression dictionary repetition
      sub[0] = (sub[0] ^ (offset & 0xff)) & 0xff;
      sub[1] = (sub[1] ^ ((offset >> 8) & 0xff)) & 0xff;
    }

    uploadPayloadBuffer = buffer;
  }
  return uploadPayloadBuffer;
}

export class SpeedTestRunner {
  constructor(options = {}) {
    this.onProgress = options.onProgress || (() => {});
    this.onStatusChange = options.onStatusChange || (() => {});
    this.onError = options.onError || (() => {});
    this.onComplete = options.onComplete || (() => {});

    this.abortController = new AbortController();
    this.isAborted = false;
  }

  abort() {
    this.isAborted = true;
    this.abortController.abort();
    this.onStatusChange('aborted');
  }

  async run() {
    this.isAborted = false;
    this.abortController = new AbortController();

    const results = {
      ping: 0,
      minPing: 0,
      jitter: 0,
      downloadSpeed: 0,
      downloadPeak: 0,
      downloadBytes: 0,
      uploadSpeed: 0,
      uploadPeak: 0,
      uploadBytes: 0,
      clientIp: '',
      clientCity: '',
      clientCountry: '',
      clientIsp: '',
      serverColo: 'EDGE',
      serverLocation: 'Cloudflare Edge',
      timestamp: Date.now(),
      graphData: [],
    };

    try {
      // PHASE 1: LATENCY & JITTER
      this.onStatusChange('ping');
      const pingResults = await this.measurePingAndJitter();
      if (this.isAborted) return null;

      results.ping = pingResults.avgPing;
      results.minPing = pingResults.minPing;
      results.jitter = pingResults.jitter;
      results.clientIp = pingResults.clientIp;
      results.clientCity = pingResults.city;
      results.clientCountry = pingResults.country;
      results.clientIsp = pingResults.isp;
      results.serverColo = pingResults.colo;
      results.serverLocation = pingResults.city && pingResults.country 
        ? `${pingResults.city}, ${pingResults.country} (${pingResults.colo})`
        : `Edge PoP ${pingResults.colo}`;

      this.onProgress({
        phase: 'ping',
        ping: results.ping,
        jitter: results.jitter,
        minPing: results.minPing,
        serverInfo: {
          colo: results.serverColo,
          location: results.serverLocation,
          ip: results.clientIp,
          isp: results.clientIsp,
        },
      });

      // Small pause between phases for UI smoothness
      await this.sleep(300);
      if (this.isAborted) return null;

      // PHASE 2: DOWNLOAD SPEED
      this.onStatusChange('download');
      const downloadResults = await this.measureDownload(results.graphData);
      if (this.isAborted) return null;

      results.downloadSpeed = downloadResults.avgSpeed;
      results.downloadPeak = downloadResults.peakSpeed;
      results.downloadBytes = downloadResults.totalBytes;

      await this.sleep(400);
      if (this.isAborted) return null;

      // PHASE 3: UPLOAD SPEED
      this.onStatusChange('upload');
      const uploadResults = await this.measureUpload(results.graphData);
      if (this.isAborted) return null;

      results.uploadSpeed = uploadResults.avgSpeed;
      results.uploadPeak = uploadResults.peakSpeed;
      results.uploadBytes = uploadResults.totalBytes;

      // PHASE 4: COMPLETED
      this.onStatusChange('completed');
      
      // Save result remotely to D1 & locally
      saveTestResult({
        download_speed: results.downloadSpeed,
        upload_speed: results.uploadSpeed,
        ping: results.ping,
        jitter: results.jitter,
        server_colo: results.serverColo,
        server_location: results.serverLocation,
        client_country: results.clientCountry,
        client_city: results.clientCity,
        client_isp: results.clientIsp,
      }).catch(err => console.warn('Could not persist to D1:', err));

      this.onComplete(results);
      return results;
    } catch (err) {
      if (!this.isAborted) {
        console.error('Speed test error:', err);
        this.onError(err);
      }
      return null;
    }
  }

  async measurePingAndJitter() {
    const SAMPLES = 8;
    const latencies = [];
    let serverMeta = null;

    for (let i = 0; i < SAMPLES; i++) {
      if (this.isAborted) break;
      try {
        const probe = await fetchPingProbe(this.abortController.signal);
        latencies.push(probe.duration);
        if (!serverMeta && probe.colo) {
          serverMeta = probe;
        }

        const currentAvg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
        const currentJitter = calculateJitter(latencies);

        this.onProgress({
          phase: 'ping',
          progress: ((i + 1) / SAMPLES) * 100,
          ping: currentAvg,
          jitter: currentJitter,
          minPing: Math.min(...latencies),
          currentSpeed: 0,
        });

        await this.sleep(60);
      } catch (e) {
        if (this.isAborted) break;
        console.warn('Ping sample failed:', e);
      }
    }

    if (latencies.length === 0) {
      throw new Error('All latency probes failed. Check connection.');
    }

    latencies.sort((a, b) => a - b);
    const validLatencies = latencies.length > 3 ? latencies.slice(0, latencies.length - 1) : latencies;
    const minPing = validLatencies[0];
    const avgPing = validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length;
    const jitter = calculateJitter(validLatencies);

    return {
      minPing: parseFloat(minPing.toFixed(1)),
      avgPing: parseFloat(avgPing.toFixed(1)),
      jitter: parseFloat(jitter.toFixed(1)),
      colo: serverMeta?.colo || 'EDGE',
      city: serverMeta?.city || 'Cloudflare Edge',
      country: serverMeta?.country || '',
      isp: serverMeta?.isp || 'Cloudflare Anycast',
      clientIp: serverMeta?.clientIp || '',
    };
  }

  async measureDownload(sharedGraphData) {
    const TEST_DURATION_MS = 8000;
    const CONCURRENCY = 3;
    const startTime = performance.now();
    let totalBytesTransferred = 0;
    let peakSpeed = 0;
    let smoothedSpeed = 0;

    const windowSamples = [];
    const WINDOW_DURATION = 400;

    const runWorker = async (workerId) => {
      while (!this.isAborted && performance.now() - startTime < TEST_DURATION_MS) {
        try {
          const url = getDownloadUrl('5mb') + `&worker=${workerId}`;
          const response = await fetch(url, {
            cache: 'no-store',
            signal: this.abortController.signal,
          });

          if (!response.ok || !response.body) break;

          const reader = response.body.getReader();
          while (!this.isAborted && performance.now() - startTime < TEST_DURATION_MS) {
            const { done, value } = await reader.read();
            if (done) break;

            const now = performance.now();
            const chunkBytes = value.length;
            totalBytesTransferred += chunkBytes;

            windowSamples.push({ time: now, bytes: chunkBytes });

            while (windowSamples.length > 0 && now - windowSamples[0].time > WINDOW_DURATION) {
              windowSamples.shift();
            }

            const windowBytes = windowSamples.reduce((acc, s) => acc + s.bytes, 0);
            const windowTimeSpan = Math.max(50, now - (windowSamples[0]?.time || now));
            const instantMbps = (windowBytes * 8) / (windowTimeSpan / 1000) / 1000000;

            smoothedSpeed = smoothedSpeed === 0 ? instantMbps : smoothedSpeed * 0.75 + instantMbps * 0.25;
            if (smoothedSpeed > peakSpeed) peakSpeed = smoothedSpeed;

            const elapsed = now - startTime;
            const progress = Math.min(100, (elapsed / TEST_DURATION_MS) * 100);

            const secondMark = (elapsed / 1000).toFixed(1);
            if (!sharedGraphData.length || sharedGraphData[sharedGraphData.length - 1].time !== secondMark) {
              sharedGraphData.push({
                time: secondMark,
                download: parseFloat(smoothedSpeed.toFixed(1)),
                upload: 0,
              });
            }

            this.onProgress({
              phase: 'download',
              progress,
              currentSpeed: smoothedSpeed,
              downloadSpeed: smoothedSpeed,
              peakSpeed,
              totalBytes: totalBytesTransferred,
            });
          }
        } catch (err) {
          if (this.isAborted) break;
          console.warn(`Worker ${workerId} download error:`, err);
          await this.sleep(100);
        }
      }
    };

    const workers = Array.from({ length: CONCURRENCY }, (_, i) => runWorker(i));
    await Promise.all(workers);

    const totalDurationSeconds = Math.max(1, (performance.now() - startTime) / 1000);
    const avgSpeed = (totalBytesTransferred * 8) / totalDurationSeconds / 1000000;

    return {
      avgSpeed: parseFloat(avgSpeed.toFixed(2)),
      peakSpeed: parseFloat(peakSpeed.toFixed(2)),
      totalBytes: totalBytesTransferred,
    };
  }

  async measureUpload(sharedGraphData) {
    const TEST_DURATION_MS = 7500;
    const CONCURRENCY = 3;
    const CHUNK_SIZE = 1048576; // 1 MB payload

    // Generate safe incompressible 1MB buffer (never throws QuotaExceededError)
    const payload = getUploadPayload(CHUNK_SIZE);
    const uploadBlob = new Blob([payload], { type: 'application/octet-stream' });

    const startTime = performance.now();
    let totalBytesUploaded = 0;
    let peakSpeed = 0;
    let smoothedSpeed = 0;

    const windowSamples = [];
    const WINDOW_DURATION = 500;

    const runWorker = async () => {
      while (!this.isAborted && performance.now() - startTime < TEST_DURATION_MS) {
        try {
          const postStart = performance.now();

          // Upload pre-built binary blob
          await uploadChunk(uploadBlob, this.abortController.signal);

          const now = performance.now();
          totalBytesUploaded += CHUNK_SIZE;

          windowSamples.push({ time: now, bytes: CHUNK_SIZE });

          while (windowSamples.length > 0 && now - windowSamples[0].time > WINDOW_DURATION) {
            windowSamples.shift();
          }

          const windowBytes = windowSamples.reduce((acc, s) => acc + s.bytes, 0);
          const windowTimeSpan = Math.max(50, now - (windowSamples[0]?.time || now));
          const instantMbps = (windowBytes * 8) / (windowTimeSpan / 1000) / 1000000;

          smoothedSpeed = smoothedSpeed === 0 ? instantMbps : smoothedSpeed * 0.7 + instantMbps * 0.3;
          if (smoothedSpeed > peakSpeed) peakSpeed = smoothedSpeed;

          const elapsed = now - startTime;
          const progress = Math.min(100, (elapsed / TEST_DURATION_MS) * 100);

          const secondMark = (elapsed / 1000).toFixed(1);
          const lastPoint = sharedGraphData[sharedGraphData.length - 1];
          if (lastPoint && lastPoint.upload === 0) {
            lastPoint.upload = parseFloat(smoothedSpeed.toFixed(1));
          } else {
            sharedGraphData.push({
              time: secondMark,
              download: lastPoint?.download || 0,
              upload: parseFloat(smoothedSpeed.toFixed(1)),
            });
          }

          this.onProgress({
            phase: 'upload',
            progress,
            currentSpeed: smoothedSpeed,
            uploadSpeed: smoothedSpeed,
            peakSpeed,
            totalBytes: totalBytesUploaded,
          });
        } catch (err) {
          if (this.isAborted) break;
          console.warn('Upload worker chunk error:', err);
          await this.sleep(120);
        }
      }
    };

    const workers = Array.from({ length: CONCURRENCY }, () => runWorker());
    await Promise.all(workers);

    const totalDurationSeconds = Math.max(1, (performance.now() - startTime) / 1000);
    const avgSpeed = (totalBytesUploaded * 8) / totalDurationSeconds / 1000000;

    return {
      avgSpeed: parseFloat(avgSpeed.toFixed(2)),
      peakSpeed: parseFloat(peakSpeed.toFixed(2)),
      totalBytes: totalBytesUploaded,
    };
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
