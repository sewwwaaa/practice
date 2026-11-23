import React, { useEffect, useRef, useState } from 'react';
import {
  Gauge, ShieldCheck, Search, Terminal, Eye, Globe,
  Satellite, AlertTriangle, AlertCircle, Server, FileText,
  Settings, Bell, ChevronDown, LogOut, FileCheck,
  Menu, PanelLeftClose, PanelLeftOpen, Clock
} from 'lucide-react';

import LoginView from './components/LoginView.jsx';
import DashboardView from './components/DashboardView.jsx';
import SecurityServicesView from './components/SecurityServicesView.jsx';
import VulnerabilityScannerView from './components/VulnerabilityScannerView.jsx';
import ThreatIntelView from './components/ThreatIntelView.jsx';
import AdminPortalView from './components/AdminPortalView.jsx';
import CyberCanvasBackground from './components/CyberCanvasBackground.jsx';
import BreachMapView from './components/BreachMapView.jsx';
import ZeroLockLogo from './components/ZeroLockLogo.jsx';
import { useClock } from './components/ui.jsx';

const DEFAULT_USER = {
  username: 'Admin',
  email: 'admin@zerolock.io',
  role: 'System Administrator'
};

const NAV_ITEMS = [
  { section: 'Command Center' },
  { id: 'dashboard', label: 'Dashboard', icon: Gauge },
  { id: 'services', label: 'Security Services', icon: ShieldCheck },
  { id: 'vuln', label: 'Vulnerability Scanner', icon: Search },
  { id: 'pentest', label: 'Penetration Testing', icon: Terminal },
  { id: 'monitoring', label: 'Security Monitoring', icon: Eye },
  { section: 'Intelligence' },
  { id: 'threat-intel', label: 'Threat Intelligence', icon: Globe },
  { id: 'news', label: 'Cyber News', icon: Satellite },
  { section: 'Operations' },
  { id: 'alerts', label: 'Security Alerts', icon: AlertTriangle, fallback: 'dashboard', badge: 3 },
  { id: 'incidents', label: 'Incidents', icon: AlertCircle, fallback: 'dashboard', badge: 2, badgeTone: 'warn' },
  { id: 'assets', label: 'Assets', icon: Server, fallback: 'admin' },
  { section: 'Management' },
  { id: 'reports', label: 'Reports', icon: FileCheck, fallback: 'admin' },
  { id: 'audit', label: 'Audit Logs', icon: FileText },
  { id: 'admin', label: 'Admin Portal', icon: Settings },
];

const VIEW_META = {
  dashboard: { section: 'Command Center', title: 'Security Command Center' },
  services: { section: 'Command Center', title: 'Security Services' },
  vuln: { section: 'Command Center', title: 'Vulnerability Scanner' },
  pentest: { section: 'Command Center', title: 'Penetration Testing' },
  monitoring: { section: 'Command Center', title: 'Security Monitoring' },
  'threat-intel': { section: 'Intelligence', title: 'Threat Intelligence' },
  admin: { section: 'Management', title: 'Admin Portal' },
  audit: { section: 'Management', title: 'Audit Logs' },
};

