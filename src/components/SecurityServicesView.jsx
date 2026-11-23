import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Terminal, Eye, Cloud, Zap, FileCheck,
  CheckCircle, Clock, Activity, PlayCircle, ShieldAlert, ServerOff
} from 'lucide-react';

import { PageHeader, RadialGauge } from './ui.jsx';

const SERVICE_ICONS = {
  'vuln-assessment': { icon: ShieldCheck, color: '#00ffd5' },
  'pen-testing': { icon: Terminal, color: '#ff9100' },
  'sec-monitoring': { icon: Eye, color: '#00b0ff' },
  'cloud-sec': { icon: Cloud, color: '#00e676' },
  'incident-resp': { icon: Zap, color: '#ff1744' },
  'compliance-audit': { icon: FileCheck, color: '#a855f7' },
};

const RECENT_ACTIVITY = [
  { text: 'Vulnerability scan completed', time: '2 min ago', icon: CheckCircle, color: '#00e676' },
  { text: 'Suspicious login attempt blocked', time: '12 min ago', icon: ShieldAlert, color: '#00b0ff' },
  { text: 'Malware detected and quarantined', time: '29 min ago', icon: ShieldAlert, color: '#ff1744' },
];

const statusBadgeClass = (status) =>
  status === 'ACTIVE' || status === 'ONLINE' ? 'badge-active'
    : status === 'SCHEDULED' ? 'badge-high'
      : 'badge-medium';

export default function SecurityServicesView() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggeringId, setTriggeringId] = useState(null);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => { if (data.success) setServices(data.services); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleTrigger = (id) => {
    setTriggeringId(id);
    fetch(`/api/services/${id}/trigger`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setTriggeringId(null);
        if (data.success) setServices(prev => prev.map(s => s.id === id ? data.service : s));
      })
      .catch(() => setTriggeringId(null));
  };

  const activeCount = services.filter(s => s.status === 'ACTIVE' || s.status === 'ONLINE').length;
  const scheduledCount = services.filter(s => s.status === 'SCHEDULED').length;
  const readyCount = services.filter(s => s.status === 'READY' || s.status === 'IN_PROGRESS').length;

  const summaryCards = [
    { label: 'Total Services', value: services.length || 6, icon: Activity, color: '#00ffd5' },
    { label: 'Active Services', value: activeCount || 4, icon: CheckCircle, color: '#00e676' },
    { label: 'Scheduled', value: scheduledCount || 1, icon: Clock, color: '#ff9100' },
    { label: 'Ready / Standby', value: readyCount || 1, icon: Zap, color: '#00b0ff' },
  ];

  return (
    <div className="view-stack">
      <PageHeader
        eyebrow="Module 01 · Managed Defense"
        icon={ShieldCheck}
        title="SECURITY SERVICES"
        subtitle="Comprehensive security services to protect your digital assets and infrastructure."
      />

      {/* Summary */}
      <div className="metrics-grid metric-grid-4 animate-in animate-in-delay-1">
        {summaryCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="metric-card" style={{ '--c': card.color }}>
              <div className="metric-icon-wrap"><Icon size={19} /></div>
              <div>
                <div className="metric-value">{String(card.value).padStart(2, '0')}</div>
                <div className="metric-label">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Services */}
      <section className="animate-in animate-in-delay-2">
        <div className="section-label">OUR SERVICES</div>

        {loading ? (
          <div className="service-grid">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" />)}
          </div>
        ) : services.length === 0 ? (
          <div className="card empty-state">
            <ServerOff size={26} />
            <strong style={{ color: 'var(--text-strong)' }}>Service registry unavailable</strong>
            <span>Start the SOC API server (<span className="mono">npm run dev</span>) to load managed services.</span>
          </div>
        ) : (
          <div className="service-grid">
            {services.map((s, idx) => {
              const meta = SERVICE_ICONS[s.id] || { icon: ShieldCheck, color: '#00ffd5' };
              const Icon = meta.icon;
              return (
                <article
                  key={s.id}
                  className="card hud service-card"
                  style={{ '--svc': meta.color, animation: `fadeInUp 0.5s var(--ease-out) ${idx * 0.05}s both` }}
                >
                  <div className="service-glow" aria-hidden="true" />
                  <div style={{ position: 'relative' }}>
                    <div className="service-head">
                      <div style={{ display: 'flex', gap: '13px', minWidth: 0 }}>
                        <div className="service-icon"><Icon size={22} /></div>
                        <div style={{ minWidth: 0 }}>
                          <h3 className="service-title">{s.title}</h3>
                          <p className="service-desc">{s.description}</p>
                        </div>
                      </div>
                      <span className={`badge ${statusBadgeClass(s.status)}`}>{s.badge}</span>
                    </div>

                    {s.progress !== undefined && (
                      <div style={{ marginTop: '18px' }}>
                        <div className="kv-line" style={{ marginTop: 0, marginBottom: '6px' }}>
                          <span>Progress</span>
                          <strong style={{ color: 'var(--text-strong)' }}>{s.progress}%</strong>
                        </div>
                        <div className="progress"><div style={{ width: `${s.progress}%` }} /></div>
                      </div>
                    )}

                    {s.nextRun && (
                      <div className="kv-line"><span>Next run</span><strong style={{ color: '#ff9100' }}>{s.nextRun}</strong></div>
                    )}
                    {s.uptime && (
                      <div className="kv-line"><span>Uptime</span><strong style={{ color: '#00e676' }}>{s.uptime}</strong></div>
                    )}
                    {s.compliance && (
                      <div className="kv-line"><span>Compliance</span><strong style={{ color: 'var(--accent-cyan)' }}>{s.compliance}</strong></div>
                    )}
                  </div>

                  <div className="service-foot">
                    <span>LAST RUN · {s.lastRun}</span>
                    <button className="btn-cyber-outline" onClick={() => handleTrigger(s.id)} disabled={triggeringId === s.id}>
                      <PlayCircle size={13} className={triggeringId === s.id ? 'spin' : undefined} />
                      {triggeringId === s.id ? 'Running...' : 'Run Scan'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom */}
      <div className="grid-2-1 animate-in animate-in-delay-3">
        <section className="card">
          <div className="card-title">
            <span className="card-title-left"><Activity size={14} /> RECENT SECURITY ACTIVITY</span>
            <span className="card-title-meta">LAST 30 MIN</span>
          </div>
          <div className="stack-sm">
            {RECENT_ACTIVITY.map((item, i) => {
              const EIcon = item.icon;
              return (
                <div key={i} className="event-row">
                  <span className="event-icon" style={{ '--c': item.color }}><EIcon size={14} /></span>
                  <span className="event-text">{item.text}</span>
                  <span className="event-time">{item.time}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card hud" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="card-title" style={{ alignSelf: 'stretch' }}>
            <span className="card-title-left"><CheckCircle size={14} /> SERVICE STATUS</span>
          </div>
          <RadialGauge value={98.4} decimals={1} size={150} label="SOC HEALTH" />
          <div className="muted" style={{ fontSize: '12px', marginTop: '10px' }}>Overall SOC health across all services</div>
        </section>
      </div>
    </div>
  );
}
