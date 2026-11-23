import React, { useState, useEffect, useRef } from 'react';
import {
  User, Lock, Mail, Building, ShieldCheck, Eye, EyeOff,
  ArrowRight, AlertCircle, CheckCircle2, LayoutDashboard, Fingerprint,
  Radar, Zap, KeyRound
} from 'lucide-react';

import ZeroLockLogo from './ZeroLockLogo.jsx';
import CyberCanvasBackground from './CyberCanvasBackground.jsx';

const BOOT_SEQUENCE = [
  { text: '[BOOT] Initializing ZeroLock Security Core v4.2.1...', color: '#5d6b82' },
  { text: '[OK] Quantum encryption module loaded', color: '#00e676' },
  { text: '[OK] Neural threat detection engine: ACTIVE', color: '#00e676' },
  { text: '[SYS] Loading certificate authority chains...', color: '#5d6b82' },
  { text: '[OK] TLS 1.3 handshake protocol: VERIFIED', color: '#00e676' },
  { text: '[NET] Establishing secure tunnel to SOC-CENTRAL...', color: '#00b0ff' },
  { text: '[OK] Firewall rules synchronized (2,847 rules)', color: '#00e676' },
  { text: '[WARN] 3 anomalous login attempts detected', color: '#ff9100' },
  { text: '[SYS] Biometric authentication subsystem: STANDBY', color: '#5d6b82' },
  { text: '[OK] Multi-factor authentication: ENABLED', color: '#00e676' },
  { text: '[NET] VPN mesh network: 12 nodes connected', color: '#00b0ff' },
  { text: '[OK] Intrusion Detection System: MONITORING', color: '#00e676' },
  { text: '[SYS] Awaiting operator credentials...', color: 'var(--accent-cyan)' },
  { text: '█', color: 'var(--accent-cyan)' },
];

const FEATURES = [
  { icon: Radar, value: '24/7', label: 'Threat monitoring' },
  { icon: ShieldCheck, value: '2,847', label: 'Firewall rules' },
  { icon: Zap, value: '<15m', label: 'Mean response' },
];

