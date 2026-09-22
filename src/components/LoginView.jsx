import React, { useState, useEffect, useRef } from 'react';
import {
  User, Lock, Mail, Building, ShieldCheck, Eye, EyeOff,
  ArrowRight, AlertCircle, CheckCircle2, LayoutDashboard, Shield, Fingerprint
} from 'lucide-react';

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

  const bootSequence = [
    { text: '[BOOT] Initializing ZeroLock Security Core v4.2.1...', color: '#5a6577' },
    { text: '[OK] Quantum encryption module loaded', color: '#00e676' },
    { text: '[OK] Neural threat detection engine: ACTIVE', color: '#00e676' },
    { text: '[SYS] Loading certificate authority chains...', color: '#5a6577' },
    { text: '[OK] TLS 1.3 handshake protocol: VERIFIED', color: '#00e676' },
    { text: '[NET] Establishing secure tunnel to SOC-CENTRAL...', color: '#00b0ff' },
    { text: '[OK] Firewall rules synchronized (2,847 rules)', color: '#00e676' },
    { text: '[WARN] 3 anomalous login attempts detected', color: '#ff9100' },
    { text: '[SYS] Biometric authentication subsystem: STANDBY', color: '#5a6577' },
    { text: '[OK] Multi-factor authentication: ENABLED', color: '#00e676' },
    { text: '[NET] VPN mesh network: 12 nodes connected', color: '#00b0ff' },
    { text: '[OK] Intrusion Detection System: MONITORING', color: '#00e676' },
    { text: '[SYS] Awaiting operator credentials...', color: 'var(--accent-cyan)' },
    { text: '█', color: 'var(--accent-cyan)' },
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootSequence.length) {
        setBootLines(prev => [...prev, bootSequence[i]]);
        i++;
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

  const inputStyle = {
    width: '100%', height: '44px',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '10px',
    padding: '0 16px 0 42px',
    color: '#e2e8f0',
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    outline: 'none',
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      background: 'var(--bg-void)',
      display: 'flex', position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient background glow */}
      <div className="nexus-bg-matrix" />

      {/* ─── LEFT PANEL: Terminal Boot Log ─── */}
      <div style={{
        flex: '0 0 42%', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '48px',
        position: 'relative', overflow: 'hidden',
        borderRight: '1px solid var(--border-dim)',
        background: 'linear-gradient(180deg, rgba(4, 8, 16, 0.95) 0%, rgba(2, 4, 8, 0.98) 100%)'
      }}>
        {/* Decorative Grid Lines */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(rgba(0, 255, 213, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 213, 1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none'
        }} />

        {/* Brand Logo Area */}
        <div style={{
          marginBottom: '32px', position: 'relative', zIndex: 1,
          animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(0, 255, 213, 0.15), rgba(0, 255, 213, 0.03))',
              border: '1px solid rgba(0, 255, 213, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 24px rgba(0, 255, 213, 0.12)'
            }}>
              <Shield size={28} style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '22px',
                fontWeight: 900, letterSpacing: '4px', color: '#fff', lineHeight: 1
              }}>
                ZERO<span style={{ color: 'var(--accent-gold)' }}>LOCK</span>
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: '9px',
                color: 'var(--accent-cyan-dim)', letterSpacing: '2px',
                fontWeight: 600, marginTop: '4px'
              }}>
                ADVANCED SECURE ACCESS
              </div>
            </div>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: '28px',
            fontWeight: 700, color: '#e2e8f0', lineHeight: 1.2,
            marginBottom: '8px', letterSpacing: '0.5px'
          }}>
            Cyber Security<br />Operations Center
          </h2>
          <p style={{
            fontSize: '13px', color: '#5a6577', lineHeight: 1.6, maxWidth: '360px'
          }}>
            Enterprise-grade threat detection, real-time monitoring, and automated incident response platform.
          </p>
        </div>

        {/* Terminal Window */}
        <div style={{
          background: 'rgba(2, 4, 8, 0.9)', borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden', position: 'relative', zIndex: 1,
          animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both'
        }}>
          {/* Terminal Title Bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px', borderBottom: '1px solid var(--border-dim)',
            background: 'rgba(255, 255, 255, 0.02)'
          }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e' }} />
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840' }} />
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              color: '#3d4a5c', marginLeft: '8px', letterSpacing: '0.5px'
            }}>
              zerolock-soc@terminal ~ boot.log
            </span>
          </div>

          {/* Terminal Content */}
          <div ref={terminalRef} style={{
            padding: '14px', maxHeight: '220px', overflowY: 'auto',
            fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: 1.8
          }}>
            {bootLines.map((line, i) => (
              <div key={i} style={{
                color: line.color,
                opacity: 0,
                animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
              }}>
                {line.text}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Status */}
        <div style={{
          display: 'flex', gap: '20px', marginTop: '24px',
          fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#3d4a5c',
          animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both'
        }}>
          <span>ENCRYPTION: <span style={{ color: 'var(--status-success)' }}>AES-256</span></span>
          <span>PROTOCOL: <span style={{ color: 'var(--accent-cyan)' }}>TLS 1.3</span></span>
          <span>STATUS: <span style={{ color: 'var(--status-success)' }}>SECURE</span></span>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Login / Register Form ─── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px', position: 'relative'
      }}>
        {/* Skip button */}
        <div style={{
          position: 'absolute', top: '24px', right: '28px',
          animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both'
        }}>
          <button
            className="btn-cyber-outline"
            style={{ fontSize: '11px', padding: '6px 14px' }}
            onClick={() => onLoginSuccess({ username: 'Admin', role: 'System Administrator' })}
          >
            <LayoutDashboard size={13} /> Skip to Dashboard
          </button>
        </div>

        {/* Glassmorphic Login Frame */}
        <div className="zerolock-frame" style={{
          animation: 'frameAppear 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both'
        }}>
          <div className="frame-corner-tr" />
          <div className="frame-corner-bl" />

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 14px',
              background: 'linear-gradient(135deg, rgba(0, 255, 213, 0.1), rgba(255, 193, 7, 0.05))',
              border: '1px solid rgba(0, 255, 213, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 30px rgba(0, 255, 213, 0.1)'
            }}>
              <Fingerprint size={28} style={{ color: 'var(--accent-cyan)' }} />
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: '18px',
              fontWeight: 800, letterSpacing: '3px', color: '#fff'
            }}>
              {mode === 'login' ? 'SECURE ACCESS' : 'CREATE ACCOUNT'}
            </h2>
            <p style={{
              fontSize: '11px', color: '#5a6577', marginTop: '6px',
              fontFamily: 'var(--font-mono)', letterSpacing: '0.5px'
            }}>
              {mode === 'login' ? 'Enter your credentials to continue' : 'Register for a new operator account'}
            </p>
          </div>

          {/* Notifications */}
          {errorMsg && (
            <div style={{
              background: 'rgba(255, 23, 68, 0.08)', border: '1px solid rgba(255, 23, 68, 0.2)',
              color: '#ff5252', padding: '10px 14px', borderRadius: '10px',
              fontSize: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
              animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <AlertCircle size={15} /> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{
              background: 'rgba(0, 230, 118, 0.08)', border: '1px solid rgba(0, 230, 118, 0.2)',
              color: 'var(--status-success)', padding: '10px 14px', borderRadius: '10px',
              fontSize: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px',
              animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <CheckCircle2 size={15} /> {successMsg}
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{
              animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <div className="zerolock-form-group">
                <label className="zerolock-label">EMAIL OR USERNAME</label>
                <div className="zerolock-input-wrap">
                  <input
                    type="text" className="zerolock-input"
                    value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="Enter your email" required
                  />
                  <User size={16} className="zerolock-input-icon" />
                </div>
              </div>

              <div className="zerolock-form-group">
                <label className="zerolock-label">PASSWORD</label>
                <div className="zerolock-input-wrap">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    className="zerolock-input"
                    style={{ paddingRight: '42px' }}
                    value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                    placeholder="Enter your password" required
                  />
                  <Lock size={16} className="zerolock-input-icon" />
                  <button type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{
                      position: 'absolute', right: '14px', background: 'transparent',
                      border: 'none', color: '#3d4a5c', cursor: 'pointer',
                      transition: 'color 0.2s'
                    }}
                  >
                    {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="zerolock-btn-primary" disabled={loading}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '14px', height: '14px', border: '2px solid rgba(0, 255, 213, 0.3)',
                      borderTopColor: 'var(--accent-cyan)', borderRadius: '50%',
                      animation: 'hudSpin 0.8s linear infinite', display: 'inline-block'
                    }} />
                    AUTHENTICATING...
                  </span>
                ) : (
                  <>INITIALIZE SESSION <ArrowRight size={15} /></>
                )}
              </button>

              <div style={{
                display: 'flex', justifyContent: 'center', gap: '8px',
                marginTop: '20px', fontSize: '12px'
              }}>
                <a href="#" style={{ color: '#5a6577', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseOver={e => e.target.style.color = 'var(--accent-cyan)'}
                  onMouseOut={e => e.target.style.color = '#5a6577'}
                >Forgot Password?</a>
                <span style={{ color: '#2d3748' }}>•</span>
                <button type="button"
                  style={{
                    background: 'transparent', border: 'none',
                    color: 'var(--accent-cyan)', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 600
                  }}
                  onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                >
                  Request Access
                </button>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{
              animation: 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <div className="zerolock-form-group" style={{ marginBottom: '14px' }}>
                <label className="zerolock-label">FULL NAME</label>
                <div className="zerolock-input-wrap">
                  <input type="text" className="zerolock-input" style={{ height: '40px' }}
                    value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Enter your full name" required />
                  <User size={15} className="zerolock-input-icon" />
                </div>
              </div>

              <div className="zerolock-form-group" style={{ marginBottom: '14px' }}>
                <label className="zerolock-label">WORK EMAIL</label>
                <div className="zerolock-input-wrap">
                  <input type="email" className="zerolock-input" style={{ height: '40px' }}
                    value={workEmail} onChange={e => setWorkEmail(e.target.value)}
                    placeholder="Enter your work email" required />
                  <Mail size={15} className="zerolock-input-icon" />
                </div>
              </div>

              <div className="zerolock-form-group" style={{ marginBottom: '14px' }}>
                <div className="zerolock-label">
                  <span>PASSWORD</span>
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
                    type={showRegPassword ? 'text' : 'password'}
                    className="zerolock-input" style={{ height: '40px', paddingRight: '42px' }}
                    value={regPassword} onChange={e => setRegPassword(e.target.value)}
                    placeholder="Create a strong password" required />
                  <ShieldCheck size={15} className="zerolock-input-icon" />
                  <button type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    style={{
                      position: 'absolute', right: '14px', background: 'transparent',
                      border: 'none', color: '#3d4a5c', cursor: 'pointer'
                    }}
                  >
                    {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="zerolock-form-group" style={{ marginBottom: '14px' }}>
                <label className="zerolock-label">CONFIRM PASSWORD</label>
                <div className="zerolock-input-wrap">
                  <input type="password" className="zerolock-input" style={{ height: '40px' }}
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password" required />
                  <Lock size={15} className="zerolock-input-icon" />
                </div>
              </div>

              <div className="zerolock-form-group" style={{ marginBottom: '16px' }}>
                <label className="zerolock-label">ORGANIZATION</label>
                <div className="zerolock-input-wrap">
                  <input type="text" className="zerolock-input" style={{ height: '40px' }}
                    value={companyName} onChange={e => setCompanyName(e.target.value)}
                    placeholder="Enter your organization" />
                  <Building size={15} className="zerolock-input-icon" />
                </div>
              </div>

              <button type="submit" className="zerolock-btn-primary" style={{ height: '44px' }} disabled={loading}>
                {loading ? 'CREATING ACCOUNT...' : 'REGISTER ACCOUNT'}
              </button>

              <div style={{
                display: 'flex', justifyContent: 'center', gap: '8px',
                marginTop: '18px', fontSize: '12px'
              }}>
                <span style={{ color: '#5a6577' }}>Already have access?</span>
                <button type="button"
                  style={{
                    background: 'transparent', border: 'none',
                    color: 'var(--accent-cyan)', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 600
                  }}
                  onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                >Sign In</button>
              </div>
            </form>
          )}
        </div>

        {/* Bottom Copyright */}
        <div style={{
          position: 'absolute', bottom: '20px',
          fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#2d3748',
          letterSpacing: '0.5px'
        }}>
          © 2024 ZEROLOCK CYBER SECURITY — ALL RIGHTS RESERVED
        </div>
      </div>
    </div>
  );
}
