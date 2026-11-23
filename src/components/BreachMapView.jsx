import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Globe, MapPin, Search, Shield, X, ExternalLink, Flame, RotateCw, Radio,
  Crosshair, Newspaper, BarChart3, Info, ChevronRight, FileText, Clock,
  Target, Zap, User
} from 'lucide-react';

import BreachWorldMap from './BreachWorldMap.jsx';
import { enrichStory, geoBasisLabel, severityRank, SEVERITY_COLORS, CATEGORY_STYLE } from './breachGeo.js';
import { useCountUp } from './ui.jsx';
import './BreachMap.css';

const NAV = [
  { id: 'home', label: 'HOME' },
  { id: 'map', label: 'GLOBAL MAP' },
  { id: 'news', label: 'LATEST NEWS' },
  { id: 'intel', label: 'THREAT INTEL' },
  { id: 'reports', label: 'REPORTS' },
];

const CATEGORIES = ['All', 'Data Breaches', 'Ransomware', 'Vulnerabilities', 'Malware', 'AI Security', 'Network Security'];

const REFRESH_MS = 5 * 60 * 1000;
const SPOTLIGHT_MS = 5200;

// Used only when the SOC API is unreachable.
const OFFLINE_STORIES = [
  { id: 'OFF-1', title: 'Zero-Day Vulnerability in Edge Appliances Actively Exploited Globally', source: 'Cybersecurity Alert', time: '25m ago', category: 'Vulnerabilities', severity: 'Critical', cve: 'CVE-2026-1049', summary: 'Security agencies report active exploitation of a memory corruption flaw affecting perimeter gateways.' },
  { id: 'OFF-2', title: 'Healthcare Enterprise in the UK Thwarts Large-Scale Ransomware Intrusion', source: 'ThreatWire', time: '1h ago', category: 'Ransomware', severity: 'High', summary: 'Automated EDR containment blocked lateral movement before encryption modules could execute.' },
  { id: 'OFF-3', title: 'Japanese Cloud Provider Patches Severe Identity Token Bypass', source: 'Security Intelligence', time: '2h ago', category: 'Data Breaches', severity: 'High', summary: 'An audit identified privilege escalation in federated single sign-on services.' },
];

// Curated long-form analyst briefings (sample scenarios that ship with the platform).
const BRIEFINGS = [
  {
    id: 'brief-mega',
    title: 'Mega data breach exposes millions; tech giant targeted',
    summary: 'Nation-state actors infiltrate cloud infrastructure, compromising user credentials and internal communications.',
    source: 'ZEROLOCK Analyst Desk', time: 'Sample scenario', category: 'Data Breaches', severity: 'Critical',
    content: 'A catastrophic breach exposed over 140 million user profiles, encrypted password hashes and sensitive API keys. Telemetry indicates an APT group chained an unauthenticated remote execution flaw in third-party identity software. Forensic teams isolated the compromised clusters and deployed canary tokens to track lateral movement across production Kubernetes namespaces.',
    iocs: ['IP: 185.220.101.44 (C2 server)', 'SHA-256: 7d1a49f8021c4e74659b7df08b49e2cf310c83a9', 'CVE-2025-22224 (hypervisor memory bypass)'],
  },
  {
    id: 'brief-ransom',
    title: 'Ransomware attack spikes on critical infrastructure',
    summary: 'Municipal energy grids and water plants faced targeted multi-stage ransomware deployment.',
    source: 'Security Operations Desk', time: 'Sample scenario', category: 'Ransomware', severity: 'Critical',
    content: 'Monitoring registered a 340% spike in encryption attempts against utility infrastructure across North America and Europe. The group used a fileless LockBit variant that executes entirely in memory, bypassing signature-based EDR engines.',
    iocs: ['Domain: update-auth-cloudsync.net', 'Payload: lockbit_v4_x64.bin', 'Ransom demand: 45 BTC'],
  },
  {
    id: 'brief-state',
    title: 'State-sponsored hacking campaign uncovered',
    summary: 'A multi-year covert espionage operation targeting semiconductor research labs.',
    source: 'ZEROLOCK Analyst Desk', time: 'Sample scenario', category: 'Network Security', severity: 'High',
    content: 'A coalition of cyber defence agencies detailed the "SILICON SHADOW" campaign, which used zero-day firmware implants in enterprise routing hardware to intercept and clone intellectual property before it reached external firewalls.',
    iocs: ['ASN: AS4837 (telemetry proxy)', 'Rootkit: kmodule_shadow_v2.ko', 'Victims: 38 technology laboratories'],
  },
].map(b => ({ ...enrichStory(b), isBriefing: true }));

