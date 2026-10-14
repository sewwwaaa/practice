import React, { useState, useEffect } from 'react';
import { Terminal, Minus, Square, X } from 'lucide-react';

export default function LiveTerminalOverlay() {
  const [minimized, setMinimized] = useState(false);
  const [closed, setClosed] = useState(false);
  const [logs, setLogs] = useState([
    '> initializing CYBERNEXUS...',
    '> security systems online',
    '> scanning infrastructure...',
    '> analyzing vulnerabilities...',
    '> monitoring network traffic...',
    '> updating threat intelligence...',
    '> cyber news feed synchronized...',
    '> system status: SECURE',
    '> awaiting command...'
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const phrases = [
        '> telemetry packet intercepted on eth0: 0.02ms latency',
        '> active IDS filter: zero-day payload dropped',
        '> SIEM core: 148,200 events/sec processed clean',
        '> threat intelligence feed: SYNCED (0ms delay)',
        '> firewall status: 100% SENSORS ARMED'
      ];
      const randomLog = phrases[Math.floor(Math.random() * phrases.length)];
      setLogs(prev => [...prev.slice(-10), randomLog]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (closed) return null;

  return (
    <div className="live-terminal-box" style={{ height: minimized ? '38px' : 'auto' }}>
      <div className="terminal-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Terminal size={14} /> LIVE TERMINAL
        </span>
        <div className="terminal-controls">
          <button 
            className="terminal-btn" 
            style={{ background: '#ffcc00' }} 
            onClick={() => setMinimized(!minimized)} 
            title="Minimize" 
          />
          <button 
            className="terminal-btn" 
            style={{ background: '#00ff99' }} 
            onClick={() => setMinimized(false)} 
            title="Expand" 
          />
          <button 
            className="terminal-btn" 
            style={{ background: '#ff0055' }} 
            onClick={() => setClosed(true)} 
            title="Close" 
          />
        </div>
      </div>

      {!minimized && (
        <div className="terminal-body">
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '4px' }}>
              <span style={{ color: '#00ff99' }}>{log}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
