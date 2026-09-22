import React, { useEffect, useRef } from 'react';

export default function ConstellationThreatMap() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    const width = rect.width;
    const height = rect.height;

    // Create threat nodes
    const nodes = [];
    const centerX = width / 2;
    const centerY = height / 2;

    // Central node
    nodes.push({
      x: centerX, y: centerY,
      radius: 6, color: '#00ffd5',
      label: 'SOC', isCenter: true,
      vx: 0, vy: 0
    });

    // Threat nodes in orbital positions
    const threats = [
      { label: 'APT-29', severity: 'critical', angle: 0 },
      { label: 'LockBit', severity: 'critical', angle: Math.PI * 0.4 },
      { label: 'Emotet', severity: 'high', angle: Math.PI * 0.8 },
      { label: 'AgentTesla', severity: 'high', angle: Math.PI * 1.2 },
      { label: 'Cobalt', severity: 'medium', angle: Math.PI * 1.6 },
      { label: 'DDoS', severity: 'medium', angle: Math.PI * 0.2 },
      { label: 'PhishKit', severity: 'low', angle: Math.PI * 0.6 },
      { label: 'Scanner', severity: 'low', angle: Math.PI * 1.0 },
    ];

    const getColor = (sev) => {
      switch (sev) {
        case 'critical': return '#ff1744';
        case 'high': return '#ff9100';
        case 'medium': return '#00b0ff';
        default: return '#00e676';
      }
    };

    threats.forEach((t, i) => {
      const dist = 50 + Math.random() * 50;
      nodes.push({
        x: centerX + Math.cos(t.angle) * dist,
        y: centerY + Math.sin(t.angle) * dist,
        radius: t.severity === 'critical' ? 4 : t.severity === 'high' ? 3.5 : 3,
        color: getColor(t.severity),
        label: t.label,
        isCenter: false,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        pulsePhase: Math.random() * Math.PI * 2,
        severity: t.severity
      });
    });

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.01;

      // Draw connections from center to all nodes
      nodes.forEach((node, i) => {
        if (i === 0) return;

        // Update position slightly
        node.x += node.vx;
        node.y += node.vy;

        // Keep in bounds
        const dx = node.x - centerX;
        const dy = node.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 100) {
          node.vx -= dx * 0.001;
          node.vy -= dy * 0.001;
        }

        // Draw connection line
        const opacity = 0.15 + Math.sin(time + i) * 0.05;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(node.x, node.y);
        ctx.strokeStyle = `rgba(0, 255, 213, ${opacity})`;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw data packet animation along the line
        const packetPos = (time * 0.5 + i * 0.3) % 1;
        const px = centerX + (node.x - centerX) * packetPos;
        const py = centerY + (node.y - centerY) * packetPos;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Draw node
        const pulse = 1 + Math.sin(time * 2 + (node.pulsePhase || 0)) * 0.15;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Label
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = `rgba(255, 255, 255, 0.5)`;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + node.radius + 12);
      });

      // Draw center node
      const centerPulse = 1 + Math.sin(time * 1.5) * 0.1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10 * centerPulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 255, 213, 0.08)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#00ffd5';
      ctx.fill();

      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#00ffd5';
      ctx.textAlign = 'center';
      ctx.fillText('SOC', centerX, centerY + 20);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      width: '100%', height: '200px',
      borderRadius: '10px',
      background: 'rgba(2, 4, 8, 0.5)'
    }} />
  );
}
