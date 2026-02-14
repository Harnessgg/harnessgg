import { useState, useEffect } from 'react';

const commands = [
  { pkg: 'npm', cmd: 'npm install -D @harnessgg/electron' },
  { pkg: 'pip', cmd: 'pip install harness-kdenlive' },
];

export function InstallCycler() {
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIdx(i => (i + 1) % commands.length);
        setVisible(true);
      }, 350);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const { pkg, cmd } = commands[idx];

  return (
    <div style={{
      borderRadius: '10px',
      overflow: 'hidden',
      border: '2px solid #5a7a8a',
      maxWidth: '480px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        background: '#283440',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: '#7a9aaa', opacity: 0.45, display: 'inline-block' }} />
        ))}
        <span style={{
          marginLeft: 8,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.2)',
        }}>{pkg}</span>
      </div>
      <div style={{
        padding: '14px 18px',
        background: '#1e2830',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '0.84rem',
        lineHeight: 1.6,
        minHeight: '3rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{ color: '#7a9aaa', userSelect: 'none', opacity: visible ? 1 : 0, transition: 'opacity 0.35s ease' }}>$</span>
        <span style={{ color: '#c4ccd4', minWidth: '36ch', display: 'inline-block', opacity: visible ? 1 : 0, transition: 'opacity 0.35s ease' }}>{cmd}</span>
      </div>
    </div>
  );
}
