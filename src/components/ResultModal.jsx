import React, { useState } from 'react';
import { Share2, Check, Copy, RefreshCw, Trophy, Gamepad2, Tv, Video, Download } from 'lucide-react';
import { formatSpeed, formatPing, evaluateQuality } from '../utils/formatters';

export default function ResultModal({ metrics, serverInfo, onReset }) {
  const [copied, setCopied] = useState(false);
  const ratings = evaluateQuality(metrics.downloadSpeed, metrics.uploadSpeed, metrics.ping);

  const handleCopy = () => {
    const text = `🚀 NHubX SpeedX Performance Report:
⬇️ Download: ${formatSpeed(metrics.downloadSpeed)} Mbps
⬆️ Upload: ${formatSpeed(metrics.uploadSpeed)} Mbps
⚡ Ping: ${formatPing(metrics.ping)} ms | Jitter: ${formatPing(metrics.jitter)} ms
🌐 Server: ${serverInfo.colo || 'Cloudflare Edge'} (${serverInfo.location})
ISP: ${serverInfo.isp}
Powered by NHubX — One Hub. Infinite Power.
https://speedx.nhubx.com`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="result-card-container">
      <div className="result-card">
        <div className="result-header">
          <div className="result-title-group">
            <Trophy className="trophy-icon" size={24} />
            <div>
              <h2 className="result-title">BENCHMARK SUMMARY</h2>
              <span className="result-subtitle">Verified network diagnostic metrics</span>
            </div>
          </div>
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? (
              <>
                <Check size={16} className="text-green" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Share Results</span>
              </>
            )}
          </button>
        </div>

        {/* Big numbers summary */}
        <div className="result-stats-row">
          <div className="stat-box download-box">
            <span className="stat-label">DOWNLOAD</span>
            <div className="stat-value">
              <span className="num">{formatSpeed(metrics.downloadSpeed)}</span>
              <span className="unit">Mbps</span>
            </div>
          </div>
          <div className="stat-box upload-box">
            <span className="stat-label">UPLOAD</span>
            <div className="stat-value">
              <span className="num">{formatSpeed(metrics.uploadSpeed)}</span>
              <span className="unit">Mbps</span>
            </div>
          </div>
          <div className="stat-box ping-box">
            <span className="stat-label">PING</span>
            <div className="stat-value">
              <span className="num">{formatPing(metrics.ping)}</span>
              <span className="unit">ms</span>
            </div>
          </div>
          <div className="stat-box jitter-box">
            <span className="stat-label">JITTER</span>
            <div className="stat-value">
              <span className="num">{formatPing(metrics.jitter)}</span>
              <span className="unit">ms</span>
            </div>
          </div>
        </div>

        {/* Quality Assessment Breakdown */}
        <div className="quality-breakdown">
          <h4 className="quality-title">NETWORK CAPABILITY PROFILE</h4>
          <div className="quality-grid">
            <div className="quality-item">
              <Gamepad2 size={18} className="quality-icon" />
              <div className="quality-text">
                <span className="q-label">Gaming</span>
                <span className="q-val highlight">{ratings.gaming}</span>
              </div>
            </div>
            <div className="quality-item">
              <Tv size={18} className="quality-icon" />
              <div className="quality-text">
                <span className="q-label">Streaming</span>
                <span className="q-val highlight">{ratings.streaming}</span>
              </div>
            </div>
            <div className="quality-item">
              <Video size={18} className="quality-icon" />
              <div className="quality-text">
                <span className="q-label">Video Calls</span>
                <span className="q-val highlight">{ratings.videoCalls}</span>
              </div>
            </div>
            <div className="quality-item">
              <Download size={18} className="quality-icon" />
              <div className="quality-text">
                <span className="q-label">Downloads</span>
                <span className="q-val highlight">{ratings.downloads}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="result-footer">
          <button className="reset-test-btn" onClick={onReset}>
            <RefreshCw size={16} />
            <span>RUN ANOTHER TEST</span>
          </button>
        </div>
      </div>
    </div>
  );
}
