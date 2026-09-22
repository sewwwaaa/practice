import React, { useState, useEffect } from 'react';
import { 
  Globe, Search, AlertTriangle, ShieldAlert, BookOpen, 
  ExternalLink, Terminal, Tag, ShieldCheck, Flame
} from 'lucide-react';

export default function ThreatIntelView() {
  const [news, setNews] = useState([]);
  const [stats, setStats] = useState({
    newCvesToday: 18,
    criticalVulns: 4,
    activeMalware: 14,
    ransomwareCampaigns: 5,
    securityAdvisories: 9
  });
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Vulnerabilities', 'Malware', 'Ransomware', 'Data Breaches', 'Network Security', 'AI Security'];

  useEffect(() => {
    let url = `/api/threat-intel?category=${activeCategory}`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNews(data.news);
          if (data.stats) setStats(data.stats);
        }
      })
      .catch(err => console.error('Threat Intel error:', err));
  }, [activeCategory, searchQuery]);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          <Globe style={{ color: '#00ffcc' }} /> THREAT INTELLIGENCE
        </h1>
        <p className="page-subtitle">
          Stay informed about the latest threats, vulnerabilities, and security incidents worldwide.
        </p>
      </div>

      {/* Filter Tags & Search Bar */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`btn-cyber-outline ${activeCategory === cat ? 'active' : ''}`}
                style={{
                  background: activeCategory === cat ? 'rgba(0, 255, 204, 0.15)' : 'transparent',
                  borderColor: activeCategory === cat ? '#00ffcc' : 'var(--border-dark)',
                  color: activeCategory === cat ? '#00ffcc' : 'var(--text-muted)'
                }}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="header-search" style={{ width: '280px' }}>
            <Search size={14} style={{ color: '#00ffcc' }} />
            <input
              type="text"
              placeholder="Search CVEs, threats..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Main Grid Layout: Left Content (Featured Banner & News), Right Sidebar (Stats & Donut) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: '20px' }}>
        
        <div>
          {/* Featured Threat Alert Banner */}
          <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid #ff0055', background: 'radial-gradient(circle at 10% 50%, rgba(255, 0, 85, 0.1) 0%, var(--bg-card) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff0055', fontSize: '11px', fontWeight: 700, fontFamily: 'Orbitron, sans-serif', marginBottom: '8px' }}>
              <Flame size={16} /> THREAT ALERT // CRITICAL EXPLOIT
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>
              VMware ESXi zero-day vulnerability (CVE-2025-22224) actively exploited in the wild
            </h2>

            <p style={{ fontSize: '13px', color: '#8492a6', marginBottom: '16px', lineHeight: '1.6' }}>
              Nation-state actors are actively chaining heap overflow with unauthenticated memory corruption to bypass hypervisor isolation and gain root privileges across enterprise ESXi clusters.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span className="badge badge-critical">Risk Level: Critical</span>
              <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#00e5ff' }}>CVSS 9.8</span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>The Hacker News • 3 hours ago</span>
              <button className="btn-cyber" style={{ marginLeft: 'auto', fontSize: '11px' }}>
                Read Full Article <ExternalLink size={12} />
              </button>
            </div>
          </div>

          {/* News List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card-title">LATEST CYBER NEWS</div>

            {news.map(item => (
              <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span className={`badge badge-${item.severity ? item.severity.toLowerCase() : 'medium'}`} style={{ marginRight: '8px' }}>
                      {item.category}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{item.source} • {item.time}</span>
                  </div>
                  {item.cve && (
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#00ffcc', background: 'rgba(0,255,204,0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                      {item.cve}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: 700 }}>{item.title}</h3>
                <p style={{ fontSize: '12.5px', color: '#8492a6', lineHeight: '1.5' }}>{item.summary}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Stats & Severity Chart */}
        <div>
          {/* Threat Intelligence Stats Card */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-title">THREAT INTELLIGENCE</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <span style={{ color: '#8492a6', fontSize: '12px' }}>New CVEs Today</span>
                <span style={{ fontWeight: 700, color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>{stats.newCvesToday}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <span style={{ color: '#8492a6', fontSize: '12px' }}>Critical Vulnerabilities</span>
                <span style={{ fontWeight: 700, color: '#ff0055', fontFamily: 'JetBrains Mono, monospace' }}>{stats.criticalVulns}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <span style={{ color: '#8492a6', fontSize: '12px' }}>Active Malware</span>
                <span style={{ fontWeight: 700, color: '#ffaa00', fontFamily: 'JetBrains Mono, monospace' }}>{stats.activeMalware}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <span style={{ color: '#8492a6', fontSize: '12px' }}>Ransomware Campaigns</span>
                <span style={{ fontWeight: 700, color: '#00e5ff', fontFamily: 'JetBrains Mono, monospace' }}>{stats.ransomwareCampaigns}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px' }}>
                <span style={{ color: '#8492a6', fontSize: '12px' }}>Security Advisories</span>
                <span style={{ fontWeight: 700, color: '#00ff99', fontFamily: 'JetBrains Mono, monospace' }}>{stats.securityAdvisories}</span>
              </div>
            </div>
          </div>

          {/* Threat Severity Chart */}
          <div className="card">
            <div className="card-title">THREAT SEVERITY</div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
              <div style={{ position: 'relative', width: '130px', height: '130px' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ff0055" strokeWidth="4" strokeDasharray="20, 100" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ffaa00" strokeWidth="4" strokeDasharray="35, 100" strokeDashoffset="-20" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#00e5ff" strokeWidth="4" strokeDasharray="45, 100" strokeDashoffset="-55" />
                </svg>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '24px', fontWeight: 800, color: '#fff' }}>42</span>
                  <span style={{ fontSize: '10px', color: '#8492a6' }}>Total</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
