import React, { useState, useEffect } from 'react';
import {
  Globe, Search, ExternalLink, Flame, RotateCw, Newspaper, BarChart3, Activity
} from 'lucide-react';

import { PageHeader } from './ui.jsx';

const CATEGORIES = ['All', 'Vulnerabilities', 'Malware', 'Ransomware', 'Data Breaches', 'Network Security', 'AI Security'];

const FALLBACK_FEATURED = {
  title: 'VMware ESXi zero-day vulnerability (CVE-2025-22224) actively exploited in the wild',
  summary: 'Nation-state actors are actively chaining heap overflow with unauthenticated memory corruption to bypass hypervisor isolation.',
  source: 'The Hacker News',
  time: '3 hours ago',
  cve: 'CVE-2025-22224',
  riskLevel: 'Critical (CVSS 9.8)',
  severity: 'Critical'
};

const SEVERITY_SLICES = [
  { key: 'critical', label: 'Critical', color: '#ff1744' },
  { key: 'high', label: 'High', color: '#ff9100' },
  { key: 'medium', label: 'Medium', color: '#00b0ff' },
  { key: 'low', label: 'Low', color: '#00e676' },
];

const openExternal = (url) => window.open(url, '_blank', 'noopener,noreferrer');

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

  const fetchThreatIntel = (forceRefresh = false) => {
    setLoading(true);
    let url = `/api/threat-intel?category=${encodeURIComponent(activeCategory)}`;
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

  const featuredArticle = news.length > 0 ? news[0] : FALLBACK_FEATURED;
  const remainingNews = news.length > 1 ? news.slice(1) : news;

  // Severity distribution for the donut, derived from the live feed when available.
  const sevCounts = SEVERITY_SLICES.map(s => ({
    ...s,
    count: news.filter(n => (n.severity || '').toLowerCase() === s.key).length
  }));
  const sevTotal = sevCounts.reduce((sum, s) => sum + s.count, 0);
  const slices = sevTotal > 0
    ? sevCounts
    : [{ ...SEVERITY_SLICES[0], count: 20 }, { ...SEVERITY_SLICES[1], count: 35 }, { ...SEVERITY_SLICES[2], count: 45 }, { ...SEVERITY_SLICES[3], count: 0 }];
  const sliceTotal = slices.reduce((sum, s) => sum + s.count, 0) || 1;
  let offset = 0;

  const statRows = [
    { label: 'New CVEs Today', value: stats.newCvesToday, color: 'var(--text-strong)' },
    { label: 'Critical Vulnerabilities', value: stats.criticalVulns, color: '#ff4d6d' },
    { label: 'Active Malware', value: stats.activeMalware, color: '#ff9100' },
    { label: 'Ransomware Campaigns', value: stats.ransomwareCampaigns, color: '#00b0ff' },
    { label: 'Security Advisories', value: stats.securityAdvisories, color: '#00e676' },
  ];

  return (
    <div className="view-stack">
      <PageHeader
        eyebrow="Module 03 · Global Intelligence"
        icon={Globe}
        title="THREAT INTELLIGENCE"
        subtitle="Live daily global intelligence stream powered by Google News real-time indexers & SOC telemetry."
        actions={(
          <>
            <button
              className="btn-ghost"
              onClick={() => fetchThreatIntel(true)}
              disabled={loading}
              title="Fetch latest Google News updates"
            >
              <RotateCw size={14} className={loading ? 'spin' : undefined} />
              {loading ? 'Syncing...' : 'Sync Feed'}
            </button>
            {onOpenBreachMap && (
              <button className="btn-ghost btn-danger" onClick={onOpenBreachMap}>
                <Globe size={15} /> Open The Breach Map
              </button>
            )}
          </>
        )}
      >
        {isLiveGoogle && (
          <span className="live-chip">
            <span className="live-dot" />
            GOOGLE 24H LIVE{lastSyncTime && ` · ${lastSyncTime}`}
          </span>
        )}
      </PageHeader>

      {/* Filters */}
      <section className="card animate-in animate-in-delay-1" style={{ padding: '14px 16px' }}>
        <div className="filter-bar">
          <div className="chip-row">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`chip ${activeCategory === cat ? 'active' : ''}`}
                aria-pressed={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <label className="header-search" style={{ display: 'flex', width: 'min(300px, 100%)' }}>
            <Search size={14} style={{ color: 'var(--accent-cyan)' }} />
            <input
              type="text"
              placeholder="Search CVEs, threats, breaches..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </label>
        </div>
      </section>

      <div className="grid-main-side">
        <div className="stack">
          {/* Featured */}
          {featuredArticle && (
            <article className="card hud featured-alert animate-in animate-in-delay-2" style={{ '--hud-c': 'rgba(255, 23, 68, 0.6)' }}>
              <div className="featured-alert-tag"><Flame size={15} /> THREAT ALERT // TOP BREAKING STORY</div>
              <h2>{featuredArticle.title}</h2>
              <p>{featuredArticle.summary}</p>

              <div className="meta-row">
                <span className={`badge badge-${(featuredArticle.severity || 'CRITICAL').toLowerCase()}`}>
                  {featuredArticle.riskLevel || 'Risk Level: Critical'}
                </span>
                {featuredArticle.cve && <span className="cve-tag">{featuredArticle.cve}</span>}
                <span>{featuredArticle.source} • {featuredArticle.time}</span>
                {featuredArticle.link && (
                  <button
                    className="btn-cyber"
                    style={{ marginLeft: 'auto', height: '34px' }}
                    onClick={() => openExternal(featuredArticle.link)}
                  >
                    Read Source <ExternalLink size={12} />
                  </button>
                )}
              </div>
            </article>
          )}

          {/* Feed */}
          <div className="section-label" style={{ marginBottom: 0, marginTop: '4px' }}>
            <Newspaper size={14} style={{ color: 'var(--accent-cyan)' }} />
            LATEST CYBER NEWS · {remainingNews.length} ARTICLES
          </div>

          {loading ? (
            <div className="card empty-state">
              <RotateCw size={24} className="spin" />
              <span>Fetching live daily updates from Google News...</span>
            </div>
          ) : remainingNews.length === 0 ? (
            <div className="card empty-state">
              <Search size={24} />
              <span>No articles found matching this query today. Try clearing filters.</span>
            </div>
          ) : (
            remainingNews.map((item, i) => (
              <article
                key={item.id}
                className={`card intel-card ${item.link ? 'card-clickable' : ''}`}
                style={{ animation: `fadeInUp 0.45s var(--ease-out) ${Math.min(i, 8) * 0.04}s both` }}
                onClick={() => item.link && openExternal(item.link)}
              >
                <div className="meta-row" style={{ justifyContent: 'space-between' }}>
                  <div className="meta-row">
                    <span className={`badge badge-${item.severity ? item.severity.toLowerCase() : 'medium'}`}>
                      {item.category}
                    </span>
                    <span style={{ fontSize: '11.5px' }}>{item.source} • {item.time}</span>
                  </div>
                  <div className="meta-row">
                    {item.cve && <span className="cve-tag">{item.cve}</span>}
                    {item.link && <ExternalLink size={13} style={{ color: 'var(--text-dim)' }} />}
                  </div>
                </div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </article>
            ))
          )}
        </div>

        {/* Sidebar */}
        <aside className="stack sticky-side animate-in animate-in-delay-3">
          <section className="card">
            <div className="card-title">
              <span className="card-title-left"><Activity size={14} /> INTEL SNAPSHOT</span>
              <span className="card-title-meta">TODAY</span>
            </div>
            <div className="stack-sm">
              {statRows.map(row => (
                <div key={row.label} className="kv-row">
                  <span>{row.label}</span>
                  <strong style={{ color: row.color }}>{row.value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="card hud">
            <div className="card-title">
              <span className="card-title-left"><BarChart3 size={14} /> THREAT SEVERITY</span>
            </div>
            <div className="donut-wrap">
              <div className="donut">
                <svg viewBox="0 0 42 42" aria-hidden="true">
                  <circle cx="21" cy="21" r="15.9155" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4.5" />
                  {slices.filter(s => s.count > 0).map(s => {
                    const pct = (s.count / sliceTotal) * 100;
                    const seg = (
                      <circle
                        key={s.key}
                        cx="21" cy="21" r="15.9155" fill="none"
                        stroke={s.color} strokeWidth="4.5"
                        strokeDasharray={`${Math.max(0, pct - 1)} ${100 - Math.max(0, pct - 1)}`}
                        strokeDashoffset={-offset}
                        style={{ filter: `drop-shadow(0 0 2px ${s.color})` }}
                      />
                    );
                    offset += pct;
                    return seg;
                  })}
                </svg>
                <div className="donut-center">
                  <strong>{news.length || 25}</strong>
                  <span>ACTIVE ITEMS</span>
                </div>
              </div>
              <div className="stack-sm" style={{ minWidth: '120px' }}>
                {slices.map(s => (
                  <div key={s.key} className="legend-item" style={{ '--c': s.color, padding: '6px 10px' }}>
                    <span>{s.label}</span>
                    <strong>{Math.round((s.count / sliceTotal) * 100)}%</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
