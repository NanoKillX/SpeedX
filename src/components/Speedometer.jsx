import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Square, RefreshCw } from 'lucide-react';
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
  const isRunning = status === 'ping' || status === 'download' || status === 'upload';
  const targetAngle = useMemo(() => speedToAngle(speed), [speed]);

  // Smooth lerp for needle and number readout
  const [smoothAngle, setSmoothAngle] = useState(-120);
  const [smoothSpeed, setSmoothSpeed] = useState(0);

  const targetAngleRef = useRef(targetAngle);
  targetAngleRef.current = targetAngle;
  const targetSpeedRef = useRef(speed);
  targetSpeedRef.current = speed;

  useEffect(() => {
    let animId;
    const updateMotion = () => {
      setSmoothAngle((prev) => {
        const diff = targetAngleRef.current - prev;
        if (Math.abs(diff) < 0.05) return targetAngleRef.current;
        return prev + diff * 0.14;
      });

      setSmoothSpeed((prev) => {
        const diff = targetSpeedRef.current - prev;
        if (Math.abs(diff) < 0.05) return targetSpeedRef.current;
        return prev + diff * 0.16;
      });

      animId = requestAnimationFrame(updateMotion);
    };

    animId = requestAnimationFrame(updateMotion);
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    if (status === 'idle') {
      setSmoothAngle(-120);
      setSmoothSpeed(0);
    }
  }, [status]);

  // Dynamic phase color
  const phaseColor = useMemo(() => {
    switch (status) {
      case 'ping':
        return '#00ff88'; // Emerald Green
      case 'download':
        return '#00f0ff'; // Electric Cyan
      case 'upload':
        return '#b026ff'; // Vibrant Violet
      case 'completed':
        return '#ffffff'; // Pure White
      default:
        return '#ffffff';
    }
  }, [status]);

  // SVG Geometry
  const cx = 170;
  const cy = 170;
  const radius = 125;

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
  const activeArc = smoothAngle > -120 ? getArcPath(-120, smoothAngle) : '';

  const getStatusText = () => {
    switch (status) {
      case 'ping':
        return 'MEASURING PING & JITTER';
      case 'download':
        return 'TESTING DOWNLOAD STREAM';
      case 'upload':
        return 'TESTING UPLOAD STREAM';
      case 'completed':
        return 'BENCHMARK COMPLETED';
      case 'error':
        return 'TEST ERROR';
      case 'aborted':
        return 'STOPPED';
      default:
        return 'READY TO BENCHMARK';
    }
  };

  return (
    <div className="speedometer-wrapper">
      <div
        className="speedometer-glow-backdrop"
        style={{
          background: `radial-gradient(circle, ${phaseColor}18 0%, transparent 70%)`,
        }}
      ></div>

      <div className="speedometer-container">
        <svg className="speedometer-svg" viewBox="0 0 340 310">
          <defs>
            <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Track Arc */}
          <path
            d={bgArc}
            fill="none"
            stroke="#18181b"
            strokeWidth="9"
            strokeLinecap="round"
          />

          {/* Dynamic Active Glowing Arc */}
          {activeArc && (
            <path
              d={activeArc}
              fill="none"
              stroke={phaseColor}
              strokeWidth="9"
              strokeLinecap="round"
              filter="url(#gauge-glow)"
              className="active-arc"
            />
          )}

          {/* Scale Ticks & Numbers */}
          {TICKS.map((tick, index) => {
            const tickAngle = TICK_ANGLES[index];
            const rad = ((tickAngle - 90) * Math.PI) / 180;
            const x1 = cx + (radius - 10) * Math.cos(rad);
            const y1 = cy + (radius - 10) * Math.sin(rad);
            const x2 = cx + (radius + 4) * Math.cos(rad);
            const y2 = cy + (radius + 4) * Math.sin(rad);

            const tx = cx + (radius - 26) * Math.cos(rad);
            const ty = cy + (radius - 26) * Math.sin(rad);

            const isActive = smoothAngle >= tickAngle;

            return (
              <g key={tick.value} className="speedo-tick-group">
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isActive ? phaseColor : '#27272a'}
                  strokeWidth={index === 0 || index === TICKS.length - 1 ? 2 : 1.2}
                />
                <text
                  x={tx}
                  y={ty + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="600"
                  fill={isActive ? '#ffffff' : '#52525b'}
                  className="tick-text"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Dynamic Needle */}
          <g transform={`rotate(${smoothAngle}, ${cx}, ${cy})`} className="needle-group">
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - radius + 16}
              stroke={phaseColor}
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#gauge-glow)"
            />
            <circle
              cx={cx}
              cy={cy - radius + 16}
              r="2.5"
              fill="#ffffff"
            />
          </g>

          {/* Center Hub */}
          <circle
            cx={cx}
            cy={cy}
            r="24"
            fill="#09090b"
            stroke="#27272a"
            strokeWidth="2"
          />
          <circle
            cx={cx}
            cy={cy}
            r="8"
            fill={phaseColor}
            filter="url(#gauge-glow)"
          />
        </svg>

        {/* Digital Readout */}
        <div className="digital-display">
          <div className="digital-speed">
            <span className="speed-number" style={{ color: '#ffffff' }}>
              {formatSpeed(smoothSpeed)}
            </span>
            <span className="speed-unit">Mbps</span>
          </div>
          <div className={`status-pill ${status}`}>
            <span
              className="status-badge-dot"
              style={{ backgroundColor: phaseColor, boxShadow: `0 0 8px ${phaseColor}` }}
            ></span>
            <span className="status-badge-text">{getStatusText()}</span>
          </div>
        </div>

        {/* Minimal Progress Bar */}
        {isRunning && (
          <div className="phase-progress-bar">
            <div
              className="phase-progress-fill"
              style={{
                width: `${Math.min(100, Math.max(0, progress))}%`,
                backgroundColor: phaseColor,
                boxShadow: `0 0 10px ${phaseColor}`,
              }}
            ></div>
          </div>
        )}
      </div>

      {/* Clean, Simple High-Contrast Action Button */}
      <div className="speedo-actions">
        {!isRunning ? (
          <button
            className="action-btn start-btn-minimal"
            onClick={onStart}
            disabled={status === 'ping'}
            aria-label="Start speed test"
          >
            <div className="btn-content">
              {status === 'completed' ? (
                <>
                  <RefreshCw size={18} />
                  <span>TEST AGAIN</span>
                </>
              ) : (
                <>
                  <Play size={18} fill="#000000" />
                  <span>START SPEED TEST</span>
                </>
              )}
            </div>
          </button>
        ) : (
          <button className="action-btn stop-btn-minimal" onClick={onStop} aria-label="Stop speed test">
            <Square size={16} fill="currentColor" />
            <span>STOP</span>
          </button>
        )}
      </div>
    </div>
  );
}
