import React, { useState, useEffect } from 'react';
import { audioManager } from '../audio/AudioManager';
import type { AudioDebugInfo } from '../audio/AudioManager';

export const AudioDebugPanel: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<AudioDebugInfo>(audioManager.getDebugInfo());
  const [minimized, setMinimized] = useState<boolean>(true);
  const [closed, setClosed] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = audioManager.subscribe(info => {
      setDebugInfo(info);
    });
    return () => unsubscribe();
  }, []);

  // Hidden in production or when dismissed
  if (!import.meta.env.DEV || closed) {
    return null;
  }

  // Map scene to human-readable format matching QA spec
  const getSceneLabel = () => {
    switch (debugInfo.scene) {
      case 'OPENING': return 'OPENING';
      case 'SG_QUESTION': return 'SG_QUESTION';
      case 'SG_YES_PATH': return 'YES_PATH';
      case 'TEAM_QUESTIONS': return 'TEAM';
      case 'MEMORY_MONTAGE': return 'MEMORY';
      case 'EMOTIONAL': return 'EMOTIONAL';
      case 'COMEDY_CUT': return 'COMEDY';
      case 'ENDING': return 'ENDING';
      default: return debugInfo.scene || 'OPENING';
    }
  };

  const displayText = `AUDIO / Scene: ${getSceneLabel()} / Track: ${debugInfo.trackId || 'none'} / State: ${debugInfo.state} / Muted: ${debugInfo.isMuted ? 'YES' : 'NO'}`;

  return (
    <aside
      aria-label="Development Audio Debugger"
      style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        zIndex: 9999,
        background: 'rgba(10, 10, 14, 0.94)',
        border: '1px solid rgba(167, 139, 250, 0.35)',
        borderRadius: '8px',
        padding: '6px 12px',
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#E0E7FF',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
          onClick={() => setMinimized(prev => !prev)}
          title="Click to toggle expanded audio debug details"
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: debugInfo.state === 'PLAYING' ? '#65E6A5' : debugInfo.state === 'FADING_IN' || debugInfo.state === 'FADING_OUT' ? '#ffd166' : '#FF7187'
            }}
          />
          <span style={{ fontWeight: 600 }}>{displayText}</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setClosed(true);
          }}
          title="Dismiss audio debug indicator"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0 2px',
            fontSize: '12px',
            lineHeight: 1
          }}
        >
          ✕
        </button>
      </div>

      {!minimized && (
        <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '3px', lineHeight: 1.4, color: '#A0AEC0' }}>
          <div>Title: <span style={{ color: '#F7FAFC' }}>{debugInfo.trackTitle}</span></div>
          <div>Unlocked: <span style={{ color: debugInfo.isUnlocked ? '#65E6A5' : '#FF7187' }}>{debugInfo.isUnlocked ? 'YES' : 'NO (tap screen)'}</span></div>
          <div>Volume: <span style={{ color: '#F7FAFC' }}>{debugInfo.volume.toFixed(2)}</span></div>
        </div>
      )}
    </aside>
  );
};
