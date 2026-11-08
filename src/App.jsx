import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import HistoryPage from './pages/History';
import AboutPage from './pages/About';
import { useSpeedTest } from './hooks/useSpeedTest';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const speedTest = useSpeedTest();

  return (
    <div className="speedx-app">
      {/* Background ambient lighting blobs */}
      <div className="ambient-blob blob-orange"></div>
      <div className="ambient-blob blob-purple"></div>
      <div className="ambient-blob blob-cyan"></div>

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serverColo={speedTest.serverInfo.colo}
      />

      <main className="main-content">
        {activeTab === 'home' && (
          <Home
            status={speedTest.status}
            progress={speedTest.progress}
            currentSpeed={speedTest.currentSpeed}
            metrics={speedTest.metrics}
            graphData={speedTest.graphData}
            serverInfo={speedTest.serverInfo}
            errorMsg={speedTest.errorMsg}
            startTest={speedTest.startTest}
            stopTest={speedTest.stopTest}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            history={speedTest.history}
            onClear={speedTest.clearHistory}
            onRunNewTest={() => {
              setActiveTab('home');
              speedTest.startTest();
            }}
          />
        )}

        {activeTab === 'about' && <AboutPage />}
      </main>

      <Footer />
    </div>
  );
}