/** Isolated so the per-second tick only re-renders the clock, not the whole app. */
function TopbarClock() {
  const now = useClock();
  const time = now.toLocaleTimeString('en-GB', { hour12: false });
  const date = now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();
  return (
    <div className="topbar-clock" title="Local SOC time">
      <Clock size={14} style={{ color: 'var(--accent-cyan)' }} />
      {time}
      <small>{date}</small>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return localStorage.getItem('zerolock_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('zerolock_user');
      return saved ? JSON.parse(saved) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('zerolock_sidebar') === 'collapsed';
    } catch {
      return false;
    }
  });
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const searchRef = useRef(null);

  // Ctrl/⌘ + K focuses the global search; Escape closes the mobile drawer.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleSidebar = () => {
    if (window.matchMedia('(max-width: 1024px)').matches) {
      setMobileNavOpen(open => !open);
      return;
    }
    setSidebarCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem('zerolock_sidebar', next ? 'collapsed' : 'expanded'); } catch {}
      return next;
    });
  };

  const navigate = (view) => {
    setCurrentView(view);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const signOut = () => {
    try {
      localStorage.removeItem('zerolock_auth');
      localStorage.removeItem('zerolock_user');
    } catch {}
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return (
      <LoginView onLoginSuccess={(user) => {
        try {
          localStorage.setItem('zerolock_auth', 'true');
          localStorage.setItem('zerolock_user', JSON.stringify(user));
        } catch {}
        setCurrentUser(user);
        setIsLoggedIn(true);
        setCurrentView('dashboard');
      }} />
    );
  }

  // Full-bleed destination website for Cyber News: "THE BREACH MAP"
  if (currentView === 'news') {
    return (
      <BreachMapView
        onReturnToSOC={() => setCurrentView('dashboard')}
        currentUser={currentUser}
      />
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView onNavigate={navigate} currentUser={currentUser} />;
      case 'services':
      case 'monitoring':
      case 'pentest': return <SecurityServicesView />;
      case 'vuln': return <VulnerabilityScannerView />;
      case 'threat-intel': return <ThreatIntelView onOpenBreachMap={() => setCurrentView('news')} />;
      case 'admin':
      case 'audit': return <AdminPortalView />;
      default: return <DashboardView onNavigate={navigate} currentUser={currentUser} />;
    }
  };

  const meta = VIEW_META[currentView] || { section: 'Command Center', title: currentView };
  const initial = currentUser.username?.charAt(0).toUpperCase() || 'A';

  return (
    <div className={`app-container ${sidebarCollapsed ? 'is-collapsed' : ''} ${mobileNavOpen ? 'is-mobile-open' : ''}`}>
      <CyberCanvasBackground />
      <div className="app-ambient" aria-hidden="true" />

      {/* ─── SIDEBAR ─── */}
      <aside className="app-sidebar" aria-label="Primary navigation">
        <div className="sidebar-brand">
          <ZeroLockLogo size={36} tagline="CYBER SECURITY SOC" />
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item, idx) => {
            if (item.section) {
              return (
                <div key={`section-${idx}`} className="nav-section-title">
                  <span>{item.section}</span>
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.fallback || item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="nav-item-icon"><Icon size={16} /></span>
                <span className="nav-item-label">{item.label}</span>
                {item.badge && (
                  <span className={`nav-item-badge ${item.badgeTone === 'warn' ? 'is-warn' : ''}`}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-threat">
            <div className="sidebar-threat-head">
              <span>THREAT LEVEL</span>
              <strong>ELEVATED</strong>
            </div>
            <div className="threat-segments">
              {[0, 1, 2, 3, 4].map(i => (
                <span key={i} style={i < 3 ? {
                  background: i < 2 ? '#ffb74d' : 'var(--status-warning)',
                  boxShadow: '0 0 8px rgba(255, 145, 0, 0.5)'
                } : undefined} />
              ))}
            </div>
          </div>

          <button className="nav-item nav-item-danger" onClick={signOut} title={sidebarCollapsed ? 'Sign Out' : undefined}>
            <span className="nav-item-icon"><LogOut size={16} /></span>
            <span className="nav-item-label">Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="sidebar-backdrop" onClick={() => setMobileNavOpen(false)} aria-hidden="true" />

      {/* ─── MAIN ─── */}
      <div className="app-main-wrapper">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-btn"
              onClick={toggleSidebar}
              aria-label="Toggle navigation"
            >
              <Menu size={17} className="only-mobile" />
              {sidebarCollapsed
                ? <PanelLeftOpen size={17} className="only-desktop" />
                : <PanelLeftClose size={17} className="only-desktop" />}
            </button>

            <div className="topbar-crumbs">
              <div className="header-breadcrumbs">
                <span className="crumb-root">ZEROLOCK</span>
                <span className="crumb-sep">/</span>
                <span>{meta.section}</span>
              </div>
              <div className="topbar-title">{meta.title}</div>
            </div>
          </div>

          <div className="topbar-right">
            <label className="header-search">
              <Search size={14} />
              <input ref={searchRef} type="text" placeholder="Search systems, CVEs, assets..." />
              <span className="kbd">Ctrl K</span>
            </label>

            <TopbarClock />

            <div className="status-badge-header">
              <span className="status-dot-green" />
              SYSTEM ONLINE
            </div>

            <button className="icon-btn" aria-label="Notifications (3 unread)" onClick={() => navigate('dashboard')}>
              <Bell size={17} />
              <span className="icon-btn-badge">3</span>
            </button>

            <button className="user-chip" onClick={() => navigate('admin')} aria-label="Open admin portal">
              <span className="user-avatar">{initial}</span>
              <span className="user-meta">
                <strong>{currentUser.username || 'Admin'}</strong>
                <small>{currentUser.role || 'Administrator'}</small>
              </span>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>

        <main className="page-content" key={currentView}>
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}
