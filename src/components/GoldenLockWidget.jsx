import React from 'react';

export default function GoldenLockWidget({ mode = 'login' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      
      {/* Container for Lock & Orbit Rings */}
      <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Circuit Line Extensions to the Right */}
        <svg viewBox="0 0 100 100" style={{ position: 'absolute', right: '-80px', top: '20px', width: '100px', height: '140px', overflow: 'visible', opacity: 0.7 }}>
          <path d="M 0 30 L 40 30 L 60 10 L 90 10" fill="none" stroke="#00e5ff" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M 0 50 L 50 50 L 70 70 L 95 70" fill="none" stroke="#ffd700" strokeWidth="1.2" strokeDasharray="4 4" />
          <path d="M 0 70 L 35 70 L 55 90 L 85 90" fill="none" stroke="#00ffcc" strokeWidth="1" />

          <circle cx="90" cy="10" r="3" fill="#00e5ff" />
          <circle cx="95" cy="70" r="3" fill="#ffd700" />
          <circle cx="85" cy="90" r="3" fill="#00ffcc" />
        </svg>

        {/* Outer Clockwise Spin HUD Ring */}
        <svg className="hud-ring-spin" viewBox="0 0 200 200" style={{ position: 'absolute', width: '100%', height: '100%' }}>
          <circle cx="100" cy="100" r="86" fill="none" stroke="rgba(255, 215, 0, 0.3)" strokeWidth="1.5" strokeDasharray="8 8" />
          <circle cx="100" cy="100" r="78" fill="none" stroke="#ffd700" strokeWidth="2" strokeDasharray="30 150" />
          <circle cx="100" cy="22" r="3.5" fill="#ffd700" />
        </svg>

        {/* Inner Counter-Clockwise Spin HUD Ring */}
        <svg className="hud-ring-reverse" viewBox="0 0 200 200" style={{ position: 'absolute', width: '84%', height: '84%' }}>
          <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(0, 255, 204, 0.3)" strokeWidth="1" strokeDasharray="12 12" />
          <circle cx="100" cy="100" r="64" fill="none" stroke="#00ffcc" strokeWidth="1.8" strokeDasharray="50 110" />
          <circle cx="164" cy="100" r="3" fill="#00ffcc" />
        </svg>

        {/* 3D Golden & Teal Cyber Padlock Graphic */}
        <svg viewBox="0 0 100 100" style={{ width: '90px', height: '90px', filter: 'drop-shadow(0 0 16px rgba(255, 215, 0, 0.5))', transform: 'rotate(-5deg)' }}>
          <defs>
            <linearGradient id="gold-3d" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff5ad" />
              <stop offset="40%" stopColor="#ffd700" />
              <stop offset="80%" stopColor="#b8860b" />
              <stop offset="100%" stopColor="#7a5200" />
            </linearGradient>

            <linearGradient id="teal-core" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00ffcc" />
              <stop offset="100%" stopColor="#005577" />
            </linearGradient>
          </defs>

          {/* Golden Shackle */}
          <path d="M 32,45 L 32,28 C 32,14 68,14 68,28 L 68,45" fill="none" stroke="url(#gold-3d)" strokeWidth="7" strokeLinecap="round" />

          {/* Faceted Hexagonal Body */}
          <polygon points="50,38 82,50 82,78 50,92 18,78 18,50" fill="url(#teal-core)" stroke="url(#gold-3d)" strokeWidth="3" />
          <polygon points="50,44 74,53 74,74 50,84 26,74 26,53" fill="#040b17" opacity="0.9" />

          {/* Central Keyhole */}
          <circle cx="50" cy="62" r="5" fill="#ffd700" />
          <polygon points="48,64 52,64 53,74 47,74" fill="#ffd700" />
        </svg>
      </div>

      {/* Status Telemetry Text Underneath */}
      <div style={{ textAlign: 'center', marginTop: '12px', fontFamily: 'Orbitron, sans-serif' }}>
        {mode === 'login' ? (
          <div>
            <div style={{ fontSize: '9.5px', color: '#8492a6', letterSpacing: '1px' }}>SYSTEM:</div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#00ffcc', letterSpacing: '1px', marginTop: '2px' }}>
              ENCRYPTED // ACTIVE // SECURE
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '9.5px', color: '#ffd700', fontWeight: 700, letterSpacing: '1px' }}>
              ENROLLMENT VERIFICATION: ACTIVE
            </div>
            <div style={{ fontSize: '9px', color: '#8492a6', marginTop: '3px', fontFamily: 'JetBrains Mono, monospace' }}>
              BIOMETRIC SYNC: <span style={{ color: '#00ffcc' }}>Standby</span> // CREDENTIALS AUTH: <span style={{ color: '#ffaa00' }}>Pending</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
