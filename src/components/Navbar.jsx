import React from 'react';
import { Zap, History, Info, Wifi } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, serverColo }) {
  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo - Minimalist Black & White with Speed Vortex */}
        <div className="brand-group" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
          <div className="logo-badge">
            <svg className="logo-svg" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="#ffffff" />
              <path d="M19 8 L11 20 L17 20 L15 28 L25 17 L19 17 Z" fill="#000000" />
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
            <Zap className="nav-icon" size={15} />
            <span>Speed Test</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History className="nav-icon" size={15} />
            <span>History</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <Info className="nav-icon" size={15} />
            <span>About</span>
          </button>
        </nav>

        {/* Edge Status Badge */}
        <div className="edge-status">
          <span className="pulse-dot"></span>
          <span className="status-label">Cloudflare Edge:</span>
          <span className="status-colo">{serverColo || 'Global Anycast'}</span>
        </div>
      </div>
    </header>
  );
}
