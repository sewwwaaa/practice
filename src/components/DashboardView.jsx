import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Skull, Crosshair, Server, AlertTriangle,
  ExternalLink, ArrowUpRight, ArrowDownRight, Activity, Radio,
  Eye, Zap, Globe, RotateCw, Play, Satellite, Bug, Newspaper
} from 'lucide-react';

import ConstellationThreatMap from './ConstellationThreatMap.jsx';
import ThreatLevelGauge from './ThreatLevelGauge.jsx';
import { RadialGauge, Sparkline, useCountUp } from './ui.jsx';

const SEVERITY_COLORS = {
  CRITICAL: '#ff1744',
  HIGH: '#ff9100',
  MEDIUM: '#00b0ff',
  LOW: '#00e676',
};

const FALLBACK_NEWS = [
  { id: 1, title: 'Zero-Day Exploit Found in Enterprise VPN', source: 'CyberWire', time: '1h ago', severity: 'CRITICAL' },
  { id: 2, title: 'New Ransomware Variant Targets Healthcare', source: 'ThreatPost', time: '2h ago', severity: 'HIGH' },
  { id: 3, title: 'Critical RCE in Apache Struts Disclosed', source: 'NVD', time: '3h ago', severity: 'CRITICAL' },
  { id: 4, title: 'State-Sponsored APT Campaign Detected', source: 'Mandiant', time: '4h ago', severity: 'HIGH' },
  { id: 5, title: 'Supply Chain Attack on NPM Registry', source: 'Snyk', time: '5h ago', severity: 'MEDIUM' },
];

const RECENT_EVENTS = [
  { text: 'Vulnerability scan completed on prod cluster', time: '2 min ago', color: '#00e676', icon: ShieldCheck },
  { text: 'Suspicious login blocked from 194.28.x.x', time: '12 min ago', color: '#ff9100', icon: Eye },
  { text: 'Malware signature updated (v4.2.847)', time: '29 min ago', color: '#00b0ff', icon: Zap },
  { text: 'DDoS mitigation activated on edge nodes', time: '1h ago', color: '#ff1744', icon: Globe },
];

const SERVICES = [
  { name: 'Vulnerability Assessment', status: 'ACTIVE', color: '#00e676' },
  { name: 'Penetration Testing', status: 'SCHEDULED', color: '#ff9100' },
  { name: 'Security Monitoring', status: 'ONLINE', color: '#00e676' },
  { name: 'Cloud Security', status: 'ONLINE', color: '#00e676' },
  { name: 'Incident Response', status: 'READY', color: '#00b0ff' },
];

const INTEL = [
  { label: 'New CVEs', value: 'CVE-2024-1234, CVE-2024-5678', color: '#ff1744' },
  { label: 'Critical Vulns', value: 'Log4Shell variant detected', color: '#ff9100' },
  { label: 'Active Malware', value: 'AgentTesla, Emotet', color: '#00b0ff' },
  { label: 'Ransomware', value: 'LockBit, BlackCat campaigns', color: '#00e676' },
  { label: 'Advisories', value: 'Patch Tuesday - 12 critical', color: '#a855f7' },
];

const formatChange = (n, fallback) =>
  typeof n === 'number' ? `${n > 0 ? '+' : ''}${n}%` : fallback;

const greetingFor = (hour) =>
  hour < 5 ? 'Night watch' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

const openExternal = (url) => window.open(url, '_blank', 'noopener,noreferrer');

