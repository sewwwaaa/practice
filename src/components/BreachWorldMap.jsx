import React, { useRef, useEffect, useState, useCallback } from 'react';
import WorldMapPaths from './WorldMapPaths.jsx';
import { Volume2, VolumeX, Pause, Play, Zap } from 'lucide-react';

export const breachCities = [
  { id: 'sf', name: 'SF', fullName: 'San Francisco, USA', x: 142, y: 418, lat: '37.77 N', lon: '122.42 W', threats: 284, severity: 'critical', status: 'ACTIVE INTRUSION', ip: '198.51.100.24' },
  { id: 'ny', name: 'New York', fullName: 'New York, USA', x: 246, y: 408, lat: '40.71 N', lon: '74.00 W', threats: 412, severity: 'critical', status: 'TARGETED RANSOMWARE', ip: '192.0.2.89' },
  { id: 'london', name: 'London', fullName: 'London, UK', x: 405, y: 368, lat: '51.50 N', lon: '0.12 W', threats: 329, severity: 'high', status: 'EXPLOIT ATTEMPTS', ip: '185.199.108.153' },
  { id: 'moscow1', name: 'Moscow', fullName: 'Moscow Central, RU', x: 492, y: 352, lat: '55.75 N', lon: '37.61 E', threats: 590, severity: 'critical', status: 'ORIGIN BOTNET C2', ip: '185.220.101.5' },
  { id: 'moscow2', name: 'Moscow', fullName: 'Moscow East, RU', x: 550, y: 356, lat: '56.50 N', lon: '53.20 E', threats: 418, severity: 'critical', status: 'APT-29 PROXY', ip: '194.165.118.42' },
  { id: 'tokyo', name: 'Tokyo', fullName: 'Tokyo, JP', x: 710, y: 428, lat: '35.67 N', lon: '139.65 E', threats: 215, severity: 'high', status: 'ZERO-DAY DETECTED', ip: '203.0.113.195' },
  { id: 'sydney', name: 'Sydney', fullName: 'Sydney, AU', x: 734, y: 636, lat: '33.86 S', lon: '151.20 E', threats: 142, severity: 'medium', status: 'DDOS SCRUBBING', ip: '139.130.4.5' },
  { id: 'saopaulo', name: 'São Paulo', fullName: 'São Paulo, BR', x: 308, y: 612, lat: '23.55 S', lon: '46.63 W', threats: 98, severity: 'medium', status: 'BRUTE FORCE BLOCKED', ip: '177.18.99.12' },
  { id: 'frankfurt', name: 'Frankfurt', fullName: 'Frankfurt, DE', x: 430, y: 378, lat: '50.11 N', lon: '8.68 E', threats: 195, severity: 'high', status: 'API EXFILTRATION', ip: '194.109.6.98' },
  { id: 'singapore', name: 'Singapore', fullName: 'Singapore, SG', x: 630, y: 510, lat: '1.35 N', lon: '103.82 E', threats: 167, severity: 'high', status: 'CREDENTIAL STUFFING', ip: '118.200.1.22' }
];

export const initialAttackVectors = [
  { from: 'moscow1', to: 'london', label: 'APT-29 Exploit', color: '#ff2a55', speed: 0.007, type: 'ZERO-DAY' },
  { from: 'moscow1', to: 'ny', label: 'LockBit 4.0', color: '#ff1744', speed: 0.005, type: 'RANSOMWARE' },
  { from: 'moscow2', to: 'london', label: 'C2 Beacon', color: '#ff334b', speed: 0.006, type: 'BOTNET' },
  { from: 'london', to: 'ny', label: 'Financial Exfil', color: '#ff5252', speed: 0.006, type: 'EXFIL' },
  { from: 'sf', to: 'ny', label: 'Cloud API Probe', color: '#ff1744', speed: 0.008, type: 'ZERO-DAY' },
  { from: 'sf', to: 'tokyo', label: 'Mirai DDoS', color: '#ff9100', speed: 0.006, type: 'DDOS' },
  { from: 'moscow1', to: 'sf', label: 'OAuth Hijack', color: '#ff2a55', speed: 0.005, type: 'RANSOMWARE' },
  { from: 'tokyo', to: 'moscow2', label: 'Reverse Shell', color: '#00e5ff', speed: 0.007, type: 'EXFIL' },
  { from: 'frankfurt', to: 'london', label: 'Lateral Movement', color: '#ff2a55', speed: 0.009, type: 'BOTNET' }
];

