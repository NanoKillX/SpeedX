import React, { useState } from 'react';
import { Check, Copy, RefreshCw, Trophy, Globe } from 'lucide-react';
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
      <div className="result-card-clean">
        {/* Header */}
        <div className="result-header">
          <div className="result-title-group">
            <div className="trophy-badge-clean">
              <Trophy size={20} className="text-white" />
            </div>
            <div>
              <h2 className="result-title">BENCHMARK SUMMARY</h2>
              <span className="result-subtitle">Verified diagnostic throughput & latency</span>
            </div>
          </div>
          <button className="copy-btn-clean" onClick={handleCopyReport}>
            {copied ? (
              <>
                <Check size={14} className="text-green" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Share Report</span>
              </>
            )}
          </button>
        </div>

        {/* Primary Stats Grid with Metric Colors */}
        <div className="result-stats-row">
          <div className="stat-box-clean download-border">
            <span className="stat-label">DOWNLOAD</span>
            <div className="stat-value">
              <span className="num download-color-text">{formatSpeed(metrics.downloadSpeed)}</span>
              <span className="unit">Mbps</span>
            </div>
            <span className="sub-stat">Peak: {formatSpeed(metrics.downloadPeak)} Mbps</span>
          </div>

          <div className="stat-box-clean upload-border">
            <span className="stat-label">UPLOAD</span>
            <div className="stat-value">
              <span className="num upload-color-text">{formatSpeed(metrics.uploadSpeed)}</span>
              <span className="unit">Mbps</span>
            </div>
            <span className="sub-stat">Peak: {formatSpeed(metrics.uploadPeak)} Mbps</span>
          </div>

          <div className="stat-box-clean ping-border">
            <span className="stat-label">PING</span>
            <div className="stat-value">
              <span className="num ping-color-text">{formatPing(metrics.ping)}</span>
              <span className="unit">ms</span>
            </div>
            <span className="sub-stat">Min: {formatPing(metrics.minPing)} ms</span>
          </div>

          <div className="stat-box-clean jitter-border">
            <span className="stat-label">JITTER</span>
            <div className="stat-value">
              <span className="num jitter-color-text">{formatPing(metrics.jitter)}</span>
              <span className="unit">ms</span>
            </div>
            <span className="sub-stat">RFC 3550 Standard</span>
          </div>
        </div>

        {/* IP & Network Identity Section */}
        <div className="report-ip-section-clean">
          <div className="ip-section-header">
            <div className="ip-sec-title">
              <Globe size={15} className="text-cyan" />
              <span>NETWORK & IP TELEMETRY</span>
            </div>
            <button className="mini-ip-copy-btn" onClick={handleCopyIp} title="Copy IP">
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
              <span className="ip-item-lbl">Client IP</span>
              <span className="ip-item-val ip-highlight">{serverInfo.ip || '---'}</span>
            </div>
            <div className="ip-info-item">
              <span className="ip-item-lbl">ISP Organization</span>
              <span className="ip-item-val">{serverInfo.isp || 'Detecting...'}</span>
            </div>
            <div className="ip-info-item">
              <span className="ip-item-lbl">Location</span>
              <span className="ip-item-val">{serverInfo.location || 'Localhost'}</span>
            </div>
            <div className="ip-info-item">
              <span className="ip-item-lbl">Edge Server</span>
              <span className="ip-item-val text-white">Cloudflare [{serverInfo.colo || 'EDGE'}]</span>
            </div>
          </div>
        </div>

        {/* Quality Rating */}
        <div className="quality-breakdown-clean">
          <div className="quality-grid">
            <div className="quality-item-clean">
              <span className="q-label">Gaming</span>
              <span className="q-val text-green">{ratings.gaming}</span>
            </div>
            <div className="quality-item-clean">
              <span className="q-label">4K Streaming</span>
              <span className="q-val text-cyan">{ratings.streaming}</span>
            </div>
            <div className="quality-item-clean">
              <span className="q-label">Video Calls</span>
              <span className="q-val text-purple">{ratings.videoCalls}</span>
            </div>
            <div className="quality-item-clean">
              <span className="q-label">Downloads</span>
              <span className="q-val text-amber">{ratings.downloads}</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="result-footer">
          <button className="reset-test-btn-clean" onClick={onReset}>
            <RefreshCw size={16} />
            <span>TEST AGAIN</span>
          </button>
        </div>
      </div>
    </div>
  );
}
