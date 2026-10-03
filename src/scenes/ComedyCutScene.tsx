import React, { useEffect, useState } from 'react';
import { storyContent } from '../data/storyContent';
import { experienceConfig } from '../config/experienceConfig';
import { audioManager } from '../audio/AudioManager';
import { SceneContainer } from '../components/SceneContainer';
import { PrimaryButton } from '../components/PrimaryButton';

interface ComedyCutSceneProps {
  onProceed: () => void;
}

export const ComedyCutScene: React.FC<ComedyCutSceneProps> = ({ onProceed }) => {
  const content = storyContent.comedyCut;
  const lines = content.lines;
  const [lineIdx, setLineIdx] = useState<number>(0);

  useEffect(() => {
    // Record scratch hard cut
    audioManager.playRecordScratch();

    if ('vibrate' in navigator) {
      try { navigator.vibrate([80, 50, 80]); } catch {}
    }

    const timer = setTimeout(() => {
      setLineIdx(1);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (lineIdx > 0 && lineIdx < lines.length) {
      const timer = setTimeout(() => {
        setLineIdx(prev => prev + 1);
      }, experienceConfig.timings.comedyLineDelay);
      return () => clearTimeout(timer);
    }
  }, [lineIdx, lines.length]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      <SceneContainer transitionType="hard-cut">
        <div
          style={{
            width: '100%',
            maxWidth: '350px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '10px 0'
          }}
        >
          {/* Record scratch visual badge */}
          {lineIdx >= 1 && (
            <div
              className="animate-pop-in"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 14px',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(255, 113, 135, 0.18)',
                color: 'var(--color-no)',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '20px'
              }}
            >
              <span>⚡ RECORD SCRATCH</span>
            </div>
          )}

          {/* Line 0: "Okay." */}
          {lineIdx >= 1 && (
            <p
              className="animate-fade-in"
              style={{
                fontSize: 'clamp(20px, 5vw, 24px)',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                fontWeight: 600
              }}
            >
              {lines[0]}
            </p>
          )}

          {/* Line 1: "ENOUGH EMOTIONAL DAMAGE. 💀" */}
          {lineIdx >= 2 && (
            <h1
              className="headline-lg animate-pop-in"
              style={{
                fontSize: 'clamp(28px, 7.8vw, 38px)',
                color: '#ffd166',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                marginBottom: '18px'
              }}
            >
              {lines[1]}
            </h1>
          )}

          {/* Line 2: "Go drink water." */}
          {lineIdx >= 3 && (
            <p
              className="animate-fade-in"
              style={{
                fontSize: 'clamp(17px, 4.6vw, 20px)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                marginBottom: '12px'
              }}
            >
              {lines[2]}
            </p>
          )}

          {/* Line 3: "Seriously." */}
          {lineIdx >= 4 && (
            <p
              className="animate-fade-in"
              style={{
                fontSize: 'clamp(15px, 4vw, 17px)',
                color: 'var(--color-accent)',
                fontWeight: 700,
                letterSpacing: '0.04em',
                marginBottom: '28px'
              }}
            >
              {lines[3]}
            </p>
          )}

          {lineIdx >= 4 && (
            <div className="animate-fade-in" style={{ width: '100%', maxWidth: '290px' }}>
              <p
                style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '24px',
                  letterSpacing: '0.06em'
                }}
              >
                {content.signature}
              </p>

              <PrimaryButton
                label={content.proceedButton}
                onClick={() => {
                  audioManager.playClick();
                  onProceed();
                }}
                variant="accent"
              />
            </div>
          )}
        </div>
      </SceneContainer>
    </div>
  );
};
