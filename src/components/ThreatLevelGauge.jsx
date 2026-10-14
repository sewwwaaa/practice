import React from 'react';

export default function ThreatLevelGauge({ level = 'MEDIUM' }) {
  const levels = {
    LOW: { color: '#00e676', width: '25%', label: 'LOW' },
    MEDIUM: { color: '#ff9100', width: '55%', label: 'MEDIUM' },
    HIGH: { color: '#ff1744', width: '75%', label: 'HIGH' },
    CRITICAL: { color: '#ff1744', width: '95%', label: 'CRITICAL' },
  };

  const config = levels[level] || levels.MEDIUM;

  return (
    <div style={{
      background: 'rgba(4, 8, 16, 0.6)', borderRadius: '10px',
      padding: '14px', border: '1px solid var(--border-dim)'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '8px'
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '10px',
          color: '#5a6577', letterSpacing: '1px', fontWeight: 600
        }}>
          THREAT LEVEL
        </span>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: '11px',
          color: config.color, fontWeight: 800, letterSpacing: '1px'
        }}>
          {config.label}
        </span>
      </div>
      <div style={{
        width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.04)',
        borderRadius: '3px', overflow: 'hidden'
      }}>
        <div style={{
          width: config.width, height: '100%',
          background: `linear-gradient(90deg, ${config.color}88, ${config.color})`,
          borderRadius: '3px',
          boxShadow: `0 0 10px ${config.color}44`,
          transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)'
        }} />
      </div>
    </div>
  );
}
