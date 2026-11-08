import React from 'react';
import { ArrowDown, ArrowUp, Activity, Radio } from 'lucide-react';
import { formatSpeed, formatPing, formatBytes } from '../utils/formatters';

export default function MetricCards({ metrics, status }) {
  const isPingActive = status === 'ping';
  const isDownloadActive = status === 'download';
  const isUploadActive = status === 'upload';

  return (
    <div className="metrics-grid">
      {/* 1. Download Metric - Vibrant Cyan Accent */}
      <div className={`metric-card download-card ${isDownloadActive ? 'active-phase' : ''}`}>
        <div className="metric-header">
          <div className="metric-icon-wrap download-icon">
            <ArrowDown size={18} strokeWidth={2.5} />
          </div>
          <span className="metric-label">DOWNLOAD</span>
          {isDownloadActive && <span className="live-pill download-live">TESTING</span>}
        </div>
        <div className="metric-body">
          <div className="metric-primary-val">
            <span className="val-number download-color-text">{formatSpeed(metrics.downloadSpeed)}</span>
            <span className="val-unit">Mbps</span>
          </div>
          <div className="metric-meta">
            <span className="meta-item">
              Peak: <strong className="white-text">{formatSpeed(metrics.downloadPeak)} Mbps</strong>
            </span>
            {metrics.downloadBytes > 0 && (
              <span className="meta-item">
                Transferred: <strong className="white-text">{formatBytes(metrics.downloadBytes)}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Upload Metric - Vibrant Purple Accent */}
      <div className={`metric-card upload-card ${isUploadActive ? 'active-phase' : ''}`}>
        <div className="metric-header">
          <div className="metric-icon-wrap upload-icon">
            <ArrowUp size={18} strokeWidth={2.5} />
          </div>
          <span className="metric-label">UPLOAD</span>
          {isUploadActive && <span className="live-pill upload-live">TESTING</span>}
        </div>
        <div className="metric-body">
          <div className="metric-primary-val">
            <span className="val-number upload-color-text">{formatSpeed(metrics.uploadSpeed)}</span>
            <span className="val-unit">Mbps</span>
          </div>
          <div className="metric-meta">
            <span className="meta-item">
              Peak: <strong className="white-text">{formatSpeed(metrics.uploadPeak)} Mbps</strong>
            </span>
            {metrics.uploadBytes > 0 && (
              <span className="meta-item">
                Transferred: <strong className="white-text">{formatBytes(metrics.uploadBytes)}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Ping Latency Metric - Vibrant Green Accent */}
      <div className={`metric-card ping-card ${isPingActive ? 'active-phase' : ''}`}>
        <div className="metric-header">
          <div className="metric-icon-wrap ping-icon">
            <Activity size={18} strokeWidth={2.5} />
          </div>
          <span className="metric-label">PING</span>
          {isPingActive && <span className="live-pill ping-live">MEASURING</span>}
        </div>
        <div className="metric-body">
          <div className="metric-primary-val">
            <span className="val-number ping-color-text">{formatPing(metrics.ping)}</span>
            <span className="val-unit">ms</span>
          </div>
          <div className="metric-meta">
            <span className="meta-item">
              Min RTT: <strong className="white-text">{formatPing(metrics.minPing)} ms</strong>
            </span>
            <span className="meta-item">Cloudflare Edge</span>
          </div>
        </div>
      </div>

      {/* 4. Jitter Metric - Vibrant Amber Accent */}
      <div className={`metric-card jitter-card ${isPingActive ? 'active-phase' : ''}`}>
        <div className="metric-header">
          <div className="metric-icon-wrap jitter-icon">
            <Radio size={18} strokeWidth={2.5} />
          </div>
          <span className="metric-label">JITTER</span>
        </div>
        <div className="metric-body">
          <div className="metric-primary-val">
            <span className="val-number jitter-color-text">{formatPing(metrics.jitter)}</span>
            <span className="val-unit">ms</span>
          </div>
          <div className="metric-meta">
            <span className="meta-item">
              Stability: <strong className="white-text">{metrics.jitter < 3 ? 'Excellent' : metrics.jitter < 10 ? 'Good' : 'Variable'}</strong>
            </span>
            <span className="meta-item">RFC 3550 Standard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
