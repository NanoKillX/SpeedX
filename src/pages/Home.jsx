import React from 'react';
import Speedometer from '../components/Speedometer';
import MetricCards from '../components/MetricCard';
import SpeedGraph from '../components/SpeedGraph';
import ServerSelector from '../components/ServerSelector';
import ResultModal from '../components/ResultModal';

export default function Home({
  status,
  progress,
  currentSpeed,
  metrics,
  graphData,
  serverInfo,
  errorMsg,
  startTest,
  stopTest,
}) {
  return (
    <div className="home-page">
      {/* Hero Heading */}
      <section className="hero-section">
        <h1 className="hero-title">
          INTERNET SPEED <span className="hero-highlight">BENCHMARK</span>
        </h1>
        <p className="hero-subtitle">
          Real-time, zero-simulation edge bandwidth & latency testing. Powered by Cloudflare Anycast.
        </p>
      </section>

      {/* Error alert banner if any */}
      {errorMsg && (
        <div className="error-banner">
          <span>{errorMsg}</span>
          <button className="error-retry-btn" onClick={startTest}>Retry</button>
        </div>
      )}

      {/* Main Gauge Section */}
      <section className="gauge-section">
        <Speedometer
          speed={currentSpeed}
          status={status}
          progress={progress}
          onStart={startTest}
          onStop={stopTest}
        />
      </section>

      {/* 4 Core Metrics Grid */}
      <section className="metrics-section">
        <MetricCards metrics={metrics} status={status} />
      </section>

      {/* When completed, show the Result Summary Card */}
      {status === 'completed' && (
        <section className="results-section">
          <ResultModal
            metrics={metrics}
            serverInfo={serverInfo}
            onReset={startTest}
          />
        </section>
      )}

      {/* Live Speed Area Graph */}
      <section className="graph-section">
        <SpeedGraph data={graphData} />
      </section>

      {/* Server & Client Connection Panel */}
      <section className="server-section">
        <ServerSelector serverInfo={serverInfo} />
      </section>
    </div>
  );
}
