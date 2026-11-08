import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="graph-tooltip">
        <div className="tooltip-time">{label}s</div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="tooltip-item" style={{ color: entry.color }}>
            <span className="tooltip-name">{entry.name}:</span>
            <span className="tooltip-val">{entry.value} Mbps</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function SpeedGraph({ data = [] }) {
  const chartData = data.length > 0 ? data : [
    { time: '0.0', download: 0, upload: 0 },
  ];

  return (
    <div className="speed-graph-card">
      <div className="graph-header">
        <div className="graph-title-group">
          <h3 className="graph-title">LIVE BANDWIDTH TRAJECTORY</h3>
          <span className="graph-subtitle">Continuous socket stream rate</span>
        </div>
        <div className="graph-legend">
          <div className="legend-item">
            <span className="legend-color download-color"></span>
            <span>Download</span>
          </div>
          <div className="legend-item">
            <span className="legend-color upload-color"></span>
            <span>Upload</span>
          </div>
        </div>
      </div>

      <div className="graph-canvas-wrap">
        <ResponsiveContainer width="100%" height={170}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="downloadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00f0ff" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b026ff" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#b026ff" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#27272a"
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              unit="s"
            />
            <YAxis
              stroke="#27272a"
              tick={{ fill: '#71717a', fontSize: 11 }}
              tickLine={false}
              unit="M"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="download"
              name="Download"
              stroke="#00f0ff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#downloadGrad)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="upload"
              name="Upload"
              stroke="#b026ff"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#uploadGrad)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
