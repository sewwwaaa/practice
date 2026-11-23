import React, { useEffect, useRef } from 'react';

const THREATS = [
  { label: 'APT-29', severity: 'critical', angle: 0 },
  { label: 'LockBit', severity: 'critical', angle: Math.PI * 0.4 },
  { label: 'Emotet', severity: 'high', angle: Math.PI * 0.8 },
  { label: 'AgentTesla', severity: 'high', angle: Math.PI * 1.2 },
  { label: 'Cobalt', severity: 'medium', angle: Math.PI * 1.6 },
  { label: 'DDoS', severity: 'medium', angle: Math.PI * 0.2 },
  { label: 'PhishKit', severity: 'low', angle: Math.PI * 0.6 },
  { label: 'Scanner', severity: 'low', angle: Math.PI * 1.0 },
];

const COLORS = {
  critical: '#ff1744',
  high: '#ff9100',
  medium: '#00b0ff',
  low: '#00e676',
};

export default function ConstellationThreatMap({ height = 270 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let width = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let radius = 100;
    let frameId = null;
    let time = 0;

    // Nodes keep polar coordinates so they re-layout cleanly on resize.
    const nodes = THREATS.map(t => ({
      ...t,
      color: COLORS[t.severity],
      size: t.severity === 'critical' ? 4.5 : t.severity === 'high' ? 4 : 3.2,
      dist: 0.5 + Math.random() * 0.45,
      drift: (Math.random() - 0.5) * 0.0016,
      pulsePhase: Math.random() * Math.PI * 2,
      lastHit: -10,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      h = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = width / 2;
      cy = h / 2;
      radius = Math.min(width, h) / 2 - 36; // leave room for the legend strip
    };

    resize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro?.observe(canvas);

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, h);

      // Radar rings
      ctx.lineWidth = 1;
      [0.33, 0.66, 1].forEach((f, i) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius * f, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 213, ${0.1 - i * 0.02})`;
        ctx.setLineDash(i === 2 ? [] : [2, 5]);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Crosshair
      ctx.strokeStyle = 'rgba(0, 255, 213, 0.06)';
      ctx.beginPath();
      ctx.moveTo(cx - radius, cy); ctx.lineTo(cx + radius, cy);
      ctx.moveTo(cx, cy - radius); ctx.lineTo(cx, cy + radius);
      ctx.stroke();

      // Rotating radar sweep
      const sweep = (time * 0.9) % (Math.PI * 2);
      if (ctx.createConicGradient) {
        const grad = ctx.createConicGradient(sweep - 0.9, cx, cy);
        grad.addColorStop(0, 'rgba(0, 255, 213, 0)');
        grad.addColorStop(0.14, 'rgba(0, 255, 213, 0.16)');
        grad.addColorStop(0.143, 'rgba(0, 255, 213, 0)');
        grad.addColorStop(1, 'rgba(0, 255, 213, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweep) * radius, cy + Math.sin(sweep) * radius);
      ctx.strokeStyle = 'rgba(0, 255, 213, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      nodes.forEach((node, i) => {
        node.angle += node.drift;
        const nx = cx + Math.cos(node.angle) * radius * node.dist;
        const ny = cy + Math.sin(node.angle) * radius * node.dist;

        // Light up nodes as the sweep passes them
        const norm = ((node.angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const delta = (sweep - norm + Math.PI * 2) % (Math.PI * 2);
        if (delta < 0.05) node.lastHit = time;
        const hit = Math.max(0, 1 - (time - node.lastHit) * 1.2);

        // Link to SOC core
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(nx, ny);
        ctx.strokeStyle = `rgba(0, 255, 213, ${0.1 + Math.sin(time + i) * 0.04 + hit * 0.2})`;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Data packet travelling to the node
        const p = (time * 0.5 + i * 0.3) % 1;
        ctx.beginPath();
        ctx.arc(cx + (nx - cx) * p, cy + (ny - cy) * p, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Halo + core
        const pulse = 1 + Math.sin(time * 2 + node.pulsePhase) * 0.18;
        ctx.beginPath();
        ctx.arc(nx, ny, node.size * (2.2 + hit * 1.6) * pulse, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = 0.12 + hit * 0.25;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.arc(nx, ny, node.size, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(226, 232, 240, ${0.45 + hit * 0.5})`;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, nx, ny + node.size + 13);
      });

      // SOC core
      const cp = 1 + Math.sin(time * 1.5) * 0.12;
      ctx.beginPath();
      ctx.arc(cx, cy, 14 * cp, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 255, 213, 0.08)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#00ffd5';
      ctx.shadowColor = '#00ffd5';
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#00ffd5';
      ctx.textAlign = 'center';
      ctx.fillText('SOC', cx, cy + 22);

      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameId);
      ro?.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: `${height}px`, display: 'block' }}
      aria-label="Animated constellation of tracked threat actors around the SOC"
      role="img"
    />
  );
}
