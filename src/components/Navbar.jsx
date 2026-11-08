import React from 'react';
import { Zap, ShieldCheck, History, Info, Wifi } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, serverColo, isOnline = true }) {
  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div className="brand-group" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
          <div className="logo-badge">
            <svg className="logo-svg" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="#141824" />
              <rect width="38" height="38" x="1" y="1" rx="9" stroke="#ff5a00" strokeOpacity="0.4" strokeWidth="1.5" />
              <path d="M9 23 A 12 12 0 1 1 31 23" stroke="url(#nav-grad)" strokeWidth="3" strokeLinecap="round" />
              <path d="M21 10 L14 21 L20 21 L18 31 L27 19 L21 19 Z" fill="url(#nav-grad)" />
              <defs>
                <linearGradient id="nav-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff8c38" />
                  <stop offset="100%" stopColor="#ff5a00" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="brand-text">
            <div className="brand-title">
              <span className="brand-nhubx">NHubX</span>
              <span className="brand-speedx">SpeedX</span>
            </div>
            <span className="brand-tagline">One Hub. Infinite Power.</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button
            className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Zap className="nav-icon" size={16} />
            <span>Speed Test</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History className="nav-icon" size={16} />
            <span>History</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <Info className="nav-icon" size={16} />
            <span>About</span>
          </button>
        </nav>

        {/* Edge Status Badge */}
        <div className="edge-status">
          <div className="status-indicator">
            <span className="pulse-dot"></span>
            <Wifi size={14} className="status-icon" />
          </div>
          <div className="status-text">
            <span className="status-label">Cloudflare Edge</span>
            <span className="status-colo">{serverColo || 'Global Anycast'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
