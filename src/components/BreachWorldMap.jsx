import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, Radio, Waypoints, MapPin } from 'lucide-react';

import WorldMapPaths from './WorldMapPaths.jsx';
import { COUNTRY_ANCHORS, MAP_VIEWBOX } from './countryAnchors.js';
import { SEVERITY_COLORS, TRAFFIC_HUBS, severityRank, geoBasisLabel } from './breachGeo.js';

const { minX, minY, width: VW, height: VH } = MAP_VIEWBOX;

const toPct = ([x, y]) => ({
  left: ((x - minX) / VW) * 100,
  top: ((y - minY) / VH) * 100,
});

const hexA = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

const TRAFFIC_COLORS = ['#ff2a55', '#ff9100', '#00e5ff', '#a78bfa'];

const reducedMotion = () => {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
};

/** Point on a quadratic arc that bows "upwards" (north) between two anchors. */
function arcPoint(a, b, t) {
  const [x1, y1] = a;
  const [x2, y2] = b;
  const dist = Math.hypot(x2 - x1, y2 - y1);
  const lift = Math.min(Math.max(dist * 0.32, 18), 110);
  const cx = (x1 + x2) / 2;
  const cy = Math.min(y1, y2) - lift;
  const u = 1 - t;
  return [u * u * x1 + 2 * u * t * cx + t * t * x2, u * u * y1 + 2 * u * t * cy + t * t * y2];
}

/**
 * Live global threat map.
 * @param stories        enriched stories (see breachGeo.enrichStory)
 * @param focusStory     story currently spotlighted by the page's auto-cycle
 * @param onCountrySelect(country)  pin click
 * @param onInteract(bool)          true while the pointer is over the map (pauses auto-cycle)
 */
