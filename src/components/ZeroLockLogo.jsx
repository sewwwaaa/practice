import React, { useId } from 'react';

/**
 * ZEROLOCK brand mark — fingerprint ridges wrapped around a keyhole.
 * @param {number}  size      Icon size in px.
 * @param {boolean} showText  Render the wordmark beside the icon.
 * @param {string}  tagline   Small caption under the wordmark.
 */
export default function ZeroLockLogo({ size = 52, showText = true, tagline = 'ADVANCED SECURE ACCESS' }) {
  const uid = useId().replace(/:/g, '');
  const grad = `zl-grad-${uid}`;
  const glow = `zl-glow-${uid}`;

  return (
    <div className="zl-logo">
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ flexShrink: 0 }} aria-hidden="true">
        <defs>
          <linearGradient id={grad} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ffd5" />
            <stop offset="55%" stopColor="#00b0ff" />
            <stop offset="100%" stopColor="#ffc107" />
          </linearGradient>
          <filter id={glow} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Hex frame */}
        <polygon
          points="50,4 90,27 90,73 50,96 10,73 10,27"
          fill="rgba(0,255,213,0.04)" stroke={`url(#${grad})`} strokeWidth="2" strokeOpacity="0.55"
        />

        {/* Fingerprint circuit ridges */}
        <g stroke={`url(#${grad})`} fill="none" strokeWidth="3.2" strokeLinecap="round" filter={`url(#${glow})`}>
          <path d="M 24,52 A 26,26 0 0,1 76,52 A 26,30 0 0,1 68,80" strokeDasharray="12 4 20 4" />
          <path d="M 24,52 A 26,30 0 0,0 32,80" strokeDasharray="16 4 10 4" />
          <path d="M 33,52 A 17,17 0 0,1 67,52 A 17,21 0 0,1 61,73" strokeDasharray="20 4 14 4" />
          <path d="M 33,52 A 17,21 0 0,0 39,73" strokeDasharray="10 4 18 4" />
          <circle cx="24" cy="52" r="2.8" fill="#00ffd5" stroke="none" />
          <circle cx="76" cy="52" r="2.8" fill="#ffc107" stroke="none" />
        </g>

        {/* Keyhole */}
        <g transform="translate(50, 50)">
          <circle cx="0" cy="-3" r="7" fill="#06101e" stroke={`url(#${grad})`} strokeWidth="2.4" />
          <polygon points="-3.5,2 3.5,2 5.5,15 -5.5,15" fill="#06101e" stroke={`url(#${grad})`} strokeWidth="2" strokeLinejoin="round" />
        </g>
      </svg>

      {showText && (
        <div className="zl-logo-text">
          <div className="zl-logo-word">
            ZERO<span>LOCK</span>
          </div>
          {tagline && <div className="zl-logo-tagline">{tagline}</div>}
        </div>
      )}
    </div>
  );
}
