import React, { useState, useEffect } from 'react';
import { 
  Globe, MapPin, Search, Shield, ArrowLeft, ExternalLink, 
  X, AlertTriangle, Radio, Terminal, Flame, Eye, Lock,
  Share2, Bookmark, CheckCircle2, ChevronRight
} from 'lucide-react';
import BreachWorldMap from './BreachWorldMap.jsx';
import './BreachMap.css';

export default function BreachMapView({ onReturnToSOC, currentUser }) {
  const [activeTab, setActiveTab] = useState('HOME');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  // Animated telemetry stats
  const [activeThreats, setActiveThreats] = useState(1489);
  const [recentBreaches, setRecentBreaches] = useState(12);
  const [criticalAlerts, setCriticalAlerts] = useState(3);

  useEffect(() => {
    const statsTimer = setInterval(() => {
      setActiveThreats(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 3500);
    return () => clearInterval(statsTimer);
  }, []);

  // Live Incident Feed state initialized with the exact items from the user's screenshot
  const [incidents, setIncidents] = useState([
    {
      id: 'inc-1',
      time: '(16:45 UTC)',
      severity: 'CRITICAL',
      title: 'BREACH - Major US Retailer',
      target: 'RetailPOS Cloud API',
      impact: '24M customer credit records potentially compromised',
      vector: 'Credential stuffing via exposed OAuth endpoint',
      cve: 'CVE-2025-1049',
      status: 'INVESTIGATING'
    },
    {
      id: 'inc-2',
      time: '(16:42 UTC)',
      severity: 'HIGH',
      title: 'MALWARE - New Ransomware Strain Active',
      target: 'Healthcare Domain Controllers',
      impact: 'Double-extortion payload with SMB self-replication',
      vector: 'Spear-phishing attachment weaponized with macros',
      cve: 'RANSOM-DARK-v3',
      status: 'CONTAINED'
    },
    {
      id: 'inc-3',
      time: '(16:38 UTC)',
      severity: 'HIGH',
      title: 'VULNERABILITY - Apache Server 0-Day Found',
      target: 'Apache HTTP Server 2.4.x',
      impact: 'Unauthenticated remote code execution on edge gateways',
      vector: 'Path traversal flaw in mod_proxy module',
      cve: 'CVE-2025-24810',
      status: 'PATCH PENDING'
    },
    {
      id: 'inc-4',
      time: '(16:35 UTC)',
      severity: 'CRITICAL',
      title: 'PHISHING - Banking Campaign Targets Users',
      target: 'Tier-1 Banking Consortia',
      impact: 'Reverse proxy adversary-in-the-middle session token theft',
      vector: 'Punycode spoofed domains targeting MFA tokens',
      cve: 'CWE-287',
      status: 'DOMAIN TAKEDOWN'
    }
  ]);

  // Live streaming ticker to periodically add new realistic incidents
  useEffect(() => {
    const streamPool = [
      {
        id: 'inc-stream-1',
        time: '(16:48 UTC)',
        severity: 'CRITICAL',
        title: 'EXPLOIT - Ivanti Gateway Zero-Day Bypassed',
        target: 'Enterprise VPN Appliances',
        impact: 'Full root access achieved via chained XML injection',
        vector: 'Pre-auth command injection in admin portal',
        cve: 'CVE-2025-0812',
        status: 'EMERGENCY ADVISORY'
      },
      {
        id: 'inc-stream-2',
        time: '(16:49 UTC)',
        severity: 'HIGH',
        title: 'DDOS - 1.8 Tbps SYN Flood Against Cloudflare Edge',
        target: 'Global Anycast DNS',
        impact: 'Transient latency observed in APAC region',
        vector: 'Mirai-variant IoT botnet leveraging 120,000 nodes',
        cve: 'BOTNET-REAPER',
        status: 'MITIGATING'
      },
      {
        id: 'inc-stream-3',
        time: '(16:51 UTC)',
        severity: 'CRITICAL',
        title: 'DATA LEAK - 48GB Defense Contractor CAD Files',
        target: 'AWS S3 Bucket (Misconfigured ACL)',
        impact: 'Proprietary avionics schematics leaked to dark web forum',
        vector: 'Publicly readable storage bucket index',
        cve: 'CWE-732',
        status: 'ISOLATED'
      }
    ];

    let poolIdx = 0;
    const interval = setInterval(() => {
      if (poolIdx < streamPool.length) {
        const nextInc = streamPool[poolIdx];
        setIncidents(prev => [nextInc, ...prev.slice(0, 5)]);
        poolIdx++;
      }
    }, 14000);

    return () => clearInterval(interval);
  }, []);

  // News Articles details
  const newsArticles = {
    mega: {
      title: 'MEGA DATA BREACH EXPOSES MILLIONS; TECH GIANT TARGETED',
      subtitle: 'Nation-state actors infiltrate cloud infrastructure, compromising user credentials and internal communications.',
      author: 'A. Jensen',
      time: '2h ago',
      category: 'DATA BREACH',
      severity: 'CRITICAL',
      readTime: '4 min read',
      image: '/images/mega_breach.jpg',
      content: `
        A catastrophic data breach has struck one of the world's leading technology conglomerates, exposing over 140 million user profiles, encrypted password hashes, and sensitive API keys.

        Initial telemetry reveals the breach was orchestrated by an advanced persistent threat (APT) group exploiting an unauthenticated remote execution chain in third-party identity management software.

        Forensic teams have isolated the compromised cloud clusters and deployed automated canary tokens to track unauthorized lateral movement across production Kubernetes namespaces.
      `,
      iocs: [
        'IP: 185.220.101.44 (C2 Server)',
        'SHA-256: 7d1a49f8021c4e74659b7df08b49e2cf310c83a9',
        'CVE-2025-22224 (Hypervisor Memory Bypass)'
      ]
    },
    ransomware: {
      title: 'RANSOMWARE ATTACK SPIKES ON INFRASTRUCTURE',
      subtitle: 'Critical municipal energy grids and water management plants faced targeted multi-stage ransomware deployment.',
      author: 'Security Operations Desk',
      time: '2h ago',
      category: 'RANSOMWARE',
      severity: 'CRITICAL',
      readTime: '3 min read',
      image: '/images/ransomware_alert.jpg',
      content: `
        Cybersecurity monitoring systems registered an acute 340% spike in ransomware encryption attempts targeting critical utility infrastructure across North America and Europe.

        The threat group utilized a newly compiled variant of LockBit that executes entirely in memory without writing binaries to disk, bypassing traditional signature-based EDR engines.
      `,
      iocs: [
        'Domain: update-auth-cloudsync.net',
        'Payload: lockbit_v4_x64.bin',
        'Ransom Demand: 45 BTC'
      ]
    },
    stateHacking: {
      title: 'STATE-SPONSORED HACKING CAMPAIGN UNCOVERED',
      subtitle: 'Intelligence alliances confirm multi-year covert espionage operation targeting semiconductor research labs.',
      author: 'A. Jensen',
      time: '2h ago',
      category: 'CYBER WARFARE',
      severity: 'HIGH',
      readTime: '5 min read',
      image: '/images/state_hacking.jpg',
      content: `
        An international coalition of cyber defense agencies has published a joint advisory detailing an expansive state-sponsored cyber espionage campaign codenamed "SILICON SHADOW".

        The campaign leveraged zero-day firmware implants inside enterprise routing hardware to passively intercept and clone encrypted intellectual property before it reached external firewalls.
      `,
      iocs: [
        'ASN: AS4837 (Telemetry Proxy)',
        'Rootkit: kmodule_shadow_v2.ko',
        'Victim Count: 38 Technology Laboratories'
      ]
    }
  };

  return (
    <div className="breach-page-root">
      
      {/* ─── TOP NAVBAR ─── */}
      <nav className="breach-nav">
        {/* Brand / Logo */}
        <div className="breach-logo-wrapper" onClick={() => setActiveTab('HOME')}>
          <div className="breach-logo-icon">
            <div className="breach-logo-globe">
              <Globe size={18} color="#94a3b8" />
            </div>
            <MapPin className="breach-logo-pin" />
          </div>
          <div className="breach-logo-text">
            <span className="breach-logo-prefix">THE</span>
            <span className="breach-logo-main">BREACH MAP</span>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="breach-nav-links">
          {['HOME', 'GLOBAL MAP', 'LATEST NEWS', 'THREAT INTEL', 'REPORTS'].map(tab => (
            <button
              key={tab}
              className={`breach-nav-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
          <button 
            className="breach-nav-btn" 
            onClick={() => setSearchOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>SEARCH</span>
            <Search size={13} style={{ color: '#ff2a55' }} />
          </button>
          <button 
            className="breach-nav-btn" 
            onClick={() => setSelectedArticle(newsArticles.mega)}
          >
            LOGIN
          </button>
        </div>

        {/* Action Button: Return to ZEROLOCK SOC */}
        <div className="breach-nav-actions">
          <button 
            className="breach-btn-return-soc"
            onClick={onReturnToSOC}
            title="Return to ZEROLOCK Cyber Security Operations Center"
          >
            <Shield size={14} />
            <span>← RETURN TO SOC</span>
          </button>
        </div>
      </nav>

      {/* ─── MAIN CONTENT ─── */}
      <main className="breach-main-content">
        
        {/* Header Section */}
        <div className="breach-header-section">
          <div className="breach-eyebrow-row">
            <span className="breach-eyebrow-left">GLOBAL THREAT MAP</span>
            <span className="breach-eyebrow-right">
              <span className="breach-news-ticker-indicator" />
              SIDE-SCROLLING NEWS FEED |
            </span>
          </div>

          <h1 className="breach-hero-title">
            REAL-TIME CYBERSECURITY THREAT INTELLIGENCE
          </h1>
          <p className="breach-hero-subtitle">
            Stay ahead of global breaches and vulnerabilities.
          </p>
        </div>

        {/* ─── 3-COLUMN LAYOUT ─── */}
        <div className="breach-three-col-grid">

          {/* ── COLUMN 1: NEWS CARDS ── */}
          <div className="breach-news-column">
            
            {/* Featured Mega Data Breach Card */}
            <div 
              className="breach-mega-card"
              onClick={() => setSelectedArticle(newsArticles.mega)}
            >
              <img 
                src="/images/mega_breach.jpg" 
                alt="Mega Data Breach Server Room"
                className="breach-card-bg-img"
              />
              <div className="breach-card-overlay">
                <h2 className="breach-mega-title">
                  MEGA DATA BREACH EXPOSES MILLIONS; TECH GIANT TARGETED
                </h2>
                <div className="breach-card-meta">
                  Investigation Underway | 2h ago | By A. Jensen
                </div>
              </div>
            </div>

            {/* Bottom Two Sub-Cards Row */}
            <div className="breach-sub-cards-row">
              
              {/* Sub-Card 1: Ransomware */}
              <div 
                className="breach-sub-card"
                onClick={() => setSelectedArticle(newsArticles.ransomware)}
              >
                <img 
                  src="/images/ransomware_alert.jpg" 
                  alt="Ransomware alert corridor"
                  className="breach-card-bg-img"
                />
                <div className="breach-sub-card-overlay">
                  <h3 className="breach-sub-title">
                    RANSOMWARE ATTACK SPIKES ON INFRASTRUCTURE
                  </h3>
                  <div className="breach-sub-meta">
                    Investigation Underway | 2h ago
                  </div>
                </div>
              </div>

              {/* Sub-Card 2: State-Sponsored Hacking */}
              <div 
                className="breach-sub-card"
                onClick={() => setSelectedArticle(newsArticles.stateHacking)}
              >
                <img 
                  src="/images/state_hacking.jpg" 
                  alt="State sponsored cyber attack map"
                  className="breach-card-bg-img"
                />
                <div className="breach-sub-card-overlay">
                  <h3 className="breach-sub-title">
                    STATE-SPONSORED HACKING CAMPAIGN UNCOVERED
                  </h3>
                  <div className="breach-sub-meta">
                    2h ago | By A. Jensen
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── COLUMN 2: CENTER MAP & TELEMETRY STATS ── */}
          <div className="breach-center-column">
            
            {/* The World Threat Map */}
            <BreachWorldMap onCitySelect={(city) => setSelectedCity(city)} />

            {/* Bottom Stats Ticker Bar (Exact matching screenshot) */}
            <div className="breach-stats-bar">
              <div className="breach-stat-item">
                <span className="breach-stat-label">ACTIVE THREATS:</span>
                <span className="breach-stat-value red-glow">{activeThreats.toLocaleString()}</span>
              </div>

              <div className="breach-stat-divider" />

              <div className="breach-stat-item">
                <span className="breach-stat-label">RECENT BREACHES:</span>
                <div>
                  <span className="breach-stat-value white-value">{recentBreaches}</span>
                  <span className="breach-stat-unit">HRS</span>
                </div>
              </div>

              <div className="breach-stat-divider" />

              <div className="breach-stat-item">
                <span className="breach-stat-label">CRITICAL ALERTS:</span>
                <span className="breach-stat-value red-glow">{criticalAlerts}</span>
              </div>
            </div>

          </div>

          {/* ── COLUMN 3: LIVE INCIDENT FEED ── */}
          <div className="breach-feed-column">
            <div className="breach-feed-header">
              <span className="breach-feed-pulse-dot" />
              <span>LIVE INCIDENT FEED</span>
            </div>

            <div className="breach-feed-list">
              {incidents.map((item) => (
                <div 
                  key={item.id} 
                  className={`breach-incident-card ${item.severity.toLowerCase()}`}
                  onClick={() => setSelectedIncident(item)}
                >
                  <div className="breach-incident-top-row">
                    <span className="breach-incident-time">{item.time}</span>
                    <span className={`breach-incident-badge ${item.severity.toLowerCase()}`}>
                      {item.severity}
                    </span>
                  </div>
                  <div className="breach-incident-title">
                    {item.title}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* ─── FOOTER ─── */}
      <footer className="breach-footer">
        <div className="breach-footer-links">
          {['HOME', 'GLOBAL MAP', 'LATEST NEWS', 'THREAT INTEL', 'REPORTS'].map(link => (
            <button 
              key={link} 
              className="breach-footer-link"
              onClick={() => setActiveTab(link)}
            >
              {link}
            </button>
          ))}
        </div>
        <div className="breach-footer-copy">
          © 2023 THE BREACH MAP
        </div>
      </footer>

      {/* ─── MODAL: ARTICLE DEEP DIVE ─── */}
      {selectedArticle && (
        <div className="breach-modal-backdrop" onClick={() => setSelectedArticle(null)}>
          <div className="breach-modal-card" onClick={e => e.stopPropagation()}>
            <button className="breach-modal-close-btn" onClick={() => setSelectedArticle(null)}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ 
                background: 'rgba(255, 42, 85, 0.15)', 
                color: '#ff2a55', 
                border: '1px solid rgba(255, 42, 85, 0.4)',
                fontSize: '10px', 
                fontWeight: 800, 
                padding: '3px 8px', 
                borderRadius: '4px' 
              }}>
                {selectedArticle.category}
              </span>
              <span style={{ color: '#64748b', fontSize: '11px', fontFamily: 'monospace' }}>
                {selectedArticle.time} • By {selectedArticle.author}
              </span>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '12px', lineHeight: 1.3 }}>
              {selectedArticle.title}
            </h2>

            <img 
              src={selectedArticle.image} 
              alt={selectedArticle.title} 
              style={{ width: '100%', height: '240px', objectFit: 'cover', borderRadius: '8px', marginBottom: '16px' }}
            />

            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-line', marginBottom: '20px' }}>
              {selectedArticle.content.trim()}
            </p>

            <div style={{ background: 'rgba(5, 10, 20, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                INDICATORS OF COMPROMISE (IOCs)
              </div>
              {selectedArticle.iocs.map((ioc, i) => (
                <div key={i} style={{ fontFamily: 'monospace', fontSize: '11px', color: '#ff4d6d', padding: '3px 0' }}>
                  • {ioc}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button 
                onClick={onReturnToSOC}
                style={{ 
                  background: 'linear-gradient(135deg, #00ffd5, #00c4a7)', 
                  border: 'none', 
                  color: '#020408', 
                  fontWeight: 800, 
                  fontSize: '12px', 
                  padding: '9px 18px', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Shield size={14} /> Send to ZEROLOCK SIEM
              </button>
              <button 
                onClick={() => setSelectedArticle(null)}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '12px', padding: '9px 16px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: INCIDENT FORENSIC DEEP DIVE ─── */}
      {selectedIncident && (
        <div className="breach-modal-backdrop" onClick={() => setSelectedIncident(null)}>
          <div className="breach-modal-card" onClick={e => e.stopPropagation()}>
            <button className="breach-modal-close-btn" onClick={() => setSelectedIncident(null)}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <AlertTriangle color="#ff2a55" size={20} />
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
                {selectedIncident.title}
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
              <div style={{ background: 'rgba(255, 42, 85, 0.08)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255, 42, 85, 0.2)' }}>
                <div style={{ fontSize: '10px', color: '#ff4d6d', fontWeight: 700 }}>SEVERITY LEVEL</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#ff2a55', fontFamily: 'monospace' }}>{selectedIncident.severity}</div>
              </div>
              <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 700 }}>DISPATCH STATUS</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: '#38bdf8', fontFamily: 'monospace' }}>{selectedIncident.status}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>TARGET ASSET: </span>
                <span style={{ fontSize: '12px', color: '#fff', fontFamily: 'monospace' }}>{selectedIncident.target}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>ATTACK VECTOR: </span>
                <span style={{ fontSize: '12px', color: '#fff' }}>{selectedIncident.vector}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>POTENTIAL IMPACT: </span>
                <span style={{ fontSize: '12px', color: '#e2e8f0' }}>{selectedIncident.impact}</span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>VULNERABILITY ID: </span>
                <span style={{ fontSize: '12px', color: '#00ffd5', fontFamily: 'monospace' }}>{selectedIncident.cve}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSelectedIncident(null)}
                style={{ background: 'rgba(255, 42, 85, 0.2)', border: '1px solid #ff2a55', color: '#ff4d6d', fontSize: '12px', fontWeight: 700, padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Acknowledge Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: SEARCH DIALOG ─── */}
      {searchOpen && (
        <div className="breach-modal-backdrop" onClick={() => setSearchOpen(false)}>
          <div className="breach-modal-card" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
            <button className="breach-modal-close-btn" onClick={() => setSearchOpen(false)}>
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>
              SEARCH GLOBAL BREACH DATABASE
            </h3>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input 
                type="text"
                autoFocus
                placeholder="Search by CVE, company, IP, threat actor..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(0, 255, 213, 0.4)',
                  borderRadius: '6px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontSize: '13px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>POPULAR THREAT QUERIES:</div>
              {['CVE-2025-22224 VMware ESXi', 'LockBit 3.0 Ransomware', 'APT-29 Russian C2', 'Apache Struts RCE'].map((q, i) => (
                <div 
                  key={i}
                  onClick={() => { setSelectedArticle(newsArticles.mega); setSearchOpen(false); }}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#e2e8f0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span>{q}</span>
                  <ChevronRight size={13} color="#64748b" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: CITY TELEMETRY DIALOG ─── */}
      {selectedCity && (
        <div className="breach-modal-backdrop" onClick={() => setSelectedCity(null)}>
          <div className="breach-modal-card" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <button className="breach-modal-close-btn" onClick={() => setSelectedCity(null)}>
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <MapPin color="#ff2a55" size={24} />
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {selectedCity.fullName}
                </h3>
                <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                  {selectedCity.lat}, {selectedCity.lon}
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 42, 85, 0.1)', border: '1px solid rgba(255, 42, 85, 0.3)', padding: '12px', borderRadius: '6px', marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', color: '#ff4d6d', fontWeight: 800 }}>LIVE POSTURE</div>
              <div style={{ fontSize: '15px', color: '#fff', fontWeight: 700 }}>{selectedCity.status}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#8c9eb3', fontSize: '12px' }}>Active Attack Vectors:</span>
              <span style={{ color: '#ff2a55', fontWeight: 800, fontFamily: 'monospace' }}>{selectedCity.threats}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ color: '#8c9eb3', fontSize: '12px' }}>Threat Severity:</span>
              <span style={{ color: '#ff4d6d', fontWeight: 800, textTransform: 'uppercase' }}>{selectedCity.severity}</span>
            </div>

            <div style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setSelectedCity(null)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
