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
  // If no data points yet, create a baseline
  const chartData = data.length > 0 ? data : [
    { time: '0.0', download: 0, upload: 0 },
  ];

  return (
    <div className="speed-graph-card">
      <div className="graph-header">
        <div className="graph-title-group">
          <h3 className="graph-title">REAL-TIME BANDWIDTH PROFILE</h3>
          <span className="graph-subtitle">Continuous measurement stream</span>
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
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="downloadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff5a00" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#ff5a00" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="uploadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#00d2ff" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              stroke="#334155"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              unit="s"
            />
            <YAxis
              stroke="#334155"
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              unit="M"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="download"
              name="Download"
              stroke="#ff5a00"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#downloadGrad)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="upload"
              name="Upload"
              stroke="#00d2ff"
              strokeWidth={2.5}
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