export default function BreachWorldMap({ onCitySelect }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const tickerTextRef = useRef(null);

  const [hoveredCity, setHoveredCity] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Cached container bounds to prevent forced layout reflows in requestAnimationFrame
  const boundsRef = useRef({ width: 784, height: 458 });

  // Store mutable controls in a ref so render loop doesn't restart on state changes
  const controlsRef = useRef({
    isPaused: false,
    speedMultiplier: 1,
    audioEnabled: false,
    scannerEnabled: true,
    activeFilter: 'ALL'
  });

  useEffect(() => {
    controlsRef.current = {
      isPaused,
      speedMultiplier,
      audioEnabled,
      scannerEnabled,
      activeFilter
    };
  }, [isPaused, speedMultiplier, audioEnabled, scannerEnabled, activeFilter]);

  // Audio Context
  const audioCtxRef = useRef(null);
  const playImpactSound = useCallback(() => {
    if (!controlsRef.current.audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }, []);

  // Dynamic state arrays
  const attacksRef = useRef([]);
  const ripplesRef = useRef([]);
  const sparksRef = useRef([]);
  const scanLineRef = useRef(30);

  // Initialize attacks once
  useEffect(() => {
    attacksRef.current = initialAttackVectors.map((v, i) => {
      const fromCity = breachCities.find(c => c.id === v.from) || breachCities[0];
      const toCity = breachCities.find(c => c.id === v.to) || breachCities[1];
      return {
        ...v,
        fromCity,
        toCity,
        progress: (i * 0.11) % 1
      };
    });
  }, []);

  // Update ticker DOM directly without triggering React re-renders
  const updateTicker = useCallback((text) => {
    if (tickerTextRef.current) {
      tickerTextRef.current.textContent = text;
    }
  }, []);

  // High-performance canvas rendering with zero forced layout reflow
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });

    const svgMinX = 30.767;
    const svgMinY = 241.591;
    const svgWidth = 784.077;
    const svgHeight = 458.627;

    // Use ResizeObserver for responsive canvas resolution
    const updateSize = (width, height) => {
      if (width <= 0 || height <= 0) return;
      boundsRef.current = { width, height };
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };

    let resizeObserver = null;
    if (containerRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          updateSize(width, height);
        }
      });
      resizeObserver.observe(containerRef.current);
    } else if (containerRef.current) {
      const r = containerRef.current.getBoundingClientRect();
      updateSize(r.width, r.height);
    }

    let lastSpawnTime = Date.now();
    let animId = null;

    const render = () => {
      const { isPaused, speedMultiplier, activeFilter, scannerEnabled } = controlsRef.current;

      if (!isPaused && canvas) {
        const { width, height } = boundsRef.current;

        if (width > 0 && height > 0) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          ctx.save();
          // Transform canvas to match SVG coordinate space
          ctx.scale((width * dpr) / svgWidth, (height * dpr) / svgHeight);
          ctx.translate(-svgMinX, -svgMinY);

          const now = Date.now();
          const timeSec = now * 0.001;

          // 1. Radar scanner sweep
          if (scannerEnabled) {
            scanLineRef.current += 1.3 * speedMultiplier;
            if (scanLineRef.current > svgMinX + svgWidth) {
              scanLineRef.current = svgMinX;
            }
            const sx = scanLineRef.current;
            const scanGrad = ctx.createLinearGradient(sx - 35, 0, sx, 0);
            scanGrad.addColorStop(0, 'rgba(0, 255, 213, 0)');
            scanGrad.addColorStop(1, 'rgba(0, 255, 213, 0.12)');
            ctx.fillStyle = scanGrad;
            ctx.fillRect(sx - 35, svgMinY, 35, svgHeight);

            ctx.beginPath();
            ctx.moveTo(sx, svgMinY);
            ctx.lineTo(sx, svgMinY + svgHeight);
            ctx.strokeStyle = 'rgba(0, 255, 213, 0.35)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // 2. City breach heatmaps (breathing red glow)
          breachCities.forEach(city => {
            if (city.severity === 'critical') {
              const glowPulse = 18 + Math.sin(timeSec * 3 + city.x) * 5;
              const heatGrad = ctx.createRadialGradient(city.x, city.y, 2, city.x, city.y, glowPulse);
              heatGrad.addColorStop(0, 'rgba(255, 42, 85, 0.28)');
              heatGrad.addColorStop(1, 'rgba(255, 42, 85, 0)');
              ctx.fillStyle = heatGrad;
              ctx.beginPath();
              ctx.arc(city.x, city.y, glowPulse, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          // 3. Dynamic attack spawner
          if (now - lastSpawnTime > (1500 / speedMultiplier) && attacksRef.current.length < 14) {
            lastSpawnTime = now;
            const from = breachCities[Math.floor(Math.random() * breachCities.length)];
            let to = breachCities[Math.floor(Math.random() * breachCities.length)];
            while (to.id === from.id) {
              to = breachCities[Math.floor(Math.random() * breachCities.length)];
            }

            const attackTypes = [
              { label: 'APT-29 Exploit', color: '#ff2a55', type: 'ZERO-DAY' },
              { label: 'LockBit 4.0 Payload', color: '#ff1744', type: 'RANSOMWARE' },
              { label: 'Mirai DDoS Flood', color: '#ff9100', type: 'DDOS' },
              { label: 'Reaper Botnet Sweep', color: '#ff334b', type: 'BOTNET' },
              { label: 'OAuth Exfiltration', color: '#00e5ff', type: 'EXFIL' }
            ];
            const sel = attackTypes[Math.floor(Math.random() * attackTypes.length)];

            attacksRef.current.push({
              from: from.id,
              to: to.id,
              fromCity: from,
              toCity: to,
              label: sel.label,
              color: sel.color,
              type: sel.type,
              speed: 0.005 + Math.random() * 0.004,
              progress: 0
            });

            updateTicker(`⚡ [${new Date().toLocaleTimeString()}] ${sel.label}: ${from.name} ➔ ${to.name} • [ACTIVE]`);
          }

          // 4. Draw Parabolic Attack Arcs & Photons
          attacksRef.current.forEach(attack => {
            if (activeFilter !== 'ALL' && attack.type !== activeFilter) return;

            const { fromCity, toCity, progress, color, speed } = attack;
            const x1 = fromCity.x;
            const y1 = fromCity.y;
            const x2 = toCity.x;
            const y2 = toCity.y;

            const dx = x2 - x1;
            const dy = y2 - y1;
            const dist = Math.hypot(dx, dy);

            // Parabolic arch curving upward
            const midX = (x1 + x2) / 2;
            const archHeight = Math.min(Math.max(dist * 0.36, 28), 115);
            const cpX = midX;
            const cpY = Math.min(y1, y2) - archHeight;

            // Faint dashed flight line
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo(cpX, cpY, x2, y2);
            ctx.strokeStyle = 'rgba(255, 42, 85, 0.16)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 4]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw curved laser beam using 8 sampled points along the curve
            const trailLength = 0.14;
            const tStart = Math.max(0, progress - trailLength);
            const tEnd = progress;

            const steps = 8;
            ctx.beginPath();
            for (let s = 0; s <= steps; s++) {
              const curT = tStart + (s / steps) * (tEnd - tStart);
              const px = (1 - curT) * (1 - curT) * x1 + 2 * (1 - curT) * curT * cpX + curT * curT * x2;
              const py = (1 - curT) * (1 - curT) * y1 + 2 * (1 - curT) * curT * cpY + curT * curT * y2;
              if (s === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.strokeStyle = color;
            ctx.lineWidth = 2.4;
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Glowing photon head at leading position
            const curX = (1 - tEnd) * (1 - tEnd) * x1 + 2 * (1 - tEnd) * tEnd * cpX + tEnd * tEnd * x2;
            const curY = (1 - tEnd) * (1 - tEnd) * y1 + 2 * (1 - tEnd) * tEnd * cpY + tEnd * tEnd * y2;

            ctx.beginPath();
            ctx.arc(curX, curY, 2.8, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = color;
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Advance progress
            attack.progress += speed * speedMultiplier;

            // On impact
            if (attack.progress >= 1) {
              attack.progress = 0;

              // Cap ripples
              if (ripplesRef.current.length < 12) {
                ripplesRef.current.push({
                  x: x2,
                  y: y2,
                  radius: 3,
                  opacity: 1,
                  color
                });
              }

              // Cap sparks
              if (sparksRef.current.length < 24) {
                for (let p = 0; p < 6; p++) {
                  const ang = Math.random() * Math.PI * 2;
                  const spd = 0.8 + Math.random() * 1.8;
                  sparksRef.current.push({
                    x: x2,
                    y: y2,
                    vx: Math.cos(ang) * spd,
                    vy: Math.sin(ang) * spd,
                    alpha: 1,
                    color,
                    size: 1.2 + Math.random() * 1.2
                  });
                }
              }

              playImpactSound();
              updateTicker(`💥 [${new Date().toLocaleTimeString()}] IMPACT at ${toCity.fullName}: ${attack.label} • [BLOCKED BY SIEM]`);
            }
          });

          // 5. Shockwave ripples
          ripplesRef.current = ripplesRef.current.filter(r => r.opacity > 0.03);
          ripplesRef.current.forEach(r => {
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 42, 85, ${r.opacity})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            r.radius += 1.0 * speedMultiplier;
            r.opacity *= 0.93;
          });

          // 6. Sparks
          sparksRef.current = sparksRef.current.filter(s => s.alpha > 0.05);
          sparksRef.current.forEach(s => {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fillStyle = s.color;
            ctx.globalAlpha = s.alpha;
            ctx.shadowColor = s.color;
            ctx.shadowBlur = 5;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;

            s.x += s.vx * speedMultiplier;
            s.y += s.vy * speedMultiplier;
            s.alpha *= 0.91;
          });

          // 7. City radar pulses and glowing dots
          breachCities.forEach((city, idx) => {
            const phase = (timeSec * 1.5 + idx * 0.4) % 1;
            const radarRadius = 4 + phase * 16;
            const radarAlpha = (1 - phase) * 0.6;

            ctx.beginPath();
            ctx.arc(city.x, city.y, radarRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 42, 85, ${radarAlpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(city.x, city.y, 3.8, 0, Math.PI * 2);
            ctx.fillStyle = '#ff2a55';
            ctx.shadowColor = '#ff2a55';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.beginPath();
            ctx.arc(city.x, city.y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
          });

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [playImpactSound, updateTicker]);

  // City hover interaction
  const handleMouseMove = (e) => {
    const { width, height } = boundsRef.current;
    if (width <= 0 || height <= 0 || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const svgMinX = 30.767;
    const svgMinY = 241.591;
    const svgWidth = 784.077;
    const svgHeight = 458.627;

    const mouseX = svgMinX + ((e.clientX - rect.left) / width) * svgWidth;
    const mouseY = svgMinY + ((e.clientY - rect.top) / height) * svgHeight;

    const hit = breachCities.find(c => Math.hypot(c.x - mouseX, c.y - mouseY) < 18);

    if (hit) {
      setHoveredCity(hit);
      setTooltipPos({
        x: ((hit.x - svgMinX) / svgWidth) * width,
        y: ((hit.y - svgMinY) / svgHeight) * height
      });
    } else {
      setHoveredCity(null);
    }
  };

  const triggerManualAttack = () => {
    const from = breachCities[Math.floor(Math.random() * breachCities.length)];
    let to = breachCities[Math.floor(Math.random() * breachCities.length)];
    while (to.id === from.id) to = breachCities[Math.floor(Math.random() * breachCities.length)];

    attacksRef.current.push({
      from: from.id,
      to: to.id,
      fromCity: from,
      toCity: to,
      label: 'MANUAL RED-TEAM PROBE',
      color: '#00ffd5',
      type: 'ZERO-DAY',
      speed: 0.008,
      progress: 0
    });
    updateTicker(`🚀 Manual Red-Team probe dispatched: ${from.name} ➔ ${to.name}`);
  };

  return (
    <div className="breach-map-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      
      {/* ─── WORLD MAP MAIN VIEWPORT ─── */}
      <div
        ref={containerRef}
        className="breach-map-viewport"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredCity(null)}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '784.077 / 458.627',
          maxHeight: 'min(62vh, 620px)',
          background: 'radial-gradient(ellipse at 50% 45%, #0e1628 0%, #080c16 75%, #050810 100%)',
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.85), 0 10px 35px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Base SVG Layer: Real Smooth World Continents */}
        <svg
          viewBox="30.767 241.591 784.077 458.627"
          preserveAspectRatio="xMidYMid meet"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          <defs>
            <pattern id="matrix-dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="0.6" fill="rgba(255, 255, 255, 0.03)" />
            </pattern>
          </defs>

          <rect x="30" y="240" width="785" height="460" fill="url(#matrix-dots)" />

          {/* Latitude & Longitude Dashed Grid Lines */}
          <g stroke="rgba(255, 255, 255, 0.035)" strokeWidth="0.7" strokeDasharray="3 3">
            <line x1="30" y1="300" x2="815" y2="300" />
            <line x1="30" y1="380" x2="815" y2="380" />
            <line x1="30" y1="470" x2="815" y2="470" stroke="rgba(255, 255, 255, 0.05)" />
            <line x1="30" y1="560" x2="815" y2="560" />
            <line x1="30" y1="640" x2="815" y2="640" />

            <line x1="160" y1="240" x2="160" y2="700" />
            <line x1="290" y1="240" x2="290" y2="700" />
            <line x1="420" y1="240" x2="420" y2="700" stroke="rgba(255, 255, 255, 0.05)" />
            <line x1="550" y1="240" x2="550" y2="700" />
            <line x1="680" y1="240" x2="680" y2="700" />
          </g>

          {/* 314 Real Smooth World Continent & Country Vector Outlines (Memoized) */}
          <WorldMapPaths />

          {/* HUD Watermark Telemetry */}
          <g transform="translate(680, 260)" opacity="0.65">
            <rect x="0" y="0" width="88" height="18" fill="rgba(8, 14, 28, 0.75)" stroke="rgba(255, 42, 85, 0.4)" strokeWidth="0.6" rx="2" />
            <text x="6" y="12" fill="#ff4d6d" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
              [01-1008K THREAT]
            </text>
          </g>
          <text x="682" y="294" fill="rgba(148, 163, 184, 0.5)" fontSize="8" fontFamily="monospace">
            21.977° N 19.310° E
          </text>

          {/* Left Side Cyber Terminal Snippet Watermark */}
          <g opacity="0.28" fill="#38bdf8" fontSize="7" fontFamily="monospace">
            <text x="45" y="360">function code = 510;</text>
            <text x="45" y="372">if (attack.type === 0x4) &#123;</text>
            <text x="55" y="384">eval.sandbox(true);</text>
            <text x="45" y="396">&#125;</text>
            <text x="45" y="415">data.funcop_stream()</text>
          </g>

          {/* Crisp City Labels */}
          <g id="city-labels" fontFamily="'Inter', -apple-system, sans-serif" fontWeight="700" fontSize="10">
            <text x="126" y="422" fill="#ffffff" textAnchor="end" filter="drop-shadow(0 1px 4px rgba(0,0,0,0.95))">SF</text>
            <text x="258" y="405" fill="#ffffff" textAnchor="start" filter="drop-shadow(0 1px 4px rgba(0,0,0,0.95))">New York</text>
            <text x="405" y="358" fill="#ffffff" textAnchor="middle" filter="drop-shadow(0 1px 4px rgba(0,0,0,0.95))">London</text>
            <text x="492" y="342" fill="#ffffff" textAnchor="middle" filter="drop-shadow(0 1px 4px rgba(0,0,0,0.95))">Moscow</text>
            <text x="550" y="346" fill="#ffffff" textAnchor="middle" filter="drop-shadow(0 1px 4px rgba(0,0,0,0.95))">Moscow</text>
            <text x="722" y="432" fill="#ffffff" textAnchor="start" filter="drop-shadow(0 1px 4px rgba(0,0,0,0.95))">Tokyo</text>
          </g>
        </svg>

        {/* Dynamic Canvas Layer for Live Arcs, Shimmer Trails, Ripples & Sparks */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        />

        {/* Interactive Click Targets for Cities */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
          {breachCities.map(city => (
            <div
              key={city.id}
              onClick={() => onCitySelect && onCitySelect(city)}
              style={{
                position: 'absolute',
                left: `${((city.x - 30.767) / 784.077) * 100}%`,
                top: `${((city.y - 241.591) / 458.627) * 100}%`,
                width: '32px',
                height: '32px',
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                borderRadius: '50%',
                zIndex: 10
              }}
              title={`${city.fullName} • ${city.status}`}
            />
          ))}
        </div>

        {/* Floating City HUD Tooltip on Hover */}
        {hoveredCity && (
          <div
            style={{
              position: 'absolute',
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y - 14}px`,
              transform: 'translate(-50%, -100%)',
              background: 'rgba(6, 12, 24, 0.96)',
              border: '1px solid #ff2a55',
              boxShadow: '0 0 24px rgba(255, 42, 85, 0.45), 0 10px 30px rgba(0, 0, 0, 0.9)',
              padding: '10px 14px',
              borderRadius: '6px',
              pointerEvents: 'none',
              zIndex: 30,
              minWidth: '210px',
              backdropFilter: 'blur(10px)',
              animation: 'fadeIn 0.15s ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '13px', letterSpacing: '0.5px' }}>
                {hoveredCity.fullName}
              </span>
              <span style={{
                background: 'rgba(255, 42, 85, 0.2)',
                color: '#ff4d6d',
                fontSize: '9px',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '3px',
                border: '1px solid rgba(255, 42, 85, 0.4)'
              }}>
                {hoveredCity.severity.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#ff2a55', fontWeight: 700, marginBottom: '4px' }}>
              POSTURE: {hoveredCity.status}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
              <span>Detected Incursions:</span>
              <span style={{ color: '#fff', fontWeight: 800, fontFamily: 'monospace' }}>{hoveredCity.threats}</span>
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
              <span>Telemetry Node IP:</span>
              <span style={{ fontFamily: 'monospace', color: '#00ffd5' }}>{hoveredCity.ip}</span>
            </div>
          </div>
        )}

        {/* Map Control HUD Overlay (Responsive Bottom-Right) */}
        <div className="breach-map-controls-hud">
          {/* Audio SFX Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="breach-hud-btn"
            style={{
              color: audioEnabled ? '#00ffd5' : '#64748b',
              borderColor: audioEnabled ? '#00ffd5' : undefined
            }}
            title={audioEnabled ? 'Audio FX: ON' : 'Audio FX: OFF'}
          >
            {audioEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>

          {/* Scanner Toggle */}
          <button
            onClick={() => setScannerEnabled(!scannerEnabled)}
            className="breach-hud-btn"
            style={{
              color: scannerEnabled ? '#00ffd5' : '#64748b',
              borderColor: scannerEnabled ? '#00ffd5' : undefined
            }}
          >
            SCANNER: {scannerEnabled ? 'ON' : 'OFF'}
          </button>

          {/* Speed Toggle */}
          <button
            onClick={() => setSpeedMultiplier(prev => prev === 1 ? 1.8 : prev === 1.8 ? 2.5 : 1)}
            className="breach-hud-btn"
            style={{ color: '#38bdf8' }}
          >
            ⚡ {speedMultiplier}x
          </button>

          {/* Pause / Resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="breach-hud-btn"
            style={{
              color: isPaused ? '#ff4d6d' : '#ffffff',
              borderColor: isPaused ? '#ff4d6d' : undefined
            }}
          >
            {isPaused ? <Play size={11} fill="#ff4d6d" /> : <Pause size={11} fill="#ffffff" />}
            <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>
        </div>

        {/* Vector Filters HUD Bar (Responsive Top-Left) */}
        <div className="breach-map-filters-hud">
          {['ALL', 'ZERO-DAY', 'RANSOMWARE', 'DDOS', 'BOTNET'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`breach-hud-filter-btn ${activeFilter === f ? 'active' : ''}`}
            >
              {f}
            </button>
          ))}

          <button
            onClick={triggerManualAttack}
            className="breach-hud-attack-btn"
            title="Inject simulated Red-Team attack vector"
          >
            <Zap size={11} /> + ATTACK
          </button>
        </div>

      </div>

      {/* ─── LIVE ATTACK TERMINAL TICKER BAR ─── */}
      <div className="breach-telemetry-ticker-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1 }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#00e676',
            boxShadow: '0 0 6px #00e676',
            display: 'inline-block',
            flexShrink: 0
          }} />
          <span style={{ color: '#00ffd5', fontWeight: 700, flexShrink: 0, fontSize: '10.5px' }}>TELEMETRY:</span>
          <span ref={tickerTextRef} style={{ color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            ⚡ Threat monitoring initialized. 10 Active Global C2 nodes tracked.
          </span>
        </div>
        <span className="breach-ticker-fps-badge">
          60 FPS // BUFFER: OK
        </span>
      </div>

    </div>
  );
}
