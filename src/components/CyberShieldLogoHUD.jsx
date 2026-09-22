import React from 'react';

export default function CyberShieldLogoHUD({ size = 320 }) {
  return (
    <div style={{ position: 'relative', width: `${size}px`, height: `${size}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Radiant Glow Atmosphere Background */}
      <div 
        style={{
          position: 'absolute',
          width: '75%',
          height: '75%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 255, 204, 0.25) 0%, rgba(0, 229, 255, 0.1) 40%, transparent 75%)',
          filter: 'blur(20px)',
          animation: 'aura-pulse 3s infinite ease-in-out',
          pointerEvents: 'none'
        }}
      />

      <svg 
        viewBox="0 0 300 300" 
        style={{ width: '100%', height: '100%', overflow: 'visible' }}
      >
        <defs>
          {/* Cyan Glow Filters */}
          <filter id="cyan-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="intense-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur1" />
            <feGaussianBlur stdDeviation="3" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Shield Linear Gradients */}
          <linearGradient id="shield-grad-outer" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00ffcc" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#00e5ff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#0099ff" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="shield-grad-inner" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 255, 204, 0.25)" />
            <stop offset="100%" stopColor="rgba(3, 12, 28, 0.85)" />
          </linearGradient>
        </defs>

        {/* ─── LAYER 1: CROSSHAIR TARGETING GRID AXES ─── */}
        <g opacity="0.4">
          {/* Main X Axis */}
          <line x1="20" y1="150" x2="280" y2="150" stroke="#00ffcc" strokeWidth="0.8" strokeDasharray="4 4" />
          {/* Main Y Axis */}
          <line x1="150" y1="20" x2="150" y2="280" stroke="#00ffcc" strokeWidth="0.8" strokeDasharray="4 4" />
          
          {/* Corner Targeting Marks */}
          <path d="M 25 150 L 35 150 M 265 150 L 275 150" stroke="#00ffcc" strokeWidth="2" />
          <path d="M 150 25 L 150 35 M 150 265 L 150 275" stroke="#00ffcc" strokeWidth="2" />

          {/* Diagonal Sub-Axes */}
          <line x1="50" y1="50" x2="250" y2="250" stroke="#00e5ff" strokeWidth="0.5" strokeDasharray="2 6" />
          <line x1="250" y1="50" x2="50" y2="250" stroke="#00e5ff" strokeWidth="0.5" strokeDasharray="2 6" />
        </g>

        {/* ─── LAYER 2: EXPANDING CONCENTRIC ENERGY RIPPLES ─── */}
        <circle cx="150" cy="150" r="105" fill="none" stroke="#00ffcc" strokeWidth="1" className="shield-ripple-1" />
        <circle cx="150" cy="150" r="105" fill="none" stroke="#00e5ff" strokeWidth="1" className="shield-ripple-2" />

        {/* ─── LAYER 3: OUTER RADAR HUD RING (CLOCKWISE SPIN) ─── */}
        <g className="hud-ring-spin">
          <circle cx="150" cy="150" r="132" fill="none" stroke="rgba(0, 255, 204, 0.25)" strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx="150" cy="150" r="124" fill="none" stroke="#00ffcc" strokeWidth="2" strokeDasharray="40 140 20 60" filter="url(#cyan-glow)" />
          
          {/* Outer Ring Tick Dots */}
          <circle cx="150" cy="18" r="3" fill="#00ffcc" filter="url(#cyan-glow)" />
          <circle cx="150" cy="282" r="3" fill="#00ffcc" filter="url(#cyan-glow)" />
          <circle cx="18" cy="150" r="3" fill="#00ffcc" filter="url(#cyan-glow)" />
          <circle cx="282" cy="150" r="3" fill="#00ffcc" filter="url(#cyan-glow)" />
        </g>

        {/* ─── LAYER 4: MIDDLE HUD RING (COUNTER-CLOCKWISE SPIN) ─── */}
        <g className="hud-ring-reverse">
          <circle cx="150" cy="150" r="110" fill="none" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="1" strokeDasharray="12 12" />
          <circle cx="150" cy="150" r="102" fill="none" stroke="#00e5ff" strokeWidth="1.8" strokeDasharray="60 120" filter="url(#cyan-glow)" />
          
          {/* 4 Quadrant Data Nodes */}
          <circle cx="222" cy="150" r="4" fill="#00e5ff" />
          <circle cx="78" cy="150" r="4" fill="#00e5ff" />
          <circle cx="150" cy="222" r="4" fill="#00e5ff" />
          <circle cx="150" cy="78" r="4" fill="#00e5ff" />
        </g>

        {/* ─── LAYER 5: CENTRAL CYBER SHIELD ─── */}
        <g filter="url(#intense-glow)">
          {/* Outer Shield Contour */}
          <path 
            d="M 150,52 C 200,52 225,68 225,115 C 225,180 178,222 150,242 C 122,222 75,180 75,115 C 75,68 100,52 150,52 Z" 
            fill="url(#shield-grad-inner)" 
            stroke="url(#shield-grad-outer)" 
            strokeWidth="3.5"
          />

          {/* Inner Shield Bezel Line */}
          <path 
            d="M 150,65 C 190,65 210,78 210,115 C 210,170 172,206 150,224 C 128,206 90,170 90,115 C 90,78 110,65 150,65 Z" 
            fill="none" 
            stroke="#00ffcc" 
            strokeWidth="1.2"
            strokeDasharray="160 8 40 8"
            opacity="0.8"
          />

          {/* Inner Shield Grid Lines Pattern */}
          <path
            d="M 110,105 L 190,105 M 100,135 L 200,135 M 110,165 L 190,165 M 150,65 L 150,224"
            stroke="rgba(0, 255, 204, 0.15)"
            strokeWidth="1"
          />

          {/* ─── LAYER 6: KEYHOLE PADLOCK CORE ─── */}
          <g transform="translate(150, 132)">
            {/* Padlock Shackle Arc */}
            <path 
              d="M -16,-6 L -16,-20 C -16,-34 16,-34 16,-20 L 16,-6" 
              fill="none" 
              stroke="#00ffcc" 
              strokeWidth="4.5"
              strokeLinecap="round"
              filter="url(#cyan-glow)"
            />
            {/* Padlock Body */}
            <rect 
              x="-24" 
              y="-6" 
              width="48" 
              height="40" 
              rx="6" 
              fill="#061224" 
              stroke="#00ffcc" 
              strokeWidth="2.5"
              filter="url(#cyan-glow)"
            />
            {/* Padlock Inner Keyhole Circle */}
            <circle cx="0" cy="8" r="6" fill="#00ffcc" />
            {/* Keyhole Stem Notch */}
            <polygon points="-3,10 3,10 4,22 -4,22" fill="#00ffcc" />
          </g>
        </g>

        {/* Orbiting Particle Dot */}
        <g className="hud-ring-spin">
          <circle cx="150" cy="40" r="3.5" fill="#ffffff" filter="url(#intense-glow)" />
        </g>
      </svg>
    </div>
  );
}
