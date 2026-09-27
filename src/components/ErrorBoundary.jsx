import React from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ZeroLock ErrorBoundary caught]:', error, errorInfo);
  }

  handleAutoRecover = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          width: '100vw',
          background: '#020408',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#e2e8f0',
          fontFamily: "'Rajdhani', sans-serif",
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(0, 255, 213, 0.1)',
            border: '1px solid rgba(0, 255, 213, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 0 30px rgba(0, 255, 213, 0.15)'
          }}>
            <ShieldCheck size={32} style={{ color: '#00ffd5' }} />
          </div>

          <h2 style={{
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '2px',
            color: '#fff',
            marginBottom: '8px'
          }}>
            ZEROLOCK SOC SESSION RESET
          </h2>

          <p style={{
            color: '#5a6577',
            fontSize: '13px',
            maxWidth: '420px',
            lineHeight: 1.6,
            marginBottom: '16px'
          }}>
            System state cleared. Click below to continue directly to the login portal.
          </p>

          {this.state.error && (
            <div style={{
              background: 'rgba(255, 23, 68, 0.08)',
              border: '1px solid rgba(255, 23, 68, 0.2)',
              color: '#ff5252',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              padding: '10px 16px',
              borderRadius: '8px',
              maxWidth: '500px',
              marginBottom: '20px',
              wordBreak: 'break-word'
            }}>
              {this.state.error.message || String(this.state.error)}
            </div>
          )}

          <button
            onClick={this.handleAutoRecover}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, rgba(0, 255, 213, 0.2), rgba(0, 255, 213, 0.05))',
              border: '1px solid rgba(0, 255, 213, 0.4)',
              color: '#00ffd5',
              padding: '12px 24px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              letterSpacing: '1px',
              fontSize: '13px'
            }}
          >
            <RefreshCw size={16} /> ENTER LOGIN PORTAL
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