export default function BreachWorldMap({ stories, focusStory, onCountrySelect, onInteract }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [hoverIso, setHoverIso] = useState(null);
  const [pointerInside, setPointerInside] = useState(false);
  const [paused, setPaused] = useState(false);
  const [trafficOn, setTrafficOn] = useState(true);

  // ── Group located stories by country ──
  const countries = useMemo(() => {
    const byIso = new Map();
    stories.forEach(s => {
      if (!s.geo) return;
      const entry = byIso.get(s.geo.iso) || {
        iso: s.geo.iso, name: s.geo.name, anchor: COUNTRY_ANCHORS[s.geo.iso], stories: [], topSeverity: 'low'
      };
      entry.stories.push(s);
      if (severityRank(s.severityKey) > severityRank(entry.topSeverity)) entry.topSeverity = s.severityKey;
      byIso.set(s.geo.iso, entry);
    });
    return [...byIso.values()].sort((a, b) =>
      b.stories.length - a.stories.length || severityRank(b.topSeverity) - severityRank(a.topSeverity));
  }, [stories]);

  const attributed = useMemo(() => stories
    .filter(s => s.actor && s.geo && s.actor.iso !== s.geo.iso)
    .map(s => ({ from: COUNTRY_ANCHORS[s.actor.iso], to: COUNTRY_ANCHORS[s.geo.iso], color: '#ff2a55', story: s })), [stories]);

  const actorIsos = useMemo(() => [...new Set(stories.filter(s => s.actor).map(s => s.actor.iso))], [stories]);

  const focusIso = focusStory?.geo?.iso || null;

  // ── Country heat styling injected into the SVG ──
  const heatCss = useMemo(() => {
    const rules = countries.map(c => {
      const color = SEVERITY_COLORS[c.topSeverity];
      const alpha = Math.min(0.6, 0.2 + c.stories.length * 0.09);
      const sel = `#bm-svg #${c.iso}, #bm-svg #${c.iso} path`;
      return `${sel} { fill: ${hexA(color, alpha)}; stroke: ${hexA(color, 0.85)}; stroke-width: 0.7; }`;
    });
    actorIsos.forEach(iso => {
      rules.push(`#bm-svg #${iso}, #bm-svg #${iso} path { fill: rgba(168, 85, 247, 0.28); stroke: #c084fc; stroke-dasharray: 2 1.5; }`);
    });
    if (focusIso) {
      rules.push(`#bm-svg #${focusIso}, #bm-svg #${focusIso} path { animation: bmCountryPulse 1.4s ease-in-out infinite; stroke-width: 1.1; }`);
    }
    return rules.join('\n');
  }, [countries, actorIsos, focusIso]);

  // Mutable data for the render loop (avoids restarting the animation on every prop change)
  const loopRef = useRef({});
  loopRef.current = {
    targets: countries.map(c => c.anchor),
    attributed,
    focus: focusStory?.anchor || null,
    focusColor: focusStory?.severityColor || '#00ffd5',
    paused,
    trafficOn,
  };

  // ── Canvas animation loop ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const calm = reducedMotion();
    let width = 0;
    let height = 0;
    let dpr = 1;
    let frame = null;
    let visible = true;
    let lastSpawn = 0;
    let sweepX = minX;
    const traffic = [];
    const ripples = [];
    const attributedProgress = new Map();

    const resize = () => {
      const r = container.getBoundingClientRect();
      width = r.width;
      height = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.05 });
    io.observe(container);

    const drawComet = (a, b, t, color, widthMul = 1, trail = 0.16) => {
      const steps = 14;
      const t0 = Math.max(0, t - trail);
      let prev = arcPoint(a, b, t0);
      for (let i = 1; i <= steps; i++) {
        const tt = t0 + ((t - t0) * i) / steps;
        const p = arcPoint(a, b, tt);
        const k = i / steps;
        ctx.beginPath();
        ctx.moveTo(prev[0], prev[1]);
        ctx.lineTo(p[0], p[1]);
        ctx.strokeStyle = hexA(color, 0.08 + k * 0.85);
        ctx.lineWidth = (0.4 + k * 1.5) * widthMul;
        ctx.stroke();
        prev = p;
      }
      ctx.beginPath();
      ctx.arc(prev[0], prev[1], 1.7 * widthMul, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const drawGuide = (a, b, color, alpha) => {
      ctx.beginPath();
      for (let i = 0; i <= 24; i++) {
        const p = arcPoint(a, b, i / 24);
        if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
      }
      ctx.strokeStyle = hexA(color, alpha);
      ctx.lineWidth = 0.6;
      ctx.setLineDash([2, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const render = (now) => {
      frame = requestAnimationFrame(render);
      const data = loopRef.current;
      if (!visible || document.hidden || data.paused || width === 0) return;

      const sx = (width * dpr) / VW;
      const sy = (height * dpr) / VH;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(sx, 0, 0, sy, -minX * sx, -minY * sy);
      const time = now / 1000;

      // 1. Scanner sweep
      if (!calm) {
        sweepX += 0.9;
        if (sweepX > minX + VW) sweepX = minX;
        const g = ctx.createLinearGradient(sweepX - 40, 0, sweepX, 0);
        g.addColorStop(0, 'rgba(0, 255, 213, 0)');
        g.addColorStop(1, 'rgba(0, 255, 213, 0.09)');
        ctx.fillStyle = g;
        ctx.fillRect(sweepX - 40, minY, 40, VH);
        ctx.fillStyle = 'rgba(0, 255, 213, 0.35)';
        ctx.fillRect(sweepX, minY, 0.6, VH);
      }

      // 2. Simulated background traffic (illustrative only)
      const targets = data.targets.length ? data.targets : TRAFFIC_HUBS.map(h => COUNTRY_ANCHORS[h]);
      if (data.trafficOn && !calm && now - lastSpawn > 650 && traffic.length < 18) {
        lastSpawn = now;
        const from = COUNTRY_ANCHORS[TRAFFIC_HUBS[Math.floor(Math.random() * TRAFFIC_HUBS.length)]];
        const pool = Math.random() < 0.75 ? targets : TRAFFIC_HUBS.map(h => COUNTRY_ANCHORS[h]);
        const to = pool[Math.floor(Math.random() * pool.length)];
        if (from && to && from !== to) {
          traffic.push({
            from, to, t: 0,
            speed: 0.006 + Math.random() * 0.006,
            color: TRAFFIC_COLORS[Math.floor(Math.random() * TRAFFIC_COLORS.length)],
          });
        }
      }
      for (let i = traffic.length - 1; i >= 0; i--) {
        const a = traffic[i];
        if (!data.trafficOn) { traffic.splice(i, 1); continue; }
        drawGuide(a.from, a.to, a.color, 0.08);
        drawComet(a.from, a.to, a.t, a.color, 0.75);
        a.t += a.speed;
        if (a.t >= 1) {
          if (ripples.length < 24) ripples.push({ x: a.to[0], y: a.to[1], r: 1, alpha: 0.8, color: a.color });
          traffic.splice(i, 1);
        }
      }

      // 3. Attributed attacks named in reports (actor country → target)
      data.attributed.forEach((arc, idx) => {
        let t = attributedProgress.get(arc.story.id) ?? (idx * 0.23) % 1;
        drawGuide(arc.from, arc.to, '#c084fc', 0.45);
        drawComet(arc.from, arc.to, t, '#ff2a55', 1.4, 0.22);
        t += calm ? 0 : 0.006;
        if (t >= 1) {
          t = 0;
          ripples.push({ x: arc.to[0], y: arc.to[1], r: 1, alpha: 1, color: '#ff2a55' });
        }
        attributedProgress.set(arc.story.id, t);
      });

      // 4. Impact ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.strokeStyle = hexA(r.color, r.alpha);
        ctx.lineWidth = 0.9;
        ctx.stroke();
        r.r += 0.45;
        r.alpha *= 0.94;
        if (r.alpha < 0.04) ripples.splice(i, 1);
      }

      // 5. Spotlight shockwaves around the focused country
      if (data.focus) {
        const [fx, fy] = data.focus;
        for (let k = 0; k < 3; k++) {
          const phase = ((time * 0.7) + k / 3) % 1;
          ctx.beginPath();
          ctx.arc(fx, fy, 3 + phase * 30, 0, Math.PI * 2);
          ctx.strokeStyle = hexA(data.focusColor, (1 - phase) * 0.55);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        // crosshair
        ctx.strokeStyle = hexA(data.focusColor, 0.5);
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(fx - 14, fy); ctx.lineTo(fx - 6, fy);
        ctx.moveTo(fx + 6, fy); ctx.lineTo(fx + 14, fy);
        ctx.moveTo(fx, fy - 14); ctx.lineTo(fx, fy - 6);
        ctx.moveTo(fx, fy + 6); ctx.lineTo(fx, fy + 14);
        ctx.stroke();
      }
    };

    frame = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const hovered = countries.find(c => c.iso === hoverIso);

  // Label the focused + busiest countries, skipping any label that would collide with one already placed.
  const labelled = useMemo(() => {
    const placed = [];
    const out = new Set();
    const order = [...countries].sort((a, b) =>
      (b.iso === focusIso) - (a.iso === focusIso) || b.stories.length - a.stories.length);
    for (const c of order) {
      if (out.size >= 7) break;
      const p = toPct(c.anchor);
      if (placed.some(q => Math.abs(q.left - p.left) < 12 && Math.abs(q.top - p.top) < 5)) continue;
      placed.push(p);
      out.add(c.iso);
    }
    return out;
  }, [countries, focusIso]);

  const focusPos = focusStory?.anchor ? toPct(focusStory.anchor) : null;
  const hoverPos = hovered ? toPct(hovered.anchor) : null;

  return (
    <div className="bm-map-shell">
      <div
        ref={containerRef}
        className="bm-map"
        onMouseEnter={() => { onInteract?.(true); setPointerInside(true); }}
        onMouseLeave={() => { onInteract?.(false); setPointerInside(false); setHoverIso(null); }}
      >
        {/* Base map */}
        <svg
          id="bm-svg"
          className="bm-map-svg"
          viewBox={`${minX} ${minY} ${VW} ${VH}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          <defs>
            <pattern id="bm-dots" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="0.55" fill="rgba(148, 178, 230, 0.10)" />
            </pattern>
            <radialGradient id="bm-vignette" cx="50%" cy="45%" r="70%">
              <stop offset="60%" stopColor="rgba(0,0,0,0)" />
              <stop offset="100%" stopColor="rgba(2,4,10,0.75)" />
            </radialGradient>
          </defs>
          <style>{heatCss}</style>

          <rect x={minX} y={minY} width={VW} height={VH} fill="url(#bm-dots)" />

          <g className="bm-graticule">
            {[300, 360, 420, 480, 540, 600, 660].map(y => (
              <line key={`h${y}`} x1={minX} x2={minX + VW} y1={y} y2={y} />
            ))}
            {[90, 170, 250, 330, 410, 490, 570, 650, 730].map(x => (
              <line key={`v${x}`} y1={minY} y2={minY + VH} x1={x} x2={x} />
            ))}
          </g>

          <WorldMapPaths />

          <rect x={minX} y={minY} width={VW} height={VH} fill="url(#bm-vignette)" />
        </svg>

        {/* Animated arcs / ripples */}
        <canvas ref={canvasRef} className="bm-map-canvas" />

        {/* Country pins (real stories) */}
        {countries.map(c => {
          const pos = toPct(c.anchor);
          const color = SEVERITY_COLORS[c.topSeverity];
          const isFocus = c.iso === focusIso;
          const size = Math.min(22, 11 + c.stories.length * 2.5);
          return (
            <button
              key={c.iso}
              type="button"
              data-hotspot
              className={`bm-pin ${isFocus ? 'is-focus' : ''}`}
              style={{ left: `${pos.left}%`, top: `${pos.top}%`, '--c': color, '--s': `${size}px` }}
              onMouseEnter={() => setHoverIso(c.iso)}
              onMouseLeave={() => setHoverIso(null)}
              onFocus={() => setHoverIso(c.iso)}
              onBlur={() => setHoverIso(null)}
              onClick={() => onCountrySelect?.(c)}
              aria-label={`${c.name}: ${c.stories.length} live ${c.stories.length === 1 ? 'story' : 'stories'}, top severity ${c.topSeverity}`}
            >
              <span className="bm-pin-ring" />
              <span className="bm-pin-ring bm-pin-ring-2" />
              <span className="bm-pin-core" />
              {c.stories.length > 1 && <span className="bm-pin-count">{c.stories.length}</span>}
              {labelled.has(c.iso) && <span className="bm-pin-label">{c.name}</span>}
            </button>
          );
        })}

        {/* Hover briefing */}
        {hovered && hoverPos && (
          <div
            className={`bm-tooltip ${hoverPos.left > 60 ? 'is-left' : ''} ${hoverPos.top > 62 ? 'is-up' : ''}`}
            style={{ left: `${hoverPos.left}%`, top: `${hoverPos.top}%` }}
          >
            <div className="bm-tooltip-head">
              <span><MapPin size={12} /> {hovered.name}</span>
              <span className="bm-sev" style={{ '--c': SEVERITY_COLORS[hovered.topSeverity] }}>{hovered.topSeverity}</span>
            </div>
            {hovered.stories.slice(0, 3).map(s => (
              <div key={s.id} className="bm-tooltip-row">
                <i style={{ background: s.severityColor }} />
                <span>{s.title}</span>
              </div>
            ))}
            <div className="bm-tooltip-foot">
              {hovered.stories.length} live {hovered.stories.length === 1 ? 'story' : 'stories'} · click to open briefing
            </div>
          </div>
        )}

        {/* Spotlight on the auto-cycled story (a HUD callout: never blocks pins, fades while you explore) */}
        {focusStory && focusPos && !hovered && (
          <div
            key={focusStory.id}
            aria-hidden="true"
            className={`bm-spotlight ${focusPos.left > 55 ? 'is-left' : ''} ${focusPos.top > 60 ? 'is-up' : ''} ${pointerInside ? 'is-dim' : ''}`}
            style={{ left: `${focusPos.left}%`, top: `${focusPos.top}%`, '--c': focusStory.severityColor }}
          >
            <span className="bm-spotlight-photo">
              <img
                src={focusStory.visual.photo}
                alt=""
                style={{ filter: focusStory.visual.filter, objectPosition: focusStory.visual.crop }}
              />
            </span>
            <span className="bm-spotlight-body">
              <span className="bm-spotlight-meta">
                <b style={{ color: focusStory.visual.color }}>{focusStory.visual.label}</b>
                <span>{focusStory.geo.name}</span>
              </span>
              <span className="bm-spotlight-title">{focusStory.title}</span>
              <span className="bm-spotlight-basis">{geoBasisLabel(focusStory.geo, focusStory.source)}</span>
            </span>
          </div>
        )}

        {/* HUD: top-left status */}
        <div className="bm-hud bm-hud-tl">
          <span className="bm-live"><Radio size={12} /> LIVE</span>
          <span>{countries.reduce((n, c) => n + c.stories.length, 0)} incidents · {countries.length} countries</span>
        </div>

        {/* HUD: controls */}
        <div className="bm-hud bm-hud-tr">
          <button type="button" className={`bm-hud-btn ${trafficOn ? 'is-on' : ''}`} onClick={() => setTrafficOn(v => !v)} title="Toggle illustrative background traffic">
            <Waypoints size={12} /> TRAFFIC {trafficOn ? 'ON' : 'OFF'}
          </button>
          <button type="button" className={`bm-hud-btn ${paused ? 'is-alert' : ''}`} onClick={() => setPaused(p => !p)}>
            {paused ? <Play size={12} /> : <Pause size={12} />} {paused ? 'RESUME' : 'PAUSE'}
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="bm-legend">
        {Object.entries(SEVERITY_COLORS).map(([k, c]) => (
          <span key={k}><i className="dot" style={{ background: c, color: c }} />{k}</span>
        ))}
        <span><i className="line solid" /> attributed attack (named in report)</span>
        <span><i className="line dashed" /> simulated traffic (illustrative)</span>
      </div>
    </div>
  );
}
