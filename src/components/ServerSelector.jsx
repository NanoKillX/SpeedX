import React from 'react';
import { Server, Globe, Cpu, ShieldCheck, MapPin } from 'lucide-react';

export default function ServerSelector({ serverInfo }) {
  return (
    <div className="connection-info-card">
      <div className="connection-grid">
        {/* Client Connection */}
        <div className="conn-block client-block">
          <div className="conn-title">
            <Globe size={16} className="conn-icon text-cyan" />
            <span>CLIENT CONNECTION</span>
          </div>
          <div className="conn-details">
            <div className="conn-row">
              <span className="conn-label">ISP:</span>
              <span className="conn-value highlight">{serverInfo.isp || 'Detecting ISP...'}</span>
            </div>
            <div className="conn-row">
              <span className="conn-label">IP Address:</span>
              <span className="conn-value code-font">{serverInfo.ip || '---'}</span>
            </div>
            <div className="conn-row">
              <span className="conn-label">Location:</span>
              <span className="conn-value">{serverInfo.location || 'Detecting location...'}</span>
            </div>
          </div>
        </div>

        {/* Server Endpoint */}
        <div className="conn-block server-block">
          <div className="conn-title">
            <Server size={16} className="conn-icon text-orange" />
            <span>TEST SERVER ENDPOINT</span>
          </div>
          <div className="conn-details">
            <div className="conn-row">
              <span className="conn-label">Target:</span>
              <span className="conn-value highlight">Cloudflare Global Anycast</span>
            </div>
            <div className="conn-row">
              <span className="conn-label">Nearest PoP:</span>
              <span className="conn-value badge-colo">{serverInfo.colo || 'EDGE'}</span>
            </div>
            <div className="conn-row">
              <span className="conn-label">Security:</span>
              <span className="conn-value text-green">
                <ShieldCheck size={13} className="inline-icon" /> TLS 1.3 / HTTP 2+3
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="edge-note">
        <Cpu size={14} className="edge-note-icon" />
        <span>
          NHubX SpeedX tests your direct link to Cloudflare's closest edge data center, measuring maximum unthrottled line capacity and baseline transport latency.
        </span>
      </div>
    </div>
  );
}
