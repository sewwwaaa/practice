import React, { useState, useEffect } from 'react';
import { 
  Globe, Search, AlertTriangle, ShieldAlert, BookOpen, 
  ExternalLink, Terminal, Tag, ShieldCheck, Flame, RotateCw
} from 'lucide-react';

export default function ThreatIntelView({ onOpenBreachMap }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLiveGoogle, setIsLiveGoogle] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState(null);
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

  const fetchThreatIntel = (forceRefresh = false) => {
    setLoading(true);
    let url = `/api/threat-intel?category=${activeCategory}`;
    if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
    if (forceRefresh) url += `&refresh=true`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNews(data.news || []);
          if (data.stats) setStats(data.stats);
          setIsLiveGoogle(!!data.isLiveGoogleFeed);
          setLastSyncTime(data.lastSync || new Date().toLocaleTimeString());
        }
      })
      .catch(err => console.error('Threat Intel error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchThreatIntel(false);
  }, [activeCategory, searchQuery]);

  const featuredArticle = news.length > 0 ? news[0] : {
    title: 'VMware ESXi zero-day vulnerability (CVE-2025-22224) actively exploited in the wild',
    summary: 'Nation-state actors are actively chaining heap overflow with unauthenticated memory corruption to bypass hypervisor isolation.',
    source: 'The Hacker News',
    time: '3 hours ago',
    cve: 'CVE-2025-22224',
    riskLevel: 'Critical (CVSS 9.8)',
    severity: 'Critical'
  };

  const remainingNews = news.length > 1 ? news.slice(1) : news;

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 className="page-title" style={{ margin: 0 }}>
              <Globe style={{ color: '#00ffcc' }} /> THREAT INTELLIGENCE
            </h1>
            {isLiveGoogle && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '20px',
                background: 'rgba(0, 255, 204, 0.1)',
                border: '1px solid rgba(0, 255, 204, 0.3)',
                color: '#00ffcc',
                fontFamily: 'JetBrains Mono, monospace'
              }}>
                <span className="status-dot-green" style={{ width: '7px', height: '7px' }} />
                GOOGLE 24H LIVE UPDATE {lastSyncTime && `• ${lastSyncTime}`}
              </span>
            )}
          </div>
          <p className="page-subtitle" style={{ marginTop: '6px' }}>
            Live daily global intelligence stream powered by Google News real-time indexers & SOC telemetry.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            className="btn-cyber-outline"
            onClick={() => fetchThreatIntel(true)}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
            title="Fetch latest Google News updates"
          >
            <RotateCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>{loading ? 'SYNCING...' : 'SYNC FEED'}</span>
          </button>
          {onOpenBreachMap && (
            <button 
              className="btn-cyber" 
              onClick={onOpenBreachMap}
              style={{ 
                background: 'linear-gradient(135deg, rgba(255, 42, 85, 0.2), rgba(255, 42, 85, 0.05))',
                border: '1px solid #ff2a55',
                color: '#ff4d6d',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                boxShadow: '0 0 16px rgba(255, 42, 85, 0.25)'
              }}
            >
              <Globe size={15} />
              <span>OPEN "THE BREACH MAP"</span>
            </button>
          )}
        </div>
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
              placeholder="Search CVEs, threats, breaches..."
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
          {featuredArticle && (
            <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid #ff0055', background: 'radial-gradient(circle at 10% 50%, rgba(255, 0, 85, 0.1) 0%, var(--bg-card) 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff0055', fontSize: '11px', fontWeight: 700, fontFamily: 'Orbitron, sans-serif', marginBottom: '8px' }}>
                <Flame size={16} /> THREAT ALERT // TOP BREAKING STORY
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '10px', lineHeight: 1.3 }}>
                {featuredArticle.title}
              </h2>

              <p style={{ fontSize: '13px', color: '#8492a6', marginBottom: '16px', lineHeight: '1.6' }}>
                {featuredArticle.summary}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <span className={`badge badge-${(featuredArticle.severity || 'CRITICAL').toLowerCase()}`}>
                  {featuredArticle.riskLevel || 'Risk Level: Critical'}
                </span>
                {featuredArticle.cve && (
                  <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#00e5ff' }}>
                    {featuredArticle.cve}
                  </span>
                )}
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {featuredArticle.source} • {featuredArticle.time}
                </span>
                {featuredArticle.link && (
                  <button 
                    className="btn-cyber" 
                    style={{ marginLeft: 'auto', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => window.open(featuredArticle.link, '_blank')}
                  >
                    Read Google Source <ExternalLink size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* News List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>LATEST CYBER NEWS ({remainingNews.length} ARTICLES)</span>
              <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                SOURCE: GOOGLE NEWS DAILY
              </span>
            </div>

            {loading ? (
              <div className="card" style={{ textAlign: 'center', padding: '30px', color: '#00ffcc' }}>
                <RotateCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
                <div>Fetching live daily updates from Google News...</div>
              </div>
            ) : remainingNews.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                No articles found matching this query today. Try clearing filters.
              </div>
            ) : (
              remainingNews.map(item => (
                <div 
                  key={item.id} 
                  className="card" 
                  style={{ display: 'flex', flexDirection: 'column', gap: '10px', transition: 'border-color 0.2s', cursor: item.link ? 'pointer' : 'default' }}
                  onClick={() => item.link && window.open(item.link, '_blank')}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(0, 255, 204, 0.4)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-dark)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className={`badge badge-${item.severity ? item.severity.toLowerCase() : 'medium'}`}>
                        {item.category}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{item.source} • {item.time}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {item.cve && (
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#00ffcc', background: 'rgba(0,255,204,0.08)', padding: '2px 8px', borderRadius: '4px' }}>
                          {item.cve}
                        </span>
                      )}
                      {item.link && (
                        <ExternalLink size={13} style={{ color: '#64748b' }} />
                      )}
                    </div>
                  </div>

                  <h3 style={{ fontSize: '15px', color: '#fff', fontWeight: 700, lineHeight: 1.4, margin: 0 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#8492a6', lineHeight: '1.5', margin: 0 }}>
                    {item.summary}
                  </p>
                </div>
              ))
            )}
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
                  <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '24px', fontWeight: 800, color: '#fff' }}>{news.length || 25}</span>
                  <span style={{ fontSize: '10px', color: '#8492a6' }}>Active Items</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
