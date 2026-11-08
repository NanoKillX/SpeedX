import React from 'react';
import { ArrowDownCircle, ArrowUpCircle, Activity, Radio } from 'lucide-react';
import { formatSpeed, formatPing, formatBytes } from '../utils/formatters';

export default function MetricCards({ metrics, status }) {
  const isPingActive = status === 'ping';
  const isDownloadActive = status === 'download';
  const isUploadActive = status === 'upload';

  return (
    <div className="metrics-grid">
      {/* 1. Download Metric */}
      <div className={`metric-card download-card ${isDownloadActive ? 'active-phase' : ''}`}>
        <div className="metric-header">
          <div className="metric-icon-wrap download-icon">
            <ArrowDownCircle size={20} />
          </div>
          <span className="metric-label">DOWNLOAD</span>
          {isDownloadActive && <span className="live-tag">LIVE</span>}
        </div>
        <div className="metric-body">
          <div className="metric-primary-val">
            <span className="val-number">{formatSpeed(metrics.downloadSpeed)}</span>
            <span className="val-unit">Mbps</span>
          </div>
          <div className="metric-meta">
            <span className="meta-item">
              Peak: <strong>{formatSpeed(metrics.downloadPeak)} Mbps</strong>
            </span>
            {metrics.downloadBytes > 0 && (
              <span className="meta-item">
                Data: <strong>{formatBytes(metrics.downloadBytes)}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Upload Metric */}
      <div className={`metric-card upload-card ${isUploadActive ? 'active-phase' : ''}`}>
        <div className="metric-header">
          <div className="metric-icon-wrap upload-icon">
            <ArrowUpCircle size={20} />
          </div>
          <span className="metric-label">UPLOAD</span>
          {isUploadActive && <span className="live-tag">LIVE</span>}
        </div>
        <div className="metric-body">
          <div className="metric-primary-val">
            <span className="val-number">{formatSpeed(metrics.uploadSpeed)}</span>
            <span className="val-unit">Mbps</span>
          </div>
          <div className="metric-meta">
            <span className="meta-item">
              Peak: <strong>{formatSpeed(metrics.uploadPeak)} Mbps</strong>
            </span>
            {metrics.uploadBytes > 0 && (
              <span className="meta-item">
                Data: <strong>{formatBytes(metrics.uploadBytes)}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Ping Latency Metric */}
      <div className={`metric-card ping-card ${isPingActive ? 'active-phase' : ''}`}>
        <div className="metric-header">
          <div className="metric-icon-wrap ping-icon">
            <Activity size={20} />
          </div>
          <span className="metric-label">PING</span>
          {isPingActive && <span className="live-tag">MEASURING</span>}
        </div>
        <div className="metric-body">
          <div className="metric-primary-val">
            <span className="val-number">{formatPing(metrics.ping)}</span>
            <span className="val-unit">ms</span>
          </div>
          <div className="metric-meta">
            <span className="meta-item">
              Min: <strong>{formatPing(metrics.minPing)} ms</strong>
            </span>
            <span className="meta-item">
              Type: <strong>Cloudflare PoP</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 4. Jitter Metric */}
      <div className={`metric-card jitter-card ${isPingActive ? 'active-phase' : ''}`}>
        <div className="metric-header">
          <div className="metric-icon-wrap jitter-icon">
            <Radio size={20} />
          </div>
          <span className="metric-label">JITTER</span>
        </div>
        <div className="metric-body">
          <div className="metric-primary-val">
            <span className="val-number">{formatPing(metrics.jitter)}</span>
            <span className="val-unit">ms</span>
          </div>
          <div className="metric-meta">
            <span className="meta-item">
              Stability: <strong>{metrics.jitter < 3 ? 'Rock Solid' : metrics.jitter < 10 ? 'Good' : 'Variable'}</strong>
            </span>
            <span className="meta-item">RFC 3550 standard</span>
          </div>
        </div>
      </div>
    </div>
  );
}
