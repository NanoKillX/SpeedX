import React, { useState } from 'react';
import { History as HistoryIcon, Trash2, Download, ArrowDownCircle, ArrowUpCircle, Activity, Radio, Calendar, Globe, Copy, Check } from 'lucide-react';
import { formatSpeed, formatPing, formatDate } from '../utils/formatters';

export default function HistoryPage({ history = [], onClear, onRunNewTest }) {
  const [copiedId, setCopiedId] = useState(null);

  // Aggregate averages
  const totalTests = history.length;
  const avgDownload = totalTests > 0
    ? (history.reduce((acc, h) => acc + (Number(h.download_speed) || 0), 0) / totalTests).toFixed(1)
    : '0.0';
  const avgUpload = totalTests > 0
    ? (history.reduce((acc, h) => acc + (Number(h.upload_speed) || 0), 0) / totalTests).toFixed(1)
    : '0.0';
  const minPing = totalTests > 0
    ? Math.min(...history.map((h) => Number(h.ping) || 999)).toFixed(1)
    : '0.0';

  const exportCSV = () => {
    if (history.length === 0) return;
    const headers = [
      'Timestamp',
      'Date & Time (UTC)',
      'Client IP',
      'Client ISP',
      'Client City',
      'Client Country',
      'Download (Mbps)',
      'Upload (Mbps)',
      'Ping (ms)',
      'Jitter (ms)',
      'Server PoP',
      'Server Location'
    ];

    const rows = history.map((h) => [
      h.timestamp,
      new Date(h.timestamp).toISOString(),
      `"${h.ip || 'Unknown'}"`,
      `"${h.client_isp || 'Unknown ISP'}"`,
      `"${h.client_city || ''}"`,
      `"${h.client_country || ''}"`,
      h.download_speed,
      h.upload_speed,
      h.ping,
      h.jitter,
      `"${h.server_colo || 'EDGE'}"`,
      `"${h.server_location || 'Cloudflare Anycast'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `speedx_report_with_ip_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyItemIp = (id, ip) => {
    if (!ip) return;
    navigator.clipboard.writeText(ip).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <div>
          <h1 className="page-title">
            BENCHMARK <span className="hero-highlight">REPORTS & HISTORY</span>
          </h1>
          <p className="page-subtitle">Complete historical log of tests including public IP, latency, and throughput</p>
        </div>
        <div className="history-actions">
          {history.length > 0 && (
            <>
              <button className="secondary-btn" onClick={exportCSV}>
                <Download size={16} />
                <span>Export CSV with IPs</span>
              </button>
              <button className="danger-btn" onClick={onClear}>
                <Trash2 size={16} />
                <span>Clear History</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Aggregate summary cards */}
      <div className="history-summary-grid">
        <div className="hist-summary-card">
          <span className="hist-sum-label">TOTAL TESTS</span>
          <span className="hist-sum-val">{totalTests}</span>
        </div>
        <div className="hist-summary-card">
          <span className="hist-sum-label">AVG DOWNLOAD</span>
          <span className="hist-sum-val text-orange">{avgDownload} <span className="unit">Mbps</span></span>
        </div>
        <div className="hist-summary-card">
          <span className="hist-sum-label">AVG UPLOAD</span>
          <span className="hist-sum-val text-cyan">{avgUpload} <span className="unit">Mbps</span></span>
        </div>
        <div className="hist-summary-card">
          <span className="hist-sum-label">BEST LATENCY</span>
          <span className="hist-sum-val text-green">{minPing} <span className="unit">ms</span></span>
        </div>
      </div>

      {/* History Items */}
      {history.length === 0 ? (
        <div className="empty-history-card">
          <HistoryIcon size={48} className="empty-icon" />
          <h3 className="empty-title">No Speed Tests Recorded Yet</h3>
          <p className="empty-desc">Run a speed test to record network throughput, latency, and IP telemetry.</p>
          <button className="start-btn-inline" onClick={onRunNewTest}>
            Run Speed Test Now
          </button>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item, idx) => {
            const itemKey = item.id || `hist_${item.timestamp}_${idx}`;
            const isCopied = copiedId === itemKey;

            return (
              <div key={itemKey} className="history-item-card">
                {/* Left: Time and IP */}
                <div className="history-item-left">
                  <div className="history-item-time">
                    <Calendar size={14} className="cal-icon" />
                    <span>{formatDate(item.timestamp)}</span>
                  </div>
                  {item.ip && (
                    <div className="history-ip-tag" onClick={() => copyItemIp(itemKey, item.ip)} title="Click to copy IP">
                      <Globe size={12} className="text-cyan" />
                      <span className="ip-mono-text">{item.ip}</span>
                      {isCopied ? <Check size={11} className="text-green" /> : <Copy size={11} className="ip-copy-icon" />}
                    </div>
                  )}
                </div>

                {/* Center: Metrics */}
                <div className="history-item-metrics">
                  <div className="hist-metric">
                    <ArrowDownCircle size={16} className="text-orange" />
                    <span className="hist-m-label">Down:</span>
                    <span className="hist-m-val">{formatSpeed(item.download_speed)} Mbps</span>
                  </div>
                  <div className="hist-metric">
                    <ArrowUpCircle size={16} className="text-cyan" />
                    <span className="hist-m-label">Up:</span>
                    <span className="hist-m-val">{formatSpeed(item.upload_speed)} Mbps</span>
                  </div>
                  <div className="hist-metric">
                    <Activity size={16} className="text-yellow" />
                    <span className="hist-m-label">Ping:</span>
                    <span className="hist-m-val">{formatPing(item.ping)} ms</span>
                  </div>
                  <div className="hist-metric">
                    <Radio size={16} className="text-purple" />
                    <span className="hist-m-label">Jitter:</span>
                    <span className="hist-m-val">{formatPing(item.jitter)} ms</span>
                  </div>
                </div>

                {/* Right: Server and ISP */}
                <div className="history-item-server">
                  <span className="server-tag">{item.server_colo || 'CF-EDGE'}</span>
                  <div className="server-loc-col">
                    <span className="server-loc-text">{item.server_location || 'Cloudflare Anycast'}</span>
                    {item.client_isp && <span className="server-isp-text">{item.client_isp}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
