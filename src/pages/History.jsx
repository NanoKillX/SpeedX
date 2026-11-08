import React from 'react';
import { History as HistoryIcon, Trash2, Download, ArrowDownCircle, ArrowUpCircle, Activity, Radio, Calendar } from 'lucide-react';
import { formatSpeed, formatPing, formatDate } from '../utils/formatters';

export default function HistoryPage({ history = [], onClear, onRunNewTest }) {
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
    const headers = ['Timestamp', 'Date', 'Download (Mbps)', 'Upload (Mbps)', 'Ping (ms)', 'Jitter (ms)', 'Server Colo', 'Server Location', 'ISP'];
    const rows = history.map((h) => [
      h.timestamp,
      new Date(h.timestamp).toISOString(),
      h.download_speed,
      h.upload_speed,
      h.ping,
      h.jitter,
      h.server_colo || '',
      `"${h.server_location || ''}"`,
      `"${h.client_isp || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `speedx_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="history-page">
      <div className="history-header">
        <div>
          <h1 className="page-title">
            TEST <span className="hero-highlight">HISTORY</span>
          </h1>
          <p className="page-subtitle">Historical internet performance benchmarks from this device and network</p>
        </div>
        <div className="history-actions">
          {history.length > 0 && (
            <>
              <button className="secondary-btn" onClick={exportCSV}>
                <Download size={16} />
                <span>Export CSV</span>
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
          <p className="empty-desc">Run your first network diagnostic to view latency, bandwidth trends, and PoP telemetry.</p>
          <button className="start-btn-inline" onClick={onRunNewTest}>
            Run Speed Test
          </button>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item, idx) => (
            <div key={item.id || idx} className="history-item-card">
              <div className="history-item-time">
                <Calendar size={14} className="cal-icon" />
                <span>{formatDate(item.timestamp)}</span>
              </div>
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
              <div className="history-item-server">
                <span className="server-tag">{item.server_colo || 'CF-EDGE'}</span>
                <span className="server-loc-text">{item.server_location || 'Cloudflare Anycast'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
