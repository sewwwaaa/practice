import React from 'react';

const LEVELS = {
  LOW: { color: '#00e676', segments: 1, label: 'LOW' },
  GUARDED: { color: '#00b0ff', segments: 2, label: 'GUARDED' },
  ELEVATED: { color: '#ff9100', segments: 3, label: 'ELEVATED' },
  MEDIUM: { color: '#ff9100', segments: 3, label: 'MEDIUM' },
  HIGH: { color: '#ff5722', segments: 4, label: 'HIGH' },
  CRITICAL: { color: '#ff1744', segments: 5, label: 'CRITICAL' },
};

export default function ThreatLevelGauge({ level = 'MEDIUM' }) {
  const config = LEVELS[level] || LEVELS.MEDIUM;

  return (
    <div className="threat-meter" role="meter" aria-valuemin={1} aria-valuemax={5} aria-valuenow={config.segments} aria-label={`Threat level ${config.label}`}>
      <div className="threat-meter-head">
        <span>GLOBAL THREAT LEVEL</span>
        <strong style={{ color: config.color, textShadow: `0 0 12px ${config.color}66` }}>{config.label}</strong>
      </div>
      <div className="threat-segments">
        {[1, 2, 3, 4, 5].map(i => (
          <span
            key={i}
            style={i <= config.segments ? {
              background: config.color,
              opacity: 0.45 + (i / config.segments) * 0.55,
              boxShadow: `0 0 10px ${config.color}88`
            } : undefined}
          />
        ))}
      </div>
    </div>
  );
}
