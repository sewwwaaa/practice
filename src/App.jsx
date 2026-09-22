import React, { useState } from 'react';
import {
  Shield, Gauge, ShieldCheck, Search, Terminal, Eye, Globe,
  Satellite, AlertTriangle, AlertCircle, Server, FileText,
  Settings, Bell, ChevronDown, ChevronRight, LogOut, FileCheck,
  Cpu, Activity
} from 'lucide-react';

import LoginView from './components/LoginView.jsx';
import DashboardView from './components/DashboardView.jsx';
import SecurityServicesView from './components/SecurityServicesView.jsx';
import VulnerabilityScannerView from './components/VulnerabilityScannerView.jsx';
import ThreatIntelView from './components/ThreatIntelView.jsx';
import AdminPortalView from './components/AdminPortalView.jsx';
import CyberCanvasBackground from './components/CyberCanvasBackground.jsx';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState({
    username: 'Admin',
    email: 'admin@zerolock.io',
    role: 'System Administrator'
  });
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isLoggedIn) {
    return (
      <>
        <CyberCanvasBackground />
        <LoginView onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
          setCurrentView('dashboard');
        }} />
      </>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView onNavigate={setCurrentView} />;
      case 'services':
      case 'monitoring':
      case 'pentest': return <SecurityServicesView />;
      case 'vuln': return <VulnerabilityScannerView />;
      case 'threat-intel':
      case 'news': return <ThreatIntelView />;
      case 'admin':
      case 'audit': return <AdminPortalView />;
      case 'login-demo': return <LoginView onLoginSuccess={() => setCurrentView('dashboard')} />;
      default: return <DashboardView onNavigate={setCurrentView} />;
    }
  };

  const navItems = [
    { section: 'COMMAND CENTER' },
    { id: 'dashboard', label: 'Dashboard', icon: Gauge },
    { id: 'services', label: 'Security Services', icon: ShieldCheck },
    { id: 'vuln', label: 'Vulnerability Scanner', icon: Search },
    { id: 'pentest', label: 'Penetration Testing', icon: Terminal },
    { id: 'monitoring', label: 'Security Monitoring', icon: Eye },
    { section: 'INTELLIGENCE' },
    { id: 'threat-intel', label: 'Threat Intelligence', icon: Globe },
    { id: 'news', label: 'Cyber News', icon: Satellite },
    { section: 'OPERATIONS' },
    { id: 'alerts', label: 'Security Alerts', icon: AlertTriangle, fallback: 'dashboard' },
    { id: 'incidents', label: 'Incidents', icon: AlertCircle, fallback: 'dashboard' },
    { id: 'assets', label: 'Assets', icon: Server, fallback: 'admin' },
    { section: 'MANAGEMENT' },
    { id: 'reports', label: 'Reports', icon: FileCheck, fallback: 'admin' },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'admin', label: 'Admin Portal', icon: Settings },
  ];

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  return (
    <div className="app-container">
      <CyberCanvasBackground />

      {/* ─── LEFT SIDEBAR ─── */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <Shield className="brand-icon-svg" />
          <div>
            <div className="brand-title">ZEROLOCK</div>
            <div className="brand-subtitle">Cyber Security SOC</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, idx) => {
            if (item.section) {
              return (
                <div key={`section-${idx}`} className="nav-section-title">
                  <ChevronRight size={10} />
                  {item.section}
                </div>
              );
            }

            const Icon = item.icon;
            const viewId = item.fallback || item.id;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentView(viewId)}
              >
                <div className="nav-item-content">
                  <Icon size={15} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}

          <div style={{ flex: 1 }} />

          <button
            className="nav-item"
            style={{ color: '#ff1744', marginTop: '8px' }}
            onClick={() => setIsLoggedIn(false)}
          >
            <div className="nav-item-content">
              <LogOut size={15} />
              <span>Sign Out</span>
            </div>
          </button>
        </nav>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <div className="app-main-wrapper">

        {/* Top Header Bar */}
        <div className="app-header-title-bar">
          <div className="header-top-brand">
            <Shield size={24} style={{ color: 'var(--accent-cyan)', filter: 'drop-shadow(0 0 8px rgba(0, 255, 213, 0.4))' }} />
            <h1 className="header-brand-title">ZEROLOCK</h1>
            <span style={{ color: 'rgba(0, 255, 213, 0.3)', fontSize: '18px', fontWeight: 200 }}>|</span>
            <span className="header-subtitle-tag">CYBER SECURITY OPERATIONS CENTER</span>
          </div>
        </div>

        {/* Control Sub-Header */}
        <header className="app-header-controls">
          <div className="header-breadcrumbs">
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>ZEROLOCK</span>
            {' '}<span style={{ color: '#2d3748' }}>//</span>{' '}
            <span style={{ textTransform: 'uppercase' }}>
              {currentView === 'dashboard' ? 'command center' :
               currentView === 'services' ? 'security services' :
               currentView === 'vuln' ? 'vulnerability scanner' :
               currentView === 'threat-intel' ? 'threat intelligence' :
               currentView === 'admin' ? 'admin portal' : currentView}
            </span>
          </div>

          <div className="header-actions">
            <div className="header-search">
              <input type="text" placeholder="Search systems..." />
              <Search size={13} style={{ color: '#3d4a5c' }} />
            </div>

            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={17} style={{ color: '#5a6577' }} />
              <span style={{
                position: 'absolute', top: '-5px', right: '-5px',
                background: 'var(--status-danger)', color: '#fff',
                fontSize: '8px', fontWeight: 800,
                width: '14px', height: '14px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 8px rgba(255, 23, 68, 0.4)'
              }}>3</span>
            </div>

            <div className="status-badge-header">
              <span className="status-dot-green" />
              SYSTEM ONLINE
            </div>

            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                cursor: 'pointer', padding: '4px 8px', borderRadius: '8px',
                transition: 'background 0.2s'
              }}
              onClick={() => setCurrentView('admin')}
            >
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(0, 255, 213, 0.15), rgba(0, 255, 213, 0.05))',
                border: '1px solid rgba(0, 255, 213, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent-cyan)', fontSize: '12px', fontWeight: 700,
                fontFamily: 'var(--font-display)'
              }}>
                {currentUser.username?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.2 }}>
                  {currentUser.username || 'Admin'}
                </div>
                <div style={{ fontSize: '9px', color: '#5a6577', fontFamily: 'var(--font-mono)' }}>
                  {currentUser.role || 'Administrator'}
                </div>
              </div>
              <ChevronDown size={13} style={{ color: '#3d4a5c' }} />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content" key={currentView}>
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}