const norm = (s = '') => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const dedupe = (items) => {
  const seen = new Set();
  return items.filter(i => {
    const key = norm(i.title).slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const openExternal = (url) => window.open(url, '_blank', 'noopener,noreferrer');

/** Google RSS "summaries" usually just repeat the headline. */
const hasRealSummary = (s) => s.summary && !norm(s.summary).startsWith(norm(s.title).slice(0, 40));

function Photo({ story, className = '', eager = false }) {
  return (
    <span className={`bm-photo ${className}`}>
      <img
        src={story.visual.photo}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        style={{
          filter: story.visual.filter,
          objectPosition: story.visual.crop,
          '--zoom': story.visual.zoom,
        }}
      />
    </span>
  );
}

function SevBadge({ story }) {
  return (
    <span className="bm-sev" style={{ '--c': story.severityColor }}>{story.severityKey}</span>
  );
}

function StatTile({ label, value, suffix, icon: Icon, color, delay }) {
  const shown = useCountUp(value);
  return (
    <div className="bm-stat bm-reveal" style={{ '--c': color, transitionDelay: `${delay}s` }}>
      <span className="bm-stat-icon"><Icon size={16} /></span>
      <span className="bm-stat-value">{shown}{suffix}</span>
      <span className="bm-stat-label">{label}</span>
    </div>
  );
}

export default function BreachMapView({ onReturnToSOC, currentUser }) {
  const rootRef = useRef(null);
  const feedRef = useRef(null);
  const sectionRefs = useRef({});

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const [category, setCategory] = useState('All');
  const [activeSection, setActiveSection] = useState('home');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const [focusIdx, setFocusIdx] = useState(0);
  const [hold, setHold] = useState(false);
  const [feedHover, setFeedHover] = useState(false);

  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

  // ── Live data ──
  const load = useCallback((refresh = false) => {
    setLoading(true);
    fetch(`/api/threat-intel?category=All${refresh ? '&refresh=true' : ''}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.news) && data.news.length) {
          setStories(dedupe(data.news).map(enrichStory));
          setIsLive(!!data.isLiveGoogleFeed);
          setLastSync(data.lastSync || new Date().toLocaleTimeString());
        }
      })
      .catch(() => {
        setStories(prev => (prev.length ? prev : OFFLINE_STORIES.map(enrichStory)));
        setIsLive(false);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(() => load(), REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  // ── Derived views ──
  const filtered = useMemo(
    () => (category === 'All' ? stories : stories.filter(s => s.category === category)),
    [stories, category]
  );
  const located = useMemo(() => filtered.filter(s => s.geo), [filtered]);
  const ranked = useMemo(
    () => [...filtered].sort((a, b) => severityRank(b.severityKey) - severityRank(a.severityKey)),
    [filtered]
  );

  const categoryCounts = useMemo(() => {
    const counts = { All: stories.length };
    stories.forEach(s => { counts[s.category] = (counts[s.category] || 0) + 1; });
    return counts;
  }, [stories]);

  const countryStats = useMemo(() => {
    const map = new Map();
    located.forEach(s => {
      const e = map.get(s.geo.iso) || { iso: s.geo.iso, code: s.geo.code, name: s.geo.name, count: 0, top: "low" };
      e.count++;
      if (severityRank(s.severityKey) > severityRank(e.top)) e.top = s.severityKey;
      map.set(s.geo.iso, e);
    });
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [located]);

  const severityMix = useMemo(() => ['critical', 'high', 'medium', 'low'].map(k => ({
    key: k, count: filtered.filter(s => s.severityKey === k).length, color: SEVERITY_COLORS[k],
  })), [filtered]);

  const urgentCount = filtered.filter(s => severityRank(s.severityKey) >= 3).length;

  // ── Spotlight auto-cycle (map ⇄ feed) ──
  useEffect(() => { setFocusIdx(0); }, [category]);

  useEffect(() => {
    if (hold || located.length < 2) return undefined;
    const id = setInterval(() => setFocusIdx(i => (i + 1) % located.length), SPOTLIGHT_MS);
    return () => clearInterval(id);
  }, [hold, located.length]);

  const focusStory = located.length ? located[focusIdx % located.length] : null;

  useEffect(() => {
    if (!focusStory || feedHover || !feedRef.current) return;
    const el = feedRef.current.querySelector(`[data-id="${CSS.escape(focusStory.id)}"]`);
    if (el) {
      feedRef.current.scrollTo({
        top: el.offsetTop - feedRef.current.clientHeight / 2 + el.clientHeight / 2,
        behavior: 'smooth',
      });
    }
  }, [focusStory, feedHover]);

  const focusOn = (story) => {
    const idx = located.findIndex(s => s.id === story.id);
    if (idx >= 0) setFocusIdx(idx);
  };

  // ── Section navigation + active tab tracking ──
  const scrollTo = (id) => {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.dataset.section); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.values(sectionRefs.current).forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // ── Scroll-reveal animations ──
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    root.querySelectorAll('.bm-reveal:not(.is-in)').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [ranked, category]);

  // ── Keyboard: Escape closes the top-most overlay, "/" opens search ──
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (selectedStory) setSelectedStory(null);
        else if (selectedCountry) setSelectedCountry(null);
        else if (searchOpen) setSearchOpen(false);
      }
      if (e.key === '/' && !searchOpen && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedStory, selectedCountry, searchOpen]);

  const locateOnMap = (story) => {
    setSelectedStory(null);
    setSelectedCountry(null);
    if (category !== 'All' && story.category !== category) setCategory('All');
    setTimeout(() => {
      focusOn(story);
      setHold(true);
      scrollTo('map');
      setTimeout(() => setHold(false), 9000);
    }, 50);
  };

  const openCountry = (country) => {
    if (country.stories.length === 1) setSelectedStory(country.stories[0]);
    else setSelectedCountry(country);
  };

  const searchResults = useMemo(() => {
    const q = norm(query);
    if (!q) return [];
    return [...stories, ...BRIEFINGS].filter(s =>
      norm(`${s.title} ${s.source} ${s.category} ${s.geo?.name || ''} ${s.cve || ''}`).includes(q)
    ).slice(0, 12);
  }, [query, stories]);

  const featured = ranked[0];
  const secondary = ranked.slice(1, 5);
  const more = ranked.slice(5);
  const tickerItems = stories.length ? stories : OFFLINE_STORIES.map(enrichStory);
  const operator = currentUser?.username || 'Operator';
  const maxCountry = countryStats[0]?.count || 1;
  const maxCategory = Math.max(1, ...CATEGORIES.slice(1).map(c => categoryCounts[c] || 0));

  const setSectionRef = (id) => (el) => { sectionRefs.current[id] = el; };

  return (
    <div className="bm-root" ref={rootRef}>
      {/* ─── NAV ─── */}
      <nav className="bm-nav">
        <button type="button" className="bm-brand" onClick={() => scrollTo('home')}>
          <span className="bm-brand-mark">
            <Globe size={18} />
            <MapPin size={12} className="bm-brand-pin" />
          </span>
          <span className="bm-brand-text">
            <small>THE</small>
            <strong>BREACH MAP</strong>
          </span>
        </button>

        <div className="bm-nav-links">
          {NAV.map(n => (
            <button
              type="button"
              key={n.id}
              className={`bm-nav-link ${activeSection === n.id ? 'is-active' : ''}`}
              onClick={() => scrollTo(n.id)}
            >
              {n.label}
            </button>
          ))}
          <button type="button" className="bm-nav-link" onClick={() => setSearchOpen(true)}>
            SEARCH <Search size={13} />
          </button>
        </div>

        <div className="bm-nav-actions">
          <span className="bm-operator" title="Signed-in SOC operator">
            <User size={13} /> {operator}
          </span>
          <button type="button" className="bm-btn-soc" onClick={onReturnToSOC}>
            <Shield size={14} /> RETURN TO SOC
          </button>
        </div>
      </nav>

      {/* ─── BREAKING TICKER ─── */}
      <div className="bm-ticker" aria-label="Breaking cyber headlines">
        <span className="bm-ticker-tag"><Flame size={13} /> BREAKING</span>
        <div className="bm-ticker-track">
          <div className="bm-ticker-rail" style={{ animationDuration: `${Math.max(40, tickerItems.length * 7)}s` }}>
            {[...tickerItems, ...tickerItems].map((s, i) => (
              <button type="button" key={`${s.id}-${i}`} className="bm-ticker-item" onClick={() => setSelectedStory(s)} tabIndex={i >= tickerItems.length ? -1 : 0}>
                <i style={{ background: s.severityColor }} />
                <b>{s.geo ? s.geo.code : 'GLOBAL'}</b>
                {s.title}
                <span>{s.source}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="bm-main">
        {/* ─── HERO ─── */}
        <section className="bm-hero" ref={setSectionRef('home')} data-section="home">
          <div className="bm-hero-photo" aria-hidden="true">
            <img src="/images/state_hacking.jpg" alt="" />
          </div>
          <div className="bm-hero-grid" aria-hidden="true" />

          <div className="bm-hero-copy">
            <div className="bm-eyebrow"><span className="bm-pulse" /> GLOBAL THREAT DESK · LIVE</div>
            <h1 className="bm-hero-title">
              Real-time cybersecurity <span className="bm-glitch" data-text="threat intelligence">threat intelligence</span>
            </h1>
            <p className="bm-hero-sub">
              Breaking breaches, ransomware and zero-days from the last 24 hours — plotted live on the world map as they hit the wire.
            </p>
            <div className="bm-hero-chips">
              <span className={`bm-chip-live ${isLive ? '' : 'is-off'}`}>
                <span className="bm-pulse" /> {isLive ? 'GOOGLE NEWS · 24H LIVE' : 'OFFLINE · SAMPLE DATA'}
              </span>
              {lastSync && <span className="bm-chip-muted"><Clock size={12} /> Synced {lastSync}</span>}
              <button type="button" className="bm-btn-ghost" onClick={() => load(true)} disabled={loading}>
                <RotateCw size={13} className={loading ? 'bm-spin' : undefined} /> {loading ? 'Syncing…' : 'Sync now'}
              </button>
              <button type="button" className="bm-btn-primary" onClick={() => scrollTo('map')}>
                <Crosshair size={14} /> Open live map
              </button>
            </div>
          </div>

          <div className="bm-stats">
            <StatTile label="Live stories (24h)" value={filtered.length} icon={Newspaper} color="#00e5ff" delay={0} />
            <StatTile label="Countries on the map" value={countryStats.length} icon={Globe} color="#00ffd5" delay={0.06} />
            <StatTile label="Critical / high severity" value={urgentCount} icon={Flame} color="#ff2a55" delay={0.12} />
            <StatTile label="Stories geolocated" value={located.length} suffix={`/${filtered.length}`} icon={Target} color="#ff9100" delay={0.18} />
          </div>
        </section>

        {/* ─── FILTERS ─── */}
        <div className="bm-filterbar bm-reveal">
          <div className="bm-chips">
            {CATEGORIES.map(c => {
              const style = CATEGORY_STYLE[c];
              return (
                <button
                  type="button"
                  key={c}
                  className={`bm-chip ${category === c ? 'is-active' : ''}`}
                  style={style ? { '--c': style.color } : undefined}
                  onClick={() => setCategory(c)}
                  aria-pressed={category === c}
                >
                  {c}
                  <span>{categoryCounts[c] || 0}</span>
                </button>
              );
            })}
          </div>
          <button type="button" className="bm-search-trigger" onClick={() => setSearchOpen(true)}>
            <Search size={14} /> Search headlines, CVEs, countries… <kbd>/</kbd>
          </button>
        </div>

        {/* ─── MAP + FEED ─── */}
        <section className="bm-map-section" ref={setSectionRef('map')} data-section="map">
          <div className="bm-section-head bm-reveal">
            <div>
              <div className="bm-eyebrow">Global live threat map</div>
              <h2>Where cyber attacks are hitting right now</h2>
            </div>
            <span className="bm-section-note"><Info size={13} /> Pins come from real headlines · location basis shown on every story</span>
          </div>

          <div className="bm-map-grid">
            <div className="bm-map-card bm-reveal">
              <BreachWorldMap
                stories={filtered}
                focusStory={focusStory}
                onCountrySelect={openCountry}
                onInteract={setHold}
              />
              {focusStory && (
                <button type="button" className="bm-map-caption" onClick={() => setSelectedStory(focusStory)}>
                  <Radio size={13} />
                  <em>NOW TRACKING</em>
                  <b>{focusStory.geo.name}</b>
                  <span>{focusStory.title}</span>
                  <ChevronRight size={14} />
                </button>
              )}
            </div>

            <aside
              className="bm-feed bm-reveal"
              onMouseEnter={() => { setFeedHover(true); setHold(true); }}
              onMouseLeave={() => { setFeedHover(false); setHold(false); }}
            >
              <div className="bm-feed-head">
                <span><span className="bm-pulse" /> LIVE INCIDENT FEED</span>
                <span className="bm-feed-count">{filtered.length}</span>
              </div>
              <div className="bm-feed-list" ref={feedRef}>
                {loading && !stories.length && Array.from({ length: 6 }).map((_, i) => <div key={i} className="bm-skel" />)}
                {filtered.map(s => (
                  <button
                    type="button"
                    key={s.id}
                    data-id={s.id}
                    className={`bm-feed-item ${focusStory?.id === s.id ? 'is-focus' : ''}`}
                    style={{ '--c': s.severityColor }}
                    onMouseEnter={() => s.geo && focusOn(s)}
                    onClick={() => setSelectedStory(s)}
                  >
                    <Photo story={s} className="bm-feed-thumb" />
                    <span className="bm-feed-body">
                      <span className="bm-feed-meta">
                        <SevBadge story={s} />
                        <span className="bm-geo-tag">{s.geo ? <><MapPin size={10} />{s.geo.code}</> : <><Globe size={10} />GLOBAL</>}</span>
                        <span className="bm-feed-time">{s.time}</span>
                      </span>
                      <span className="bm-feed-title">{s.title}</span>
                      <span className="bm-feed-source">{s.source}</span>
                    </span>
                  </button>
                ))}
                {!loading && !filtered.length && (
                  <div className="bm-empty">No live stories in this category right now.</div>
                )}
              </div>
            </aside>
          </div>
        </section>

        {/* ─── TOP STORIES ─── */}
        <section className="bm-news" ref={setSectionRef('news')} data-section="news">
          <div className="bm-section-head bm-reveal">
            <div>
              <div className="bm-eyebrow">Latest news</div>
              <h2>Top stories, ranked by severity</h2>
            </div>
            <span className="bm-section-note"><Zap size={13} /> Refreshes automatically every 5 minutes</span>
          </div>

          {featured ? (
            <div className="bm-top-grid">
              <article
                className="bm-feature bm-reveal"
                data-story
                style={{ '--c': featured.severityColor }}
                onClick={() => setSelectedStory(featured)}
              >
                <Photo story={featured} className="bm-feature-photo" eager />
                <div className="bm-feature-shade" />
                <div className="bm-scanline" />
                <div className="bm-feature-body">
                  <div className="bm-card-tags">
                    <span className="bm-cat" style={{ '--c': featured.visual.color }}>{featured.visual.label}</span>
                    <SevBadge story={featured} />
                    {featured.geo && <span className="bm-geo-tag"><MapPin size={11} />{featured.geo.name}</span>}
                  </div>
                  <h3>{featured.title}</h3>
                  {hasRealSummary(featured) && <p>{featured.summary}</p>}
                  <div className="bm-card-meta">{featured.source} · {featured.time}</div>
                </div>
              </article>

              <div className="bm-secondary">
                {secondary.map((s, i) => (
                  <article
                    key={s.id}
                    className="bm-card bm-reveal"
                    style={{ '--c': s.severityColor, transitionDelay: `${i * 0.06}s` }}
                    onClick={() => setSelectedStory(s)}
                  >
                    <Photo story={s} className="bm-card-photo" />
                    <div className="bm-card-shade" />
                    <div className="bm-card-body">
                      <div className="bm-card-tags">
                        <span className="bm-cat" style={{ '--c': s.visual.color }}>{s.visual.label}</span>
                        <SevBadge story={s} />
                      </div>
                      <h4>{s.title}</h4>
                      <div className="bm-card-meta">{s.source} · {s.time}</div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="bm-top-grid"><div className="bm-skel bm-skel-feature" /><div className="bm-skel bm-skel-feature" /></div>
          )}

          {more.length > 0 && (
            <div className="bm-more-grid">
              {more.map((s, i) => (
                <article
                  key={s.id}
                  className="bm-mini bm-reveal"
                  style={{ '--c': s.severityColor, transitionDelay: `${(i % 4) * 0.05}s` }}
                  onClick={() => setSelectedStory(s)}
                >
                  <Photo story={s} className="bm-mini-photo" />
                  <div className="bm-mini-body">
                    <div className="bm-card-tags">
                      <SevBadge story={s} />
                      <span className="bm-geo-tag">{s.geo ? <><MapPin size={10} />{s.geo.name}</> : <><Globe size={10} />Global</>}</span>
                    </div>
                    <h5>{s.title}</h5>
                    <div className="bm-card-meta">{s.source} · {s.time}</div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ─── THREAT LANDSCAPE ─── */}
        <section className="bm-intel" ref={setSectionRef('intel')} data-section="intel">
          <div className="bm-section-head bm-reveal">
            <div>
              <div className="bm-eyebrow">Threat intel</div>
              <h2>Today’s threat landscape</h2>
            </div>
          </div>

          <div className="bm-intel-grid">
            <div className="bm-panel bm-reveal">
              <div className="bm-panel-title"><Target size={14} /> Most targeted (by coverage)</div>
              {countryStats.slice(0, 7).map(c => (
                <button type="button" key={c.iso} className="bm-bar-row" onClick={() => {
                  const cs = located.filter(s => s.geo.iso === c.iso);
                  openCountry({ iso: c.iso, name: c.name, stories: cs });
                }}>
                  <span className="bm-bar-label"><b>{c.code}</b>{c.name}</span>
                  <span className="bm-bar-track"><span style={{ width: `${(c.count / maxCountry) * 100}%`, '--c': SEVERITY_COLORS[c.top] }} /></span>
                  <span className="bm-bar-value">{c.count}</span>
                </button>
              ))}
              {!countryStats.length && <div className="bm-empty">No geolocated stories yet.</div>}
            </div>

            <div className="bm-panel bm-reveal" style={{ transitionDelay: '0.06s' }}>
              <div className="bm-panel-title"><BarChart3 size={14} /> Attack categories</div>
              {CATEGORIES.slice(1).map(c => (
                <button type="button" key={c} className="bm-bar-row" onClick={() => { setCategory(c); scrollTo('map'); }}>
                  <span className="bm-bar-label">{c}</span>
                  <span className="bm-bar-track"><span style={{ width: `${((categoryCounts[c] || 0) / maxCategory) * 100}%`, '--c': CATEGORY_STYLE[c].color }} /></span>
                  <span className="bm-bar-value">{categoryCounts[c] || 0}</span>
                </button>
              ))}
            </div>

            <div className="bm-panel bm-reveal" style={{ transitionDelay: '0.12s' }}>
              <div className="bm-panel-title"><Flame size={14} /> Severity mix</div>
              <div className="bm-stack">
                {severityMix.filter(s => s.count).map(s => (
                  <span key={s.key} style={{ flexGrow: s.count, background: s.color, color: s.color }} title={`${s.key}: ${s.count}`} />
                ))}
              </div>
              <div className="bm-sev-legend">
                {severityMix.map(s => (
                  <div key={s.key} style={{ '--c': s.color }}>
                    <i />
                    <span>{s.key}</span>
                    <b>{s.count}</b>
                  </div>
                ))}
              </div>
              <div className="bm-method">
                <Info size={13} />
                <p>
                  Headlines come live from Google News (last 24h). Locations are inferred from the story text — a named country,
                  a well-known organisation’s home country, or the publisher’s country — and the basis is shown on each story.
                  Background arcs on the map are illustrative traffic, not real telemetry.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── ANALYST BRIEFINGS ─── */}
        <section className="bm-reports" ref={setSectionRef('reports')} data-section="reports">
          <div className="bm-section-head bm-reveal">
            <div>
              <div className="bm-eyebrow">Reports</div>
              <h2>Analyst briefings</h2>
            </div>
            <span className="bm-section-note"><FileText size={13} /> Sample scenarios with indicators of compromise</span>
          </div>
          <div className="bm-report-grid">
            {BRIEFINGS.map((b, i) => (
              <article
                key={b.id}
                className="bm-report bm-reveal"
                style={{ transitionDelay: `${i * 0.08}s`, '--c': b.severityColor }}
                onClick={() => setSelectedStory(b)}
              >
                <Photo story={b} className="bm-report-photo" />
                <div className="bm-card-shade" />
                <div className="bm-report-body">
                  <div className="bm-card-tags">
                    <span className="bm-cat" style={{ '--c': b.visual.color }}>{b.visual.label}</span>
                    <SevBadge story={b} />
                    <span className="bm-sample">SAMPLE</span>
                  </div>
                  <h4>{b.title}</h4>
                  <p>{b.summary}</p>
                  <span className="bm-report-cta">Read briefing <ChevronRight size={14} /></span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bm-footer">
        <div className="bm-footer-links">
          {NAV.map(n => (
            <button type="button" key={n.id} onClick={() => scrollTo(n.id)}>{n.label}</button>
          ))}
        </div>
        <div className="bm-footer-note">
          Live headlines via Google News RSS · Locations inferred from headline text · © {new Date().getFullYear()} THE BREACH MAP × ZEROLOCK
        </div>
      </footer>

      {/* ─── STORY MODAL ─── */}
      {selectedStory && (
        <div className="bm-modal-backdrop" onClick={() => setSelectedStory(null)}>
          <article
            className="bm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bm-story-title"
            style={{ '--c': selectedStory.severityColor }}
            onClick={e => e.stopPropagation()}
          >
            <div className="bm-modal-hero">
              <Photo story={selectedStory} className="bm-modal-photo" eager />
              <div className="bm-modal-hero-shade" />
              <div className="bm-scanline" />
              <button type="button" className="bm-modal-close" onClick={() => setSelectedStory(null)} aria-label="Close">
                <X size={18} />
              </button>
              <div className="bm-modal-hero-tags">
                <span className="bm-cat" style={{ '--c': selectedStory.visual.color }}>{selectedStory.visual.label}</span>
                <SevBadge story={selectedStory} />
                {selectedStory.isBriefing && <span className="bm-sample">SAMPLE SCENARIO</span>}
              </div>
            </div>

            <div className="bm-modal-body">
              <h2 id="bm-story-title">{selectedStory.title}</h2>
              <div className="bm-modal-meta">
                <span><Newspaper size={13} /> {selectedStory.source}</span>
                <span><Clock size={13} /> {selectedStory.time}</span>
                {selectedStory.cve && <span className="bm-cve">{selectedStory.cve}</span>}
              </div>

              {selectedStory.content
                ? <p className="bm-modal-text">{selectedStory.content}</p>
                : hasRealSummary(selectedStory)
                  ? <p className="bm-modal-text">{selectedStory.summary}</p>
                  : <p className="bm-modal-text muted">Headline via Google News. The full report is available from {selectedStory.source}.</p>}

              <div className="bm-geo-card">
                <MapPin size={16} />
                <div>
                  <b>{selectedStory.geo ? `${selectedStory.geo.name} (${selectedStory.geo.code})` : 'Global / unspecified'}</b>
                  <span>{geoBasisLabel(selectedStory.geo, selectedStory.source)}</span>
                  {selectedStory.actor && (
                    <span className="bm-actor">Attributed actor origin: {selectedStory.actor.name} (“{selectedStory.actor.evidence}”)</span>
                  )}
                </div>
              </div>

              {selectedStory.iocs && (
                <div className="bm-iocs">
                  <div>INDICATORS OF COMPROMISE</div>
                  {selectedStory.iocs.map(ioc => <code key={ioc}>{ioc}</code>)}
                </div>
              )}

              <div className="bm-modal-actions">
                {selectedStory.link && (
                  <button type="button" className="bm-btn-primary" onClick={() => openExternal(selectedStory.link)}>
                    Read full story <ExternalLink size={13} />
                  </button>
                )}
                {selectedStory.geo && !selectedStory.isBriefing && (
                  <button type="button" className="bm-btn-ghost" onClick={() => locateOnMap(selectedStory)}>
                    <Crosshair size={14} /> Locate on map
                  </button>
                )}
                <button type="button" className="bm-btn-soc" onClick={onReturnToSOC}>
                  <Shield size={14} /> Send to ZEROLOCK SIEM
                </button>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* ─── COUNTRY BRIEFING MODAL ─── */}
      {selectedCountry && (
        <div className="bm-modal-backdrop" onClick={() => setSelectedCountry(null)}>
          <div className="bm-modal bm-modal-sm" role="dialog" aria-modal="true" aria-labelledby="bm-country-title" onClick={e => e.stopPropagation()}>
            <div className="bm-modal-body">
              <button type="button" className="bm-modal-close is-inline" onClick={() => setSelectedCountry(null)} aria-label="Close">
                <X size={18} />
              </button>
              <div className="bm-eyebrow">Country briefing</div>
              <h2 id="bm-country-title" className="bm-country-title">
                <MapPin size={20} /> {selectedCountry.name}
                <span>{selectedCountry.stories.length} live stories</span>
              </h2>
              <div className="bm-country-list">
                {selectedCountry.stories.map(s => (
                  <button type="button" key={s.id} className="bm-feed-item" style={{ '--c': s.severityColor }} onClick={() => setSelectedStory(s)}>
                    <Photo story={s} className="bm-feed-thumb" />
                    <span className="bm-feed-body">
                      <span className="bm-feed-meta"><SevBadge story={s} /><span className="bm-feed-time">{s.time}</span></span>
                      <span className="bm-feed-title">{s.title}</span>
                      <span className="bm-feed-source">{s.source}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── SEARCH ─── */}
      {searchOpen && (
        <div className="bm-modal-backdrop is-top" onClick={() => setSearchOpen(false)}>
          <div className="bm-search" role="dialog" aria-modal="true" aria-label="Search headlines" onClick={e => e.stopPropagation()}>
            <div className="bm-search-input">
              <Search size={18} />
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search live headlines, CVEs, companies, countries…"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={16} /></button>
            </div>
            {!query && (
              <div className="bm-search-suggest">
                <span>Try:</span>
                {['ransomware', 'data breach', 'zero-day', 'AI', 'Microsoft', 'Europe'].map(q => (
                  <button type="button" key={q} onClick={() => setQuery(q)}>{q}</button>
                ))}
              </div>
            )}
            <div className="bm-search-results">
              {query && !searchResults.length && <div className="bm-empty">No matches in today’s feed.</div>}
              {searchResults.map(s => (
                <button type="button" key={s.id} className="bm-search-row" onClick={() => { setSearchOpen(false); setSelectedStory(s); }}>
                  <i style={{ background: s.severityColor }} />
                  <span>
                    <b>{s.title}</b>
                    <small>{s.source} · {s.geo ? s.geo.name : 'Global'} · {s.category}</small>
                  </span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
