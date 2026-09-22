import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Skull, Crosshair, Server, AlertTriangle,
  ExternalLink, ArrowUpRight, ArrowDownRight, Activity, Radio,
  TrendingUp, Eye, Zap, Globe
} from 'lucide-react';

import ConstellationThreatMap from './ConstellationThreatMap.jsx';
import ThreatLevelGauge from './ThreatLevelGauge.jsx';

export default function DashboardView({ onNavigate }) {
  const [data, setData] = useState(null);
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard/summary')
      .then(res => res.json())
      .then(resData => { if (resData.success) setData(resData); })
      .catch(() => {});
  }, []);

  const statsCards = [
    {
      id: 'score', label: 'Security Score', value: '86%',
      icon: ShieldCheck, color: '#00e676', bg: 'rgba(0, 230, 118, 0.08)',
      trend: '+2.4%', trendUp: true
    },
    {
      id: 'critical', label: 'Critical Vulns', value: '04',
      icon: Skull, color: '#ff1744', bg: 'rgba(255, 23, 68, 0.08)',
      trend: '-12%', trendUp: false
    },
    {
      id: 'threats', label: 'Active Threats', value: '03',
      icon: Crosshair, color: '#ff9100', bg: 'rgba(255, 145, 0, 0.08)',
      trend: '+1', trendUp: true
    },
    {
      id: 'assets', label: 'Protected Assets', value: '248',
      icon: Server, color: '#00b0ff', bg: 'rgba(0, 176, 255, 0.08)',
      trend: '+18', trendUp: true
    },
    {
      id: 'incidents', label: 'Security Incidents', value: '02',
      icon: AlertTriangle, color: '#ff1744', bg: 'rgba(255, 23, 68, 0.08)',
      trend: '-33%', trendUp: false
    }
  ];

  const newsCards = [
    { id: 1, title: 'Zero-Day Exploit Found in Enterprise VPN', source: 'CyberWire', time: '1h ago', severity: 'CRITICAL' },
    { id: 2, title: 'New Ransomware Variant Targets Healthcare', source: 'ThreatPost', time: '2h ago', severity: 'HIGH' },
    { id: 3, title: 'Critical RCE in Apache Struts Disclosed', source: 'NVD', time: '3h ago', severity: 'CRITICAL' },
    { id: 4, title: 'State-Sponsored APT Campaign Detected', source: 'Mandiant', time: '4h ago', severity: 'HIGH' },
    { id: 5, title: 'Supply Chain Attack on NPM Registry', source: 'Snyk', time: '5h ago', severity: 'MEDIUM' },
  ];

  const recentEvents = [
    { text: 'Vulnerability scan completed on prod cluster', time: '2 min ago', color: '#00e676', icon: ShieldCheck },
    { text: 'Suspicious login blocked from 194.28.x.x', time: '12 min ago', color: '#ff9100', icon: Eye },
    { text: 'Malware signature updated (v4.2.847)', time: '29 min ago', color: '#00b0ff', icon: Zap },
    { text: 'DDoS mitigation activated on edge nodes', time: '1h ago', color: '#ff1744', icon: Globe },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Page Header */}
      <div className="animate-in">
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: '20px',
          fontWeight: 800, color: '#fff', letterSpacing: '2px'
        }}>
          SECURITY COMMAND CENTER
        </h1>
        <p style={{ fontSize: '12px', color: '#5a6577', marginTop: '4px' }}>
          Real-time security posture overview. Monitor, detect, and respond to threats.
        </p>
      </div>

      {/* ─── STATS OVERVIEW CARDS ─── */}
      <div className="overview-grid animate-in animate-in-delay-1">
        {statsCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className="overview-card"
              onMouseEnter={() => setActiveCard(card.id)}
              onMouseLeave={() => setActiveCard(null)}
              style={{
                borderColor: activeCard === card.id ? `${card.color}33` : undefined,
                animationDelay: `${i * 0.05}s`
              }}
            >
              <div className="overview-icon" style={{ background: card.bg, color: card.color }}>
                <Icon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <div className="overview-value" style={{ color: card.color }}>{card.value}</div>
                  {card.trend && (
                    <span style={{
                      fontSize: '10px', fontFamily: 'var(--font-mono)',
                      fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px',
                      color: card.trendUp ? (card.id === 'threats' || card.id === 'critical' ? '#ff1744' : '#00e676') :
                        (card.id === 'threats' || card.id === 'critical' || card.id === 'incidents' ? '#00e676' : '#ff1744')
                    }}>
                      {card.trendUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                      {card.trend}
                    </span>
                  )}
                </div>
                <div className="overview-label">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── MAIN 3-COLUMN LAYOUT ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr', gap: '16px' }}>

        {/* Column 1: Live Threat Monitor */}
        <div className="card animate-in animate-in-delay-2" style={{
          display: 'flex', flexDirection: 'column', gap: '16px'
        }}>
          <div className="card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={13} style={{ color: 'var(--status-success)' }} />
              LIVE THREAT MONITOR
            </span>
            <span style={{
              fontSize: '10px', color: 'var(--status-success)',
              fontFamily: 'var(--font-mono)', fontWeight: 500
            }}>REALTIME</span>
          </div>

          <ConstellationThreatMap />
          <ThreatLevelGauge level="MEDIUM" />

          {/* Recent Events */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
            {recentEvents.map((event, i) => {
              const EIcon = event.icon;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '8px', fontSize: '11.5px',
                  border: '1px solid var(--border-dim)',
                  transition: 'all 0.2s', cursor: 'default'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c8d0dc' }}>
                    <EIcon size={13} style={{ color: event.color, flexShrink: 0 }} />
                    {event.text}
                  </span>
                  <span style={{
                    fontSize: '10px', color: '#3d4a5c',
                    fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', marginLeft: '12px'
                  }}>{event.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Column 2: Vulnerability + Services + Threat Intel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Vulnerability Overview */}
          <div className="card animate-in animate-in-delay-3">
            <div className="card-title">VULNERABILITY OVERVIEW</div>
            {[
              { label: 'Critical', pct: 30, color: '#ff1744', gradient: 'linear-gradient(90deg, #ff1744, #ff5252)' },
              { label: 'High', pct: 40, color: '#ff9100', gradient: 'linear-gradient(90deg, #ff9100, #ffb74d)' },
              { label: 'Medium', pct: 20, color: '#00b0ff', gradient: 'linear-gradient(90deg, #00b0ff, #4fc3f7)' },
              { label: 'Low', pct: 10, color: '#00e676', gradient: 'linear-gradient(90deg, #00e676, #69f0ae)' },
            ].map((bar, i) => (
              <div key={i} className="vuln-bar-wrapper">
                <div className="vuln-bar-info">
                  <span style={{ color: bar.color, fontWeight: 600, fontSize: '12px' }}>{bar.label}</span>
                  <span style={{ color: '#8a95a8', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{bar.pct}%</span>
                </div>
                <div className="vuln-bar-track">
                  <div className="vuln-bar-fill" style={{
                    width: `${bar.pct}%`, background: bar.gradient
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Security Services */}
          <div className="card animate-in animate-in-delay-4">
            <div className="card-title">SECURITY SERVICES</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { name: 'Vulnerability Assessment', status: 'ACTIVE', color: '#00e676' },
                { name: 'Penetration Testing', status: 'SCHEDULED', color: '#ff9100' },
                { name: 'Security Monitoring', status: 'ONLINE', color: '#00e676' },
                { name: 'Cloud Security', status: 'ONLINE', color: '#00e676' },
                { name: 'Incident Response', status: 'READY', color: '#00b0ff' },
              ].map((svc, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: '12px', padding: '6px 0',
                  borderBottom: i < 4 ? '1px solid var(--border-dim)' : 'none'
                }}>
                  <span style={{ color: '#c8d0dc', fontWeight: 500 }}>{svc.name}</span>
                  <span style={{
                    color: svc.color, fontWeight: 700, fontSize: '10px',
                    fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                    <span style={{
                      width: '5px', height: '5px', borderRadius: '50%',
                      background: svc.color, boxShadow: `0 0 6px ${svc.color}`,
                      display: 'inline-block'
                    }} />
                    {svc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Threat Intelligence */}
          <div className="card animate-in animate-in-delay-5">
            <div className="card-title">THREAT INTELLIGENCE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11.5px' }}>
              {[
                { label: 'New CVEs', value: 'CVE-2024-1234, CVE-2024-5678', color: '#ff1744' },
                { label: 'Critical Vulns', value: 'Log4Shell variant detected', color: '#ff9100' },
                { label: 'Active Malware', value: 'AgentTesla, Emotet', color: '#00b0ff' },
                { label: 'Ransomware', value: 'LockBit, BlackCat campaigns', color: '#00e676' },
                { label: 'Advisories', value: 'Patch Tuesday - 12 critical', color: '#a855f7' },
              ].map((intel, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ color: intel.color, fontWeight: 700, whiteSpace: 'nowrap' }}>{intel.label}:</span>
                  <span style={{ color: '#5a6577' }}>{intel.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Live Cyber News */}
        <div className="card animate-in animate-in-delay-4" style={{
          display: 'flex', flexDirection: 'column', gap: '10px',
          maxHeight: '600px', overflowY: 'auto'
        }}>
          <div className="card-title">
            <span>LIVE CYBER NEWS</span>
            <Activity size={13} style={{ color: 'var(--accent-cyan)' }} />
          </div>

          {newsCards.map((item, i) => (
            <div key={item.id} style={{
              background: 'rgba(4, 8, 16, 0.6)', padding: '14px',
              borderRadius: '10px', border: '1px solid var(--border-dim)',
              display: 'flex', flexDirection: 'column', gap: '8px',
              transition: 'all 0.2s', cursor: 'pointer'
            }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.background = 'rgba(8, 14, 26, 0.8)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = 'var(--border-dim)';
                e.currentTarget.style.background = 'rgba(4, 8, 16, 0.6)';
              }}
              onClick={() => onNavigate && onNavigate('threat-intel')}
            >
              <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.4 }}>
                {item.title}
              </h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '10px', color: '#3d4a5c',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {item.source} • {item.time}
                </span>
                <span className={`badge badge-${item.severity === 'CRITICAL' ? 'critical' : item.severity === 'HIGH' ? 'high' : 'medium'}`}>
                  {item.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── BOTTOM STATUS BAR ─── */}
      <div className="bottom-status-bar animate-in animate-in-delay-5">
        <div className="status-item">
          <span className="status-dot-green" /> ZEROLOCK ENGINE
        </div>
        <div style={{ color: '#1a202c' }}>•</div>
        <div className="status-item">
          NETWORK <span style={{ color: 'var(--status-success)', fontWeight: 700, marginLeft: '4px' }}>ONLINE</span>
        </div>
        <div style={{ color: '#1a202c' }}>•</div>
        <div className="status-item">
          THREAT MONITOR <span style={{ color: 'var(--status-success)', fontWeight: 700, marginLeft: '4px' }}>ACTIVE</span>
        </div>
        <div style={{ color: '#1a202c' }}>•</div>
        <div className="status-item">
          INTEL FEED <span style={{ color: 'var(--status-success)', fontWeight: 700, marginLeft: '4px' }}>CONNECTED</span>
        </div>
      </div>
    </div>
  );
}
