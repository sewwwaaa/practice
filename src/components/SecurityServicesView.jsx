import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Terminal, Eye, Cloud, Zap, FileCheck,
  CheckCircle, Clock, Activity, PlayCircle
} from 'lucide-react';

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

  const getServiceIcon = (id) => {
    const iconMap = {
      'vuln-assessment': { icon: ShieldCheck, color: 'var(--accent-cyan)' },
      'pen-testing': { icon: Terminal, color: '#ff9100' },
      'sec-monitoring': { icon: Eye, color: '#00b0ff' },
      'cloud-sec': { icon: Cloud, color: '#00e676' },
      'incident-resp': { icon: Zap, color: '#ff1744' },
      'compliance-audit': { icon: FileCheck, color: '#a855f7' },
    };
    return iconMap[id] || { icon: ShieldCheck, color: 'var(--accent-cyan)' };
  };

  const activeCount = services.filter(s => s.status === 'ACTIVE' || s.status === 'ONLINE').length;
  const scheduledCount = services.filter(s => s.status === 'SCHEDULED').length;
  const readyCount = services.filter(s => s.status === 'READY' || s.status === 'IN_PROGRESS').length;

  const summaryCards = [
    { label: 'Total Services', value: services.length || 6, icon: Activity, color: 'var(--accent-cyan)', bg: 'rgba(0, 255, 213, 0.06)' },
    { label: 'Active Services', value: activeCount || 4, icon: CheckCircle, color: '#00e676', bg: 'rgba(0, 230, 118, 0.06)' },
    { label: 'Scheduled', value: scheduledCount || 1, icon: Clock, color: '#ff9100', bg: 'rgba(255, 145, 0, 0.06)' },
    { label: 'Ready / Standby', value: readyCount || 1, icon: Zap, color: '#00b0ff', bg: 'rgba(0, 176, 255, 0.06)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="page-header animate-in">
        <h1 className="page-title">
          <ShieldCheck style={{ color: 'var(--accent-cyan)' }} /> SECURITY SERVICES
        </h1>
        <p className="page-subtitle">
          Comprehensive security services to protect your digital assets and infrastructure.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="metrics-grid animate-in animate-in-delay-1" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="metric-card">
              <div className="metric-icon-wrap" style={{ color: card.color, background: card.bg }}>
                <Icon size={18} />
              </div>
              <div>
                <div className="metric-value" style={{ color: card.color }}>{card.value}</div>
                <div className="metric-label">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Services Grid */}
      <div className="animate-in animate-in-delay-2">
        <div className="card-title" style={{ fontSize: '14px', marginBottom: '16px' }}>OUR SERVICES</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {services.map((s, idx) => {
            const svcIcon = getServiceIcon(s.id);
            const Icon = svcIcon.icon;
            return (
              <div key={s.id} className="card" style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                animation: `fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s both`
              }}>
                <div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '10px',
                        background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-dim)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Icon size={22} style={{ color: svcIcon.color }} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '14px', color: '#e2e8f0', fontWeight: 600 }}>{s.title}</h3>
                        <p style={{ fontSize: '11px', color: '#5a6577', marginTop: '2px' }}>{s.description}</p>
                      </div>
                    </div>
                    <span className={`badge ${s.status === 'ACTIVE' || s.status === 'ONLINE' ? 'badge-active' : s.status === 'SCHEDULED' ? 'badge-high' : 'badge-medium'}`}>
                      {s.badge}
                    </span>
                  </div>

                  {s.progress !== undefined && (
                    <div style={{ marginTop: '16px' }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: '11px', color: '#5a6577', marginBottom: '4px'
                      }}>
                        <span>Progress</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s.progress}%</span>
                      </div>
                      <div style={{
                        width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: '3px', overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${s.progress}%`, height: '100%',
                          background: 'linear-gradient(90deg, var(--accent-cyan), #00b0ff)',
                          transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                        }} />
                      </div>
                    </div>
                  )}

                  {s.nextRun && (
                    <div style={{
                      marginTop: '12px', fontSize: '12px', color: '#5a6577',
                      display: 'flex', justifyContent: 'space-between'
                    }}>
                      <span>Next Run:</span>
                      <span style={{ color: '#ff9100', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{s.nextRun}</span>
                    </div>
                  )}

                  {s.uptime && (
                    <div style={{
                      marginTop: '12px', fontSize: '12px', color: '#5a6577',
                      display: 'flex', justifyContent: 'space-between'
                    }}>
                      <span>Uptime:</span>
                      <span style={{ color: '#00e676', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{s.uptime}</span>
                    </div>
                  )}

                  {s.compliance && (
                    <div style={{
                      marginTop: '12px', fontSize: '12px', color: '#5a6577',
                      display: 'flex', justifyContent: 'space-between'
                    }}>
                      <span>Compliance:</span>
                      <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{s.compliance}</span>
                    </div>
                  )}
                </div>

                <div style={{
                  marginTop: '20px', paddingTop: '14px',
                  borderTop: '1px solid var(--border-dim)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span style={{ fontSize: '11px', color: '#3d4a5c', fontFamily: 'var(--font-mono)' }}>
                    Last: {s.lastRun}
                  </span>
                  <button className="btn-cyber-outline" onClick={() => handleTrigger(s.id)} disabled={triggeringId === s.id}>
                    <PlayCircle size={13} /> {triggeringId === s.id ? 'Running...' : 'Run Scan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }} className="animate-in animate-in-delay-3">
        <div className="card">
          <div className="card-title">RECENT SECURITY ACTIVITY</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { text: 'Vulnerability scan completed', time: '2 min ago', icon: CheckCircle, color: '#00e676' },
              { text: 'Suspicious login attempt blocked', time: '12 min ago', icon: CheckCircle, color: '#00b0ff' },
              { text: 'Malware detected and quarantined', time: '29 min ago', icon: CheckCircle, color: '#ff1744' },
            ].map((item, i) => {
              const EIcon = item.icon;
              return (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '8px', border: '1px solid var(--border-dim)'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c8d0dc', fontSize: '12px' }}>
                    <EIcon size={14} style={{ color: item.color }} /> {item.text}
                  </span>
                  <span style={{ fontSize: '10px', color: '#3d4a5c', fontFamily: 'var(--font-mono)' }}>{item.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card-title" style={{ alignSelf: 'stretch' }}>SERVICE STATUS</div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '36px',
            fontWeight: 900, color: '#00e676',
            textShadow: '0 0 20px rgba(0, 230, 118, 0.3)'
          }}>98.4%</div>
          <div style={{ fontSize: '11px', color: '#5a6577', marginTop: '4px' }}>Overall SOC Health</div>
        </div>
      </div>
    </div>
  );
}
