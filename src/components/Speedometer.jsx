import React, { useMemo } from 'react';
import { Play, Square, RefreshCw, Zap } from 'lucide-react';
import { formatSpeed } from '../utils/formatters';

const TICKS = [
  { value: 0, label: '0' },
  { value: 10, label: '10' },
  { value: 50, label: '50' },
  { value: 100, label: '100' },
  { value: 250, label: '250' },
  { value: 500, label: '500' },
  { value: 1000, label: '1G' },
];

const TICK_ANGLES = [-120, -80, -40, 0, 40, 80, 120];

function speedToAngle(speed) {
  if (!speed || speed <= 0) return -120;
  if (speed >= 1000) return 120;

  for (let i = 0; i < TICKS.length - 1; i++) {
    const v1 = TICKS[i].value;
    const v2 = TICKS[i + 1].value;
    if (speed >= v1 && speed <= v2) {
      const ratio = (speed - v1) / (v2 - v1);
      const a1 = TICK_ANGLES[i];
      const a2 = TICK_ANGLES[i + 1];
      return a1 + ratio * (a2 - a1);
    }
  }
  return 120;
}

export default function Speedometer({
  speed = 0,
  status = 'idle',
  progress = 0,
  onStart,
  onStop,
}) {
  const angle = useMemo(() => speedToAngle(speed), [speed]);
  const isRunning = status === 'ping' || status === 'download' || status === 'upload';

  // SVG Geometry
  const cx = 160;
  const cy = 160;
  const radius = 120;

  // Arc path generator
  const getArcPath = (startAngle, endAngle) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const bgArc = getArcPath(-120, 120);
  const activeArc = angle > -120 ? getArcPath(-120, angle) : '';

  const getStatusText = () => {
    switch (status) {
      case 'ping':
        return 'MEASURING LATENCY & JITTER';
      case 'download':
        return 'TESTING DOWNLOAD STREAM';
      case 'upload':
        return 'TESTING UPLOAD STREAM';
      case 'completed':
        return 'TEST COMPLETED';
      case 'error':
        return 'TEST FAILED';
      case 'aborted':
        return 'TEST STOPPED';
      default:
        return 'READY TO BENCHMARK';
    }
  };

  return (
    <div className="speedometer-wrapper">
      <div className="speedometer-container">
        <svg className="speedometer-svg" viewBox="0 0 320 300">
          <defs>
            <linearGradient id="speedo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff9f43" />
              <stop offset="50%" stopColor="#ff5a00" />
              <stop offset="100%" stopColor="#ff2200" />
            </linearGradient>

            <filter id="speedo-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <radialGradient id="hub-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2c3344" />
              <stop offset="100%" stopColor="#111520" />
            </radialGradient>
          </defs>

          {/* Background Track Arc */}
          <path
            d={bgArc}
            fill="none"
            stroke="#1d2436"
            strokeWidth="12"
            strokeLinecap="round"
          />

          {/* Active Glowing Arc */}
          {activeArc && (
            <path
              d={activeArc}
              fill="none"
              stroke="url(#speedo-gradient)"
              strokeWidth="12"
              strokeLinecap="round"
              filter="url(#speedo-glow)"
              className="active-arc"
            />
          )}

          {/* Scale Ticks & Numbers */}
          {TICKS.map((tick, index) => {
            const tickAngle = TICK_ANGLES[index];
            const rad = ((tickAngle - 90) * Math.PI) / 180;
            const x1 = cx + (radius - 12) * Math.cos(rad);
            const y1 = cy + (radius - 12) * Math.sin(rad);
            const x2 = cx + (radius + 4) * Math.cos(rad);
            const y2 = cy + (radius + 4) * Math.sin(rad);

            const tx = cx + (radius - 28) * Math.cos(rad);
            const ty = cy + (radius - 28) * Math.sin(rad);

            const isActive = angle >= tickAngle;

            return (
              <g key={tick.value} className="speedo-tick-group">
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isActive ? '#ff5a00' : '#323c52'}
                  strokeWidth={index === 0 || index === TICKS.length - 1 ? 2.5 : 1.5}
                />
                <text
                  x={tx}
                  y={ty + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill={isActive ? '#ffffff' : '#64748b'}
                  className="tick-text"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Center Hub Outer Glow */}
          <circle
            cx={cx}
            cy={cy}
            r="38"
            fill="none"
            stroke="#ff5a00"
            strokeWidth="1"
            strokeOpacity="0.25"
          />

          {/* Speedometer Needle */}
          <g transform={`rotate(${angle}, ${cx}, ${cy})`} className="needle-group">
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - radius + 15}
              stroke="#ff5a00"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#speedo-glow)"
            />
            {/* Needle Tip Highlight */}
            <circle
              cx={cx}
              cy={cy - radius + 15}
              r="2.5"
              fill="#ffffff"
            />
          </g>

          {/* Center Hub */}
          <circle
            cx={cx}
            cy={cy}
            r="28"
            fill="url(#hub-grad)"
            stroke="#2c354d"
            strokeWidth="2"
          />
          <circle
            cx={cx}
            cy={cy}
            r="10"
            fill="#ff5a00"
            filter="url(#speedo-glow)"
          />
        </svg>

        {/* Digital Readout */}
        <div className="digital-display">
          <div className="digital-speed">
            <span className="speed-number">{formatSpeed(speed)}</span>
            <span className="speed-unit">Mbps</span>
          </div>
          <div className={`status-pill ${status}`}>
            <span className="status-badge-dot"></span>
            <span className="status-badge-text">{getStatusText()}</span>
          </div>
        </div>

        {/* Phase Progress Bar */}
        {isRunning && (
          <div className="phase-progress-bar">
            <div
              className="phase-progress-fill"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            ></div>
          </div>
        )}
      </div>

      {/* Control Action Button */}
      <div className="speedo-actions">
        {!isRunning ? (
          <button
            className="action-btn start-btn"
            onClick={onStart}
            disabled={status === 'ping'}
          >
            <div className="btn-glow"></div>
            <div className="btn-content">
              {status === 'completed' ? (
                <>
                  <RefreshCw size={22} className="btn-icon spin-hover" />
                  <span>TEST AGAIN</span>
                </>
              ) : (
                <>
                  <Play size={22} className="btn-icon fill-current" />
                  <span>START SPEED TEST</span>
                </>
              )}
            </div>
          </button>
        ) : (
          <button className="action-btn stop-btn" onClick={onStop}>
            <Square size={20} className="btn-icon fill-current" />
            <span>STOP TEST</span>
          </button>
        )}
      </div>
    </div>
  );
}
