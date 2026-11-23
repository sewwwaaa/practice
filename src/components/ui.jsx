import React, { useEffect, useId, useRef, useState } from 'react';

/* ==========================================================================
   ZEROLOCK UI PRIMITIVES
   Small shared building blocks used across the SOC views.
   ========================================================================== */

const prefersReducedMotion = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

/** Animates a number from 0 → target. Non-numeric targets are returned as-is. */
export function useCountUp(target, duration = 1100, decimals = 0) {
  const numeric = typeof target === 'number' && Number.isFinite(target);
  const [value, setValue] = useState(numeric ? 0 : target);
  const frame = useRef(null);

  useEffect(() => {
    if (!numeric) {
      setValue(target);
      return undefined;
    }
    if (prefersReducedMotion()) {
      setValue(target);
      return undefined;
    }
    const factor = 10 ** decimals;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased * factor) / factor);
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration, decimals, numeric]);

  return value;
}

/** Live clock that re-renders every second. */
export function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** Tiny inline trend line with a soft gradient fill. */
export function Sparkline({ data = [], color = 'var(--accent-cyan)', height = 36 }) {
  const gid = useId().replace(/:/g, '');
  if (data.length < 2) return null;

  const w = 120;
  const h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((d, i) => [i * step, h - 4 - ((d - min) / range) * (h - 8)]);
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;
  const [lx, ly] = pts[pts.length - 1];

  return (
    <svg className="sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`sg-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r="2.4" fill={color} />
    </svg>
  );
}

/** Circular score gauge with tick ring and gradient arc. */
export function RadialGauge({ value = 0, size = 168, label = 'SCORE', sublabel, decimals = 0 }) {
  const gid = useId().replace(/:/g, '');
  const counted = useCountUp(value, 1100, decimals);
  const shown = typeof counted === 'number' ? counted.toFixed(decimals) : counted;
  const r = 62;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value)) / 100;

  return (
    <div className="radial-gauge" style={{ width: size, height: size }}>
      <svg viewBox="0 0 160 160" aria-hidden="true">
        <defs>
          <linearGradient id={`rg-${gid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#00ffd5" />
            <stop offset="60%" stopColor="#00b0ff" />
            <stop offset="100%" stopColor="#ffc107" />
          </linearGradient>
        </defs>
        {/* tick ring */}
        <g className="radial-gauge-ticks">
          {Array.from({ length: 60 }).map((_, i) => (
            <line
              key={i}
              x1="80" y1="4" x2="80" y2={i % 5 === 0 ? 11 : 8}
              transform={`rotate(${i * 6} 80 80)`}
              stroke={i / 60 <= pct ? 'rgba(0,255,213,0.55)' : 'rgba(255,255,255,0.08)'}
              strokeWidth={i % 5 === 0 ? 1.4 : 0.8}
            />
          ))}
        </g>
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="9" />
        <circle
          className="radial-gauge-arc"
          cx="80" cy="80" r={r} fill="none"
          stroke={`url(#rg-${gid})`} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform="rotate(-90 80 80)"
        />
        <circle cx="80" cy="80" r="48" fill="none" stroke="rgba(0,255,213,0.08)" strokeDasharray="2 4" />
      </svg>
      <div className="radial-gauge-center">
        <div
          className="radial-gauge-value"
          style={{ fontSize: Math.round(size * (decimals ? 0.17 : 0.205)) }}
        >
          {shown}<span>%</span>
        </div>
        <div className="radial-gauge-label">{label}</div>
        {sublabel && <div className="radial-gauge-sub">{sublabel}</div>}
      </div>
    </div>
  );
}

/** Consistent page header: eyebrow, icon, title, subtitle and optional actions. */
export function PageHeader({ eyebrow, icon: Icon, title, subtitle, actions, children }) {
  return (
    <header className="page-header animate-in">
      <div className="page-header-main">
        {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
        <h1 className="page-title">
          {Icon && (
            <span className="page-title-icon"><Icon size={18} /></span>
          )}
          <span className="text-gradient">{title}</span>
          {children}
        </h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  );
}
