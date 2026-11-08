import React, { useState } from 'react';
import { Server, Globe, Cpu, ShieldCheck, Copy, Check } from 'lucide-react';

export default function ServerSelector({ serverInfo }) {
  const [copied, setCopied] = useState(false);

  const handleCopyIp = () => {
    if (!serverInfo.ip) return;
    navigator.clipboard.writeText(serverInfo.ip).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="connection-info-card">
      <div className="connection-grid">
        {/* Client Connection Block */}
        <div className="conn-block client-block">
          <div className="conn-title-row">
            <div className="conn-title">
              <Globe size={16} className="conn-icon text-cyan" />
              <span>YOUR NETWORK & IP</span>
            </div>
            {serverInfo.ip && (
              <button className="mini-ip-btn" onClick={handleCopyIp} title="Copy your IP">
                {copied ? <Check size={12} className="text-green" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy IP'}</span>
              </button>
            )}
          </div>
          <div className="conn-details">
            <div className="conn-row">
              <span className="conn-label">Public IP:</span>
              <span className="conn-value code-font ip-tag">{serverInfo.ip || 'Detecting...'}</span>
            </div>
            <div className="conn-row">
              <span className="conn-label">ISP:</span>
              <span className="conn-value highlight">{serverInfo.isp || 'Detecting ISP...'}</span>
            </div>
            <div className="conn-row">
              <span className="conn-label">Location:</span>
              <span className="conn-value">{serverInfo.location || 'Detecting location...'}</span>
            </div>
          </div>
        </div>

        {/* Server Endpoint Block */}
        <div className="conn-block server-block">
          <div className="conn-title-row">
            <div className="conn-title">
              <Server size={16} className="conn-icon text-orange" />
              <span>TEST SERVER ENDPOINT</span>
            </div>
            <span className="verified-pill">
              <ShieldCheck size={12} /> Verified
            </span>
          </div>
          <div className="conn-details">
            <div className="conn-row">
              <span className="conn-label">Network:</span>
              <span className="conn-value highlight">Cloudflare Edge Anycast</span>
            </div>
            <div className="conn-row">
              <span className="conn-label">Closest PoP:</span>
              <span className="conn-value badge-colo">{serverInfo.colo || 'EDGE'}</span>
            </div>
            <div className="conn-row">
              <span className="conn-label">Protocol:</span>
              <span className="conn-value text-green">HTTP/2 + HTTP/3 (TLS 1.3)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
