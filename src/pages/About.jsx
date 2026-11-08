import React from 'react';
import { Zap, ShieldCheck, Cpu, Network, Layers, BarChart3 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1 className="page-title">
          ABOUT <span className="hero-highlight-white">NHubX SPEEDX</span>
        </h1>
        <p className="page-subtitle">
          Next-generation network diagnostic platform engineered for raw precision and real transfer speeds.
        </p>
      </div>

      <div className="about-cards-grid">
        <div className="about-card">
          <div className="about-card-icon text-cyan">
            <Zap size={22} />
          </div>
          <h3 className="about-card-title">Real Network Transfer</h3>
          <p className="about-card-text">
            SpeedX measures genuine socket throughput and packet transit time. We do not use synthetic delays, simulated curves, or pre-warmed cached blobs. Every byte is transferred over an active TCP/QUIC connection.
          </p>
        </div>

        <div className="about-card">
          <div className="about-card-icon text-purple">
            <Cpu size={22} />
          </div>
          <h3 className="about-card-title">Incompressible Payloads</h3>
          <p className="about-card-text">
            Standard web speedtests often transmit compressible zeros or repeated text, which intermediate proxies and browsers compress via gzip or Brotli, reporting artificially inflated numbers. SpeedX streams high-entropy cryptographic binary payloads.
          </p>
        </div>

        <div className="about-card">
          <div className="about-card-icon text-green">
            <Network size={22} />
          </div>
          <h3 className="about-card-title">Multi-Stream Architecture</h3>
          <p className="about-card-text">
            To accurately saturate high-capacity connections without single-thread browser event loop choking, SpeedX dispatches parallel chunk streams while smoothing instantaneous variations via sliding-window exponential moving averages.
          </p>
        </div>

        <div className="about-card">
          <div className="about-card-icon text-amber">
            <BarChart3 size={22} />
          </div>
          <h3 className="about-card-title">RFC 3550 Latency & Jitter</h3>
          <p className="about-card-text">
            Latency variation (jitter) is calculated using the official RFC 3550 telecommunications formula, measuring the mean absolute difference between successive round-trip times to evaluate voice and gaming packet reliability.
          </p>
        </div>

        <div className="about-card">
          <div className="about-card-icon text-white">
            <Layers size={22} />
          </div>
          <h3 className="about-card-title">Cloudflare Edge Anycast</h3>
          <p className="about-card-text">
            SpeedX tests your direct link to Cloudflare’s 300+ data center cities worldwide. It isolates the performance of your local ISP "last mile" from distant internet transit bottlenecks.
          </p>
        </div>

        <div className="about-card">
          <div className="about-card-icon text-cyan">
            <ShieldCheck size={22} />
          </div>
          <h3 className="about-card-title">Zero Tracking Privacy</h3>
          <p className="about-card-text">
            We never inspect personal browsing packets, sell user profiles, or inject advertising trackers. Test results are stored pseudonymously and can be cleared at any time.
          </p>
        </div>
      </div>

      <div className="tech-stack-card">
        <h3 className="stack-title">EDGE INFRASTRUCTURE STACK</h3>
        <div className="stack-tags">
          <span className="stack-badge">Cloudflare Workers</span>
          <span className="stack-badge">Cloudflare R2 Storage</span>
          <span className="stack-badge">Cloudflare D1 SQL</span>
          <span className="stack-badge">Cloudflare Pages</span>
          <span className="stack-badge">React 19 + Vite</span>
          <span className="stack-badge">RFC 3550 Standard</span>
        </div>
      </div>
    </div>
  );
}