function KpiCard({ label, value, suffix, pad, trend, higherIsBetter, icon: Icon, color, spark, delay }) {
  const counted = useCountUp(value);
  const shown = pad && typeof counted === 'number' ? String(counted).padStart(2, '0') : counted;
  const isUp = !String(trend).startsWith('-');
  const isGood = isUp === higherIsBetter;

  return (
    <div className="kpi-card animate-in" style={{ '--kpi': color, animationDelay: `${delay}s` }}>
      <div className="kpi-head">
        <span className="kpi-icon"><Icon size={15} /></span>
        <span className="kpi-label">{label}</span>
        <span className={`kpi-trend ${isGood ? 'is-good' : 'is-bad'}`}>
          {isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          {trend}
        </span>
      </div>
      <div className="kpi-value">
        {shown}{suffix && <small>{suffix}</small>}
      </div>
      <Sparkline data={spark} color={color} />
    </div>
  );
}

export default function DashboardView({ onNavigate, currentUser }) {
  const [data, setData] = useState(null);
  const [liveNews, setLiveNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsLastSync, setNewsLastSync] = useState(null);

  const fetchLiveNews = (force = false) => {
    setNewsLoading(true);
    fetch(`/api/news/live${force ? '?refresh=true' : ''}`)
      .then(res => res.json())
      .then(result => {
        if (result.success && result.news && result.news.length > 0) {
          setLiveNews(result.news);
          setNewsLastSync(result.syncedAt || new Date().toLocaleTimeString());
        }
      })
      .catch(err => console.error('Live news error:', err))
      .finally(() => setNewsLoading(false));
  };

  useEffect(() => {
    fetch('/api/dashboard/summary')
      .then(res => res.json())
      .then(resData => { if (resData.success) setData(resData); })
      .catch(() => {});

    fetchLiveNews();
  }, []);

  const m = data?.metrics || {};
  const score = m.securityScore ?? 86;
  const activeThreats = m.activeThreats ?? 3;
  const protectedAssets = m.protectedAssets ?? 248;

  const kpis = [
    {
      id: 'score', label: 'Security Score', value: score, suffix: '%',
      trend: formatChange(m.scoreChange, '+2.4%'), higherIsBetter: true,
      icon: ShieldCheck, color: '#00e676', spark: [71, 74, 72, 77, 79, 78, 82, 84, score]
    },
    {
      id: 'critical', label: 'Critical Vulns', value: m.criticalVulnerabilities ?? 4, pad: true,
      trend: formatChange(m.vulnChange, '-12%'), higherIsBetter: false,
      icon: Skull, color: '#ff1744', spark: [9, 8, 8, 7, 6, 7, 5, 5, 4]
    },
    {
      id: 'threats', label: 'Active Threats', value: activeThreats, pad: true,
      trend: formatChange(m.threatsChange, '+1'), higherIsBetter: false,
      icon: Crosshair, color: '#ff9100', spark: [2, 4, 3, 2, 3, 5, 2, 2, 3]
    },
    {
      id: 'assets', label: 'Protected Assets', value: protectedAssets,
      trend: formatChange(m.assetsChange, '+18'), higherIsBetter: true,
      icon: Server, color: '#00b0ff', spark: [196, 204, 210, 214, 222, 229, 236, 240, 248]
    },
    {
      id: 'incidents', label: 'Security Incidents', value: m.securityIncidents ?? 2, pad: true,
      trend: formatChange(m.incidentsChange, '-33%'), higherIsBetter: false,
      icon: AlertTriangle, color: '#a855f7', spark: [6, 5, 6, 4, 4, 3, 3, 2, 2]
    }
  ];

  const vc = data?.vulnerabilitiesCount || { critical: 4, high: 12, medium: 18, low: 8 };
  const vulnBreakdown = [
    { label: 'Critical', count: vc.critical || 0, color: '#ff1744' },
    { label: 'High', count: vc.high || 0, color: '#ff9100' },
    { label: 'Medium', count: vc.medium || 0, color: '#00b0ff' },
    { label: 'Low', count: vc.low || 0, color: '#00e676' },
  ];
  const vulnTotal = vulnBreakdown.reduce((sum, v) => sum + v.count, 0) || 1;

  const now = new Date();
  const operator = currentUser?.username || 'Operator';
  const news = liveNews.length > 0 ? liveNews : FALLBACK_NEWS;

  return (
    <div className="view-stack">

      {/* ─── HERO ─── */}
      <section className="hero animate-in">
        <div className="hero-grid-bg" aria-hidden="true" />
        <div className="hero-scan" aria-hidden="true" />

        <div className="hero-main">
          <div className="page-eyebrow">
            Operator Console · {now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h1 className="hero-title">
            {greetingFor(now.getHours())}, <span className="text-gradient">{operator}</span>
          </h1>
          <p className="hero-sub">
            ZEROLOCK is guarding <strong>{protectedAssets} protected assets</strong> across 12 mesh nodes.{' '}
            <span className="danger">{activeThreats} active threats</span> currently require analyst attention.
          </p>

          <div className="hero-actions">
            <button className="btn-cyber" onClick={() => onNavigate?.('vuln')}>
              <Play size={14} /> Run Scan
            </button>
            <button className="btn-ghost" onClick={() => onNavigate?.('threat-intel')}>
              <Globe size={15} /> Threat Intel
            </button>
            <button className="btn-ghost btn-danger" onClick={() => onNavigate?.('news')}>
              <Satellite size={15} /> Breach Map
            </button>
          </div>

          <div className="hero-meta">
            <div><span>UPTIME</span><strong>99.98%</strong></div>
            <div><span>MEAN TIME TO RESPOND</span><strong>14m</strong></div>
            <div><span>EVENTS / 24H</span><strong>1.2M</strong></div>
            <div><span>ATTACKS BLOCKED</span><strong>8,421</strong></div>
          </div>
        </div>

        <div className="hero-gauge">
          <RadialGauge value={score} size={184} label="SECURITY SCORE" sublabel="▲ posture improving" />
          <div className="hero-gauge-caption">
            <span className="live-dot" /> LIVE POSTURE ANALYSIS
          </div>
        </div>
      </section>

      {/* ─── KPI CARDS ─── */}
      <div className="kpi-grid">
        {kpis.map((k, i) => <KpiCard key={k.id} {...k} delay={0.05 + i * 0.05} />)}
      </div>

      {/* ─── MAIN GRID ─── */}
      <div className="dash-grid">

        {/* Live Threat Monitor */}
        <section className="card hud dash-monitor animate-in animate-in-delay-2">
          <div className="card-title" style={{ marginBottom: 0 }}>
            <span className="card-title-left">
              <Radio size={14} style={{ color: 'var(--status-success)' }} />
              LIVE THREAT MONITOR
            </span>
            <span className="status-pill">REALTIME</span>
          </div>

          <div className="constellation-wrap">
            <ConstellationThreatMap />
            <span className="constellation-tag">8 TRACKED ACTORS</span>
            <div className="constellation-legend">
              {Object.entries(SEVERITY_COLORS).map(([sev, c]) => (
                <span key={sev} style={{ color: c }}>
                  <i style={{ background: c }} />
                  <span style={{ color: 'var(--text-dim)' }}>{sev}</span>
                </span>
              ))}
            </div>
          </div>

          <ThreatLevelGauge level="ELEVATED" />

          <div className="stack-sm">
            {RECENT_EVENTS.map((event, i) => {
              const EIcon = event.icon;
              return (
                <div key={i} className="event-row">
                  <span className="event-icon" style={{ '--c': event.color }}><EIcon size={14} /></span>
                  <span className="event-text">{event.text}</span>
                  <span className="event-time">{event.time}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Middle column */}
        <div className="stack">
          <section className="card animate-in animate-in-delay-3">
            <div className="card-title">
              <span className="card-title-left"><Bug size={14} /> VULNERABILITY OVERVIEW</span>
              <span className="card-title-meta">{vulnTotal} OPEN</span>
            </div>

            <div className="stack-bar" role="img" aria-label="Vulnerability severity distribution">
              {vulnBreakdown.map(v => (
                <div
                  key={v.label}
                  title={`${v.label}: ${v.count}`}
                  style={{ width: `${(v.count / vulnTotal) * 100}%`, background: v.color, color: v.color }}
                />
              ))}
            </div>

            <div className="legend-grid">
              {vulnBreakdown.map(v => (
                <div key={v.label} className="legend-item" style={{ '--c': v.color }}>
                  <span>{v.label}</span>
                  <span>
                    <strong>{v.count}</strong>
                    <em>{Math.round((v.count / vulnTotal) * 100)}%</em>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="card animate-in animate-in-delay-4">
            <div className="card-title">
              <span className="card-title-left"><ShieldCheck size={14} /> SECURITY SERVICES</span>
              <button className="btn-cyber-outline" onClick={() => onNavigate?.('services')}>Manage</button>
            </div>
            <div>
              {SERVICES.map(svc => (
                <div key={svc.name} className="svc-row">
                  <span>{svc.name}</span>
                  <span className="status-pill" style={{ '--c': svc.color }}>{svc.status}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="card animate-in animate-in-delay-5">
            <div className="card-title">
              <span className="card-title-left"><Activity size={14} /> THREAT INTELLIGENCE</span>
            </div>
            <div className="stack-sm" style={{ gap: '12px' }}>
              {INTEL.map(intel => (
                <div key={intel.label} className="intel-row" style={{ '--c': intel.color }}>
                  <div>
                    <b>{intel.label}</b>
                    <span>{intel.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Live Cyber News */}
        <section className="card dash-news animate-in animate-in-delay-4">
          <div className="card-title" style={{ marginBottom: '4px' }}>
            <span className="card-title-left">
              <Newspaper size={14} />
              LIVE CYBER NEWS
            </span>
            <span className="card-title-left">
              <span className="status-pill" style={{ '--c': 'var(--accent-cyan)' }}>24H</span>
              <button
                className="icon-btn"
                style={{ width: 28, height: 28 }}
                onClick={() => fetchLiveNews(true)}
                title={newsLastSync ? `Last sync ${newsLastSync}` : 'Refresh Google News live feed'}
                aria-label="Refresh news feed"
              >
                <RotateCw size={13} className={newsLoading ? 'spin' : undefined} />
              </button>
            </span>
          </div>

          {news.map((item, i) => {
            const sev = (item.severity || 'MEDIUM').toUpperCase();
            return (
              <article
                key={item.id || i}
                className="news-item"
                style={{ '--sev': SEVERITY_COLORS[sev] || SEVERITY_COLORS.MEDIUM }}
                onClick={() => (item.link ? openExternal(item.link) : onNavigate?.('news'))}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <h4>{item.title}</h4>
                  {item.link && <ExternalLink size={12} style={{ color: 'var(--text-dim)', flexShrink: 0, marginTop: 3 }} />}
                </div>
                <div className="news-item-meta">
                  <span>{item.source} • {item.time}</span>
                  <span className={`badge badge-${sev.toLowerCase()}`}>{sev}</span>
                </div>
              </article>
            );
          })}
        </section>
      </div>

      {/* ─── STATUS BAR ─── */}
      <div className="bottom-status-bar animate-in animate-in-delay-5">
        <div className="status-item"><span className="status-dot-green" /> ZEROLOCK ENGINE</div>
        <div className="status-item">NETWORK <b>ONLINE</b></div>
        <div className="status-item">THREAT MONITOR <b>ACTIVE</b></div>
        <div className="status-item">INTEL FEED <b>CONNECTED</b></div>
        <div className="spacer" />
        <div className="status-item">BUILD v4.2.1{newsLastSync ? ` · LAST SYNC ${newsLastSync}` : ''}</div>
      </div>
    </div>
  );
}
