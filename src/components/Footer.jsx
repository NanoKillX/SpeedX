import React from 'react';
import { Shield, Zap, Globe, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <Zap size={20} className="footer-bolt" />
              <span className="footer-brand-name">NHubX <span className="text-orange">SpeedX</span></span>
            </div>
            <p className="footer-tagline">One Hub. Infinite Power.</p>
            <p className="footer-desc">
              Next-generation network benchmarking engineered on Cloudflare's global edge network.
            </p>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h4 className="col-title">PRODUCT</h4>
              <a href="#speedtest" className="footer-link">Speed Test</a>
              <a href="#methodology" className="footer-link">Methodology</a>
              <a href="#network" className="footer-link">Edge Locations</a>
            </div>
            <div className="footer-col">
              <h4 className="col-title">INFRASTRUCTURE</h4>
              <span className="footer-static-item">Cloudflare Workers</span>
              <span className="footer-static-item">Cloudflare R2 Storage</span>
              <span className="footer-static-item">Cloudflare D1 SQL</span>
              <span className="footer-static-item">Cloudflare Pages</span>
            </div>
            <div className="footer-col">
              <h4 className="col-title">LEGAL & PRIVACY</h4>
              <span className="footer-static-item">No Personal Data Logging</span>
              <span className="footer-static-item">Anonymous Telemetry</span>
              <span className="footer-static-item">Terms of Service</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">
            © {new Date().getFullYear()} NHubX. All rights reserved.
          </div>
          <div className="footer-badge">
            <span className="version-pill">v1.0.0 Production</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
