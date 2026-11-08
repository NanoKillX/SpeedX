import React, { useState } from 'react';
import { Share2, Check, Copy, RefreshCw, Trophy, Globe, Server, Shield, Gamepad2, Tv, Video, Download } from 'lucide-react';
import { formatSpeed, formatPing, evaluateQuality } from '../utils/formatters';

export default function ResultModal({ metrics, serverInfo, onReset }) {
  const [copied, setCopied] = useState(false);
  const [ipCopied, setIpCopied] = useState(false);
  const ratings = evaluateQuality(metrics.downloadSpeed, metrics.uploadSpeed, metrics.ping);

  const handleCopyReport = () => {
    const reportText = `🚀 NHubX SpeedX — Performance Report
-----------------------------------------
⬇️ Download: ${formatSpeed(metrics.downloadSpeed)} Mbps (Peak: ${formatSpeed(metrics.downloadPeak)} Mbps)
⬆️ Upload:   ${formatSpeed(metrics.uploadSpeed)} Mbps (Peak: ${formatSpeed(metrics.uploadPeak)} Mbps)
⚡ Latency:  ${formatPing(metrics.ping)} ms (Jitter: ${formatPing(metrics.jitter)} ms)

🌐 Network & IP Details:
• Client IP: ${serverInfo.ip || 'Unknown'}
• Provider:  ${serverInfo.isp || 'Unknown ISP'}
• Location:  ${serverInfo.location || 'Unknown Location'}
• Edge PoP:  Cloudflare [${serverInfo.colo || 'EDGE'}]

Diagnostic Rating:
• Gaming: ${ratings.gaming} | Streaming: ${ratings.streaming}
• Video Calls: ${ratings.videoCalls} | Downloads: ${ratings.downloads}

Tested on: https://speedx.nhubx.com
NHubX — One Hub. Infinite Power.`;

    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleCopyIp = () => {
    if (!serverInfo.ip) return;
    navigator.clipboard.writeText(serverInfo.ip).then(() => {
      setIpCopied(true);
      setTimeout(() => setIpCopied(false), 2000);
    });
  };

  return (
    <div className="result-card-container">
      <div className="result-card">
        {/* Header */}
        <div className="result-header">
          <div className="result-title-group">
            <div className="trophy-badge">
              <Trophy className="trophy-icon" size={22} />
            </div>
            <div>
              <h2 className="result-title">BENCHMARK REPORT</h2>
              <span className="result-subtitle">Verified high-precision diagnostic results</span>
            </div>
          </div>
          <button className="copy-btn primary-share-btn" onClick={handleCopyReport}>
            {copied ? (
              <>
                <Check size={16} className="text-green" />
                <span>Report Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Share Full Report</span>
              </>
            )}
          </button>
        </div>

        {/* Primary Stats Grid */}
        <div className="result-stats-row">
          <div className="stat-box download-box">
            <span className="stat-label">DOWNLOAD</span>
            <div className="stat-value">
              <span className="num">{formatSpeed(metrics.downloadSpeed)}</span>
              <span className="unit">Mbps</span>
            </div>
            <span className="sub-stat">Peak: {formatSpeed(metrics.downloadPeak)} Mbps</span>
          </div>

          <div className="stat-box upload-box">
            <span className="stat-label">UPLOAD</span>
            <div className="stat-value">
              <span className="num">{formatSpeed(metrics.uploadSpeed)}</span>
              <span className="unit">Mbps</span>
            </div>
            <span className="sub-stat">Peak: {formatSpeed(metrics.uploadPeak)} Mbps</span>
          </div>

          <div className="stat-box ping-box">
            <span className="stat-label">PING</span>
            <div className="stat-value">
              <span className="num">{formatPing(metrics.ping)}</span>
              <span className="unit">ms</span>
            </div>
            <span className="sub-stat">Min: {formatPing(metrics.minPing)} ms</span>
          </div>

          <div className="stat-box jitter-box">
            <span className="stat-label">JITTER</span>
            <div className="stat-value">
              <span className="num">{formatPing(metrics.jitter)}</span>
              <span className="unit">ms</span>
            </div>
            <span className="sub-stat">RFC 3550 standard</span>
          </div>
        </div>

        {/* IP & Verified Network Details Box */}
        <div className="report-ip-section">
          <div className="ip-section-header">
            <div className="ip-sec-title">
              <Globe size={16} className="text-cyan" />
              <span>CLIENT & NETWORK IDENTITY</span>
            </div>
            <button className="mini-ip-copy-btn" onClick={handleCopyIp} title="Copy IP address">
              {ipCopied ? (
                <>
                  <Check size={12} className="text-green" />
                  <span>IP Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy IP</span>
                </>
              )}
            </button>
          </div>

          <div className="report-ip-grid">
            <div className="ip-info-item">
              <span className="ip-item-lbl">Public IP:</span>
              <span className="ip-item-val ip-highlight">{serverInfo.ip || '---'}</span>
            </div>
            <div className="ip-info-item">
              <span className="ip-item-lbl">ISP / Provider:</span>
              <span className="ip-item-val">{serverInfo.isp || 'Detecting...'}</span>
            </div>
            <div className="ip-info-item">
              <span className="ip-item-lbl">Client Location:</span>
              <span className="ip-item-val">{serverInfo.location || 'Localhost'}</span>
            </div>
            <div className="ip-info-item">
              <span className="ip-item-lbl">Edge PoP Server:</span>
              <span className="ip-item-val badge-pop">Cloudflare {serverInfo.colo || 'EDGE'}</span>
            </div>
          </div>
        </div>

        {/* Quality Assessment Breakdown */}
        <div className="quality-breakdown">
          <h4 className="quality-title">APPLICATION EXPERIENCE RATING</h4>
          <div className="quality-grid">
            <div className="quality-item">
              <Gamepad2 size={18} className="quality-icon" />
              <div className="quality-text">
                <span className="q-label">Online Gaming</span>
                <span className="q-val highlight">{ratings.gaming}</span>
              </div>
            </div>
            <div className="quality-item">
              <Tv size={18} className="quality-icon" />
              <div className="quality-text">
                <span className="q-label">4K Streaming</span>
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
                <span className="q-label">Fast Downloads</span>
                <span className="q-val highlight">{ratings.downloads}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="result-footer">
          <button className="reset-test-btn" onClick={onReset}>
            <RefreshCw size={18} />
            <span>RUN ANOTHER TEST</span>
          </button>
        </div>
      </div>
    </div>
  );
}
