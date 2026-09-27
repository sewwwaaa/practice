import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ZeroLock SOC Error Caught by Boundary:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
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
            background: 'rgba(255, 23, 68, 0.1)',
            border: '1px solid rgba(255, 23, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: '0 0 30px rgba(255, 23, 68, 0.2)'
          }}>
            <ShieldAlert size={32} style={{ color: '#ff1744' }} />
          </div>

          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '2px',
            color: '#fff',
            marginBottom: '8px'
          }}>
            SESSION DISPLAY RECOVERY
          </h2>

          <p style={{
            color: '#5a6577',
            fontSize: '14px',
            maxWidth: '420px',
            lineHeight: 1.6,
            marginBottom: '24px'
          }}>
            A graphics or rendering disruption was detected. The system has prevented a black screen failure.
          </p>

          <button
            onClick={this.handleReload}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, rgba(0, 255, 213, 0.15), rgba(0, 255, 213, 0.05))',
              border: '1px solid rgba(0, 255, 213, 0.3)',
              color: '#00ffd5',
              padding: '12px 24px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 600,
              letterSpacing: '1px',
              fontSize: '13px'
            }}
          >
            <RefreshCw size={16} /> REBOOT SOC DISPLAY
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
