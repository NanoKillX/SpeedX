import { useState, useRef, useEffect, useCallback } from 'react';
import { SpeedTestRunner } from '../services/speedEngine';
import { fetchPingProbe, fetchHistory } from '../services/api';
import confetti from 'canvas-confetti';

const LOCAL_STORAGE_KEY = 'nhubx_speedx_history';

export function useSpeedTest() {
  const [status, setStatus] = useState('idle'); // idle, ping, download, upload, completed, error, aborted
  const [progress, setProgress] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [graphData, setGraphData] = useState([]);
  const [serverInfo, setServerInfo] = useState({
    colo: 'Detecting...',
    location: 'Locating edge PoP...',
    ip: '---',
    isp: 'Detecting provider...',
  });
  const [metrics, setMetrics] = useState({
    ping: 0,
    minPing: 0,
    jitter: 0,
    downloadSpeed: 0,
    downloadPeak: 0,
    downloadBytes: 0,
    uploadSpeed: 0,
    uploadPeak: 0,
    uploadBytes: 0,
  });
  const [history, setHistory] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const runnerRef = useRef(null);

  // Load server info on mount
  useEffect(() => {
    let mounted = true;
    fetchPingProbe()
      .then((probe) => {
        if (!mounted) return;
        setServerInfo({
          colo: probe.colo || 'EDGE',
          location: probe.city && probe.country ? `${probe.city}, ${probe.country}` : 'Cloudflare Global Edge',
          ip: probe.clientIp || '---',
          isp: probe.isp || 'Cloudflare Network',
        });
      })
      .catch((err) => {
        console.warn('Initial server probe warning:', err);
      });

    // Load history
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse history:', e);
      }
    }

    // Try fetching from remote D1
    fetchHistory().then((remoteHistory) => {
      if (mounted && remoteHistory && remoteHistory.length > 0) {
        setHistory((prev) => {
          // Merge unique by id or timestamp
          const map = new Map();
          [...remoteHistory, ...prev].forEach((item) => {
            const key = item.id || item.timestamp;
            if (!map.has(key)) map.set(key, item);
          });
          const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
          return merged;
        });
      }
    });

    return () => {
      mounted = false;
      if (runnerRef.current) {
        runnerRef.current.abort();
      }
    };
  }, []);

  const startTest = useCallback(() => {
    setErrorMsg(null);
    setProgress(0);
    setCurrentSpeed(0);
    setGraphData([]);
    setMetrics({
      ping: 0,
      minPing: 0,
      jitter: 0,
      downloadSpeed: 0,
      downloadPeak: 0,
      downloadBytes: 0,
      uploadSpeed: 0,
      uploadPeak: 0,
      uploadBytes: 0,
    });

    const runner = new SpeedTestRunner({
      onStatusChange: (newStatus) => {
        setStatus(newStatus);
        if (newStatus === 'completed') {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#ff5a00', '#ff8533', '#ffffff', '#ff3300'],
            });
          } catch (e) {
            // ignore if confetti blocked
          }
        }
      },
      onProgress: (data) => {
        if (data.progress !== undefined) setProgress(data.progress);
        if (data.currentSpeed !== undefined) setCurrentSpeed(data.currentSpeed);
        if (data.serverInfo) {
          setServerInfo(data.serverInfo);
        }

        setMetrics((prev) => ({
          ...prev,
          ping: data.ping !== undefined ? data.ping : prev.ping,
          minPing: data.minPing !== undefined ? data.minPing : prev.minPing,
          jitter: data.jitter !== undefined ? data.jitter : prev.jitter,
          downloadSpeed: data.downloadSpeed !== undefined ? data.downloadSpeed : prev.downloadSpeed,
          downloadPeak: data.peakSpeed && data.phase === 'download' ? data.peakSpeed : prev.downloadPeak,
          downloadBytes: data.totalBytes && data.phase === 'download' ? data.totalBytes : prev.downloadBytes,
          uploadSpeed: data.uploadSpeed !== undefined ? data.uploadSpeed : prev.uploadSpeed,
          uploadPeak: data.peakSpeed && data.phase === 'upload' ? data.peakSpeed : prev.uploadPeak,
          uploadBytes: data.totalBytes && data.phase === 'upload' ? data.totalBytes : prev.uploadBytes,
        }));
      },
      onError: (err) => {
        setStatus('error');
        setErrorMsg(err.message || 'Speed test encountered an error. Please retry.');
      },
      onComplete: (finalResults) => {
        const historyItem = {
          id: crypto.randomUUID ? crypto.randomUUID() : `item_${Date.now()}`,
          timestamp: Date.now(),
          download_speed: finalResults.downloadSpeed,
          upload_speed: finalResults.uploadSpeed,
          ping: finalResults.ping,
          jitter: finalResults.jitter,
          server_colo: finalResults.serverColo,
          server_location: finalResults.serverLocation,
          client_isp: finalResults.clientIsp,
          client_city: finalResults.clientCity,
          client_country: finalResults.clientCountry,
        };

        setHistory((prev) => {
          const updated = [historyItem, ...prev.slice(0, 49)];
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
      },
    });

    runnerRef.current = runner;
    runner.run();
  }, []);

  const stopTest = useCallback(() => {
    if (runnerRef.current) {
      runnerRef.current.abort();
    }
    setStatus('aborted');
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setHistory([]);
  }, []);

  return {
    status,
    progress,
    currentSpeed,
    graphData,
    serverInfo,
    metrics,
    history,
    errorMsg,
    startTest,
    stopTest,
    clearHistory,
  };
}
