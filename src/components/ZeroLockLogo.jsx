import React from 'react';

export default function ZeroLockLogo({ size = 52 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', justifyContent: 'center' }}>
      {/* SVG Fingerprint Keyhole Icon */}
      <svg viewBox="0 0 100 100" style={{ width: `${size}px`, height: `${size}px`, flexShrink: 0 }}>
        <defs>
          <linearGradient id="zl-gold-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ffcc" />
            <stop offset="50%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#ffd700" />
          </linearGradient>

          <filter id="zl-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Concentric Fingerprint Circuit Ridges */}
        <g stroke="url(#zl-gold-cyan)" fill="none" strokeWidth="3" strokeLinecap="round" filter="url(#zl-glow)">
          {/* Outer Ridge */}
          <path d="M 20,50 A 30,30 0 0,1 80,50 A 30,35 0 0,1 70,82" strokeDasharray="12 4 20 4" />
          <path d="M 20,50 A 30,35 0 0,0 30,82" strokeDasharray="16 4 10 4" />

          {/* Middle Ridge */}
          <path d="M 30,50 A 20,20 0 0,1 70,50 A 20,25 0 0,1 62,75" strokeDasharray="20 4 14 4" />
          <path d="M 30,50 A 20,25 0 0,0 38,75" strokeDasharray="10 4 18 4" />

          {/* Inner Ridge */}
          <path d="M 40,50 A 10,10 0 0,1 60,50 A 10,15 0 0,1 56,65" />
          <path d="M 40,50 A 10,15 0 0,0 44,65" />

          {/* Circuit Nodes */}
          <circle cx="20" cy="50" r="3" fill="#00ffcc" stroke="none" />
          <circle cx="80" cy="50" r="3" fill="#ffd700" stroke="none" />
          <circle cx="70" cy="82" r="3" fill="#ffd700" stroke="none" />
          <circle cx="30" cy="82" r="3" fill="#00ffcc" stroke="none" />
        </g>

        {/* Central Keyhole Cutout */}
        <g transform="translate(50, 48)">
          <circle cx="0" cy="-4" r="8" fill="#06101e" stroke="url(#zl-gold-cyan)" strokeWidth="2.5" />
          <polygon points="-4,2 4,2 6,16 -6,16" fill="#06101e" stroke="url(#zl-gold-cyan)" strokeWidth="2" />
        </g>
      </svg>

      {/* Brand Text */}
      <div style={{ textTransform: 'uppercase', textAlign: 'left' }}>
        <div style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '24px', fontWeight: 900, letterSpacing: '2px', color: '#fff', lineHeight: 1 }}>
          ZERO <span style={{ color: '#ffd700' }}>LOCK</span>
        </div>
        <div style={{ fontSize: '10px', color: '#00ffcc', letterSpacing: '2px', fontWeight: 600, marginTop: '3px' }}>
          ADVANCED SECURE ACCESS
        </div>
      </div>
    </div>
  );
}