export default function LoginView({ onLoginSuccess }) {
  const [mode, setMode] = useState('login');

  // Login State
  const [username, setUsername] = useState('admin@zerolock.io');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register State
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Terminal boot log
  const [bootLines, setBootLines] = useState([]);
  const terminalRef = useRef(null);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < BOOT_SEQUENCE.length) {
        const nextLine = BOOT_SEQUENCE[index];
        if (nextLine && nextLine.color) {
          setBootLines(prev => [...prev, nextLine]);
        }
        index++;
      } else {
        clearInterval(interval);
      }
    }, 280);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [bootLines]);

  const calculateStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 5) score++;
    if (pass.length > 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = calculateStrength(regPassword);
  const getStrengthColor = (score) => {
    if (score <= 2) return 'var(--status-danger)';
    if (score <= 3) return 'var(--status-warning)';
    return 'var(--status-success)';
  };

  const switchMode = (next) => {
    setMode(next);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg(''); setLoading(true);
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, password: loginPassword })
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success) {
          setSuccessMsg('Access Granted — Initializing Session...');
          setTimeout(() => onLoginSuccess(data.user), 800);
        } else {
          setErrorMsg(data.message || 'Invalid credentials');
        }
      })
      .catch(() => {
        setLoading(false);
        onLoginSuccess({
          username: username.split('@')[0] || 'Operator',
          email: username,
          role: 'System Administrator',
          clearance: 'LEVEL-5'
        });
      });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg('');
    if (regPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setLoading(true);
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email: workEmail, organization: companyName, password: regPassword })
    })
      .then(res => res.json())
      .then(data => {
        setLoading(false);
        if (data.success) {
          setSuccessMsg('Account created — Authenticating...');
          setTimeout(() => onLoginSuccess(data.user), 900);
        } else {
          setErrorMsg(data.message || 'Registration failed');
        }
      })
      .catch(() => {
        setLoading(false);
        onLoginSuccess({
          username: fullName || workEmail.split('@')[0] || 'NewOperator',
          email: workEmail, organization: companyName,
          role: 'Security Analyst', clearance: 'LEVEL-3'
        });
      });
  };

  return (
    <div className="login-shell">
      <CyberCanvasBackground />
      <div className="app-ambient" aria-hidden="true" />

      {/* ─── LEFT: brand + boot terminal ─── */}
      <aside className="login-aside">
        <div className="login-grid-bg" aria-hidden="true" />

        <div className="animate-in">
          <ZeroLockLogo size={58} />
        </div>

        <div className="animate-in animate-in-delay-1">
          <div className="page-eyebrow">Security Operations Center</div>
          <h2 className="login-headline">
            Cyber Security<br />
            <span className="text-gradient">Operations</span> <span className="text-gold">Center</span>
          </h2>
          <p className="login-lead">
            Enterprise-grade threat detection, real-time monitoring, and automated incident response — unified in one command console.
          </p>
        </div>

        <div className="login-features animate-in animate-in-delay-2">
          {FEATURES.map(({ icon: Icon, value, label }) => (
            <div key={label} className="login-feature">
              <Icon size={18} />
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="terminal animate-in animate-in-delay-3">
          <div className="terminal-bar">
            <i style={{ background: '#ff5f57' }} />
            <i style={{ background: '#febc2e' }} />
            <i style={{ background: '#28c840' }} />
            <span>zerolock-soc@terminal ~ boot.log</span>
          </div>
          <div ref={terminalRef} className="terminal-body">
            {bootLines.filter(Boolean).map((line, i) => (
              <div key={i} style={{ color: line?.color || 'var(--accent-cyan)' }}>
                {line?.text || ''}
              </div>
            ))}
          </div>
        </div>

        <div className="login-aside-status animate-in animate-in-delay-4">
          <span>ENCRYPTION: <span style={{ color: 'var(--status-success)' }}>AES-256</span></span>
          <span>PROTOCOL: <span style={{ color: 'var(--accent-cyan)' }}>TLS 1.3</span></span>
          <span>STATUS: <span style={{ color: 'var(--status-success)' }}>SECURE</span></span>
        </div>
      </aside>

      {/* ─── RIGHT: auth form ─── */}
      <main className="login-main">
        <div className="login-topbar">
          <span className="secure-chip"><span className="live-dot" /> SECURE CHANNEL · TLS 1.3</span>
          <button
            className="btn-cyber-outline"
            style={{ marginLeft: 'auto' }}
            onClick={() => onLoginSuccess({ username: 'Admin', role: 'System Administrator' })}
          >
            <LayoutDashboard size={13} /> Skip to Dashboard
          </button>
        </div>

        <div className="login-mobile-brand">
          <ZeroLockLogo size={46} />
        </div>

        <div className="zerolock-frame">
          <div className="frame-corner-tr" />
          <div className="frame-corner-bl" />

          <div className="login-emblem">
            <div><Fingerprint size={26} /></div>
          </div>
          <h2 className="login-frame-title">
            {mode === 'login' ? 'SECURE ACCESS' : 'CREATE ACCOUNT'}
          </h2>
          <p className="login-frame-sub">
            {mode === 'login' ? 'Authenticate to enter the command console' : 'Register for a new operator account'}
          </p>

          <div className="segmented" role="tablist" aria-label="Authentication mode">
            <button
              type="button" role="tab" aria-selected={mode === 'login'}
              className={mode === 'login' ? 'active' : ''}
              onClick={() => switchMode('login')}
            >
              Sign In
            </button>
            <button
              type="button" role="tab" aria-selected={mode === 'register'}
              className={mode === 'register' ? 'active' : ''}
              onClick={() => switchMode('register')}
            >
              Request Access
            </button>
          </div>

          {errorMsg && (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={15} /> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="alert alert-success" role="status">
              <CheckCircle2 size={15} /> {successMsg}
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ animation: 'fadeInUp 0.4s var(--ease-out)' }}>
              <div className="zerolock-form-group">
                <label className="zerolock-label" htmlFor="zl-login-user">Email or username</label>
                <div className="zerolock-input-wrap">
                  <input
                    id="zl-login-user" type="text" className="zerolock-input"
                    autoComplete="username"
                    value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="Enter your email" required
                  />
                  <User size={16} className="zerolock-input-icon" />
                </div>
              </div>

              <div className="zerolock-form-group">
                <label className="zerolock-label" htmlFor="zl-login-pass">Password</label>
                <div className="zerolock-input-wrap">
                  <input
                    id="zl-login-pass"
                    type={showLoginPassword ? 'text' : 'password'}
                    className="zerolock-input has-action"
                    autoComplete="current-password"
                    value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter your password" required
                  />
                  <Lock size={16} className="zerolock-input-icon" />
                  <button
                    type="button" className="input-action"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="zerolock-btn-primary" disabled={loading}>
                {loading ? (
                  <><span className="btn-spinner" /> AUTHENTICATING...</>
                ) : (
                  <>INITIALIZE SESSION <ArrowRight size={15} /></>
                )}
              </button>

              <div className="form-links">
                <a href="#">Forgot password?</a>
                <span className="mono"><KeyRound size={11} /> MFA ENFORCED</span>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ animation: 'fadeInUp 0.4s var(--ease-out)' }}>
              <div className="zerolock-form-group" style={{ marginBottom: '13px' }}>
                <label className="zerolock-label" htmlFor="zl-reg-name">Full name</label>
                <div className="zerolock-input-wrap">
                  <input id="zl-reg-name" type="text" className="zerolock-input is-compact"
                    autoComplete="name"
                    value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Enter your full name" required />
                  <User size={15} className="zerolock-input-icon" />
                </div>
              </div>

              <div className="zerolock-form-group" style={{ marginBottom: '13px' }}>
                <label className="zerolock-label" htmlFor="zl-reg-email">Work email</label>
                <div className="zerolock-input-wrap">
                  <input id="zl-reg-email" type="email" className="zerolock-input is-compact"
                    autoComplete="email"
                    value={workEmail} onChange={e => setWorkEmail(e.target.value)}
                    placeholder="Enter your work email" required />
                  <Mail size={15} className="zerolock-input-icon" />
                </div>
              </div>

              <div className="zerolock-form-group" style={{ marginBottom: '13px' }}>
                <div className="zerolock-label">
                  <label htmlFor="zl-reg-pass">Password</label>
                  <div className="strength-meter-container" title={`Strength: ${strengthScore}/5`}>
                    {[1, 2, 3, 4, 5].map(step => (
                      <div key={step} className="strength-segment"
                        style={{
                          background: step <= strengthScore ? getStrengthColor(strengthScore) : undefined,
                          boxShadow: step <= strengthScore ? `0 0 6px ${getStrengthColor(strengthScore)}` : 'none'
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="zerolock-input-wrap">
                  <input
                    id="zl-reg-pass"
                    type={showRegPassword ? 'text' : 'password'}
                    className="zerolock-input is-compact has-action"
                    autoComplete="new-password"
                    value={regPassword} onChange={e => setRegPassword(e.target.value)}
                    placeholder="Create a strong password" required />
                  <ShieldCheck size={15} className="zerolock-input-icon" />
                  <button
                    type="button" className="input-action"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="zerolock-form-group" style={{ marginBottom: '13px' }}>
                <label className="zerolock-label" htmlFor="zl-reg-confirm">Confirm password</label>
                <div className="zerolock-input-wrap">
                  <input id="zl-reg-confirm" type="password" className="zerolock-input is-compact"
                    autoComplete="new-password"
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password" required />
                  <Lock size={15} className="zerolock-input-icon" />
                </div>
              </div>

              <div className="zerolock-form-group" style={{ marginBottom: '16px' }}>
                <label className="zerolock-label" htmlFor="zl-reg-org">Organization</label>
                <div className="zerolock-input-wrap">
                  <input id="zl-reg-org" type="text" className="zerolock-input is-compact"
                    autoComplete="organization"
                    value={companyName} onChange={e => setCompanyName(e.target.value)}
                    placeholder="Enter your organization" />
                  <Building size={15} className="zerolock-input-icon" />
                </div>
              </div>

              <button type="submit" className="zerolock-btn-primary" style={{ height: '44px' }} disabled={loading}>
                {loading ? <><span className="btn-spinner" /> CREATING ACCOUNT...</> : <>REGISTER ACCOUNT <ArrowRight size={15} /></>}
              </button>
            </form>
          )}
        </div>

        <div className="login-copyright">
          © {new Date().getFullYear()} ZEROLOCK CYBER SECURITY — ALL RIGHTS RESERVED
        </div>
      </main>
    </div>
  );
}
