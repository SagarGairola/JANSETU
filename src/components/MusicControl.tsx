import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { audioManager } from '../audio/AudioManager';
import { experienceConfig } from '../config/experienceConfig';

export const MusicControl: React.FC = () => {
  const [isMuted, setIsMuted] = useState(audioManager.getIsMuted());

  useEffect(() => {
    const unsub = audioManager.subscribe(info => {
      setIsMuted(info.isMuted);
    });
    return () => unsub();
  }, []);

  if (!experienceConfig.SHOW_MUSIC_TOGGLE) {
    return null;
  }

  const handleToggle = () => {
    const muted = audioManager.toggleMute();
    setIsMuted(muted);
  };

  return (
    <button
      type="button"
      className="music-toggle-btn"
      onClick={handleToggle}
      aria-label={isMuted ? 'Unmute music' : 'Mute music'}
      title={isMuted ? 'Unmute' : 'Mute'}
    >
      {isMuted ? (
        <VolumeX size={18} strokeWidth={2.2} style={{ color: 'var(--text-muted)' }} />
      ) : (
        <Volume2 size={18} strokeWidth={2.2} style={{ color: 'var(--color-accent)' }} />
      )}
    </button>
  );
};
