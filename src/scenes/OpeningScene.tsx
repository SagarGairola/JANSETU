import React, { useState, useEffect } from 'react';
import { storyContent } from '../data/storyContent';
import { audioManager } from '../audio/AudioManager';
import { SceneContainer } from '../components/SceneContainer';

interface OpeningSceneProps {
  onComplete: () => void;
}

export const OpeningScene: React.FC<OpeningSceneProps> = ({ onComplete }) => {
  const content = storyContent.opening;
  const lines = content.lines;

  const [visibleCount, setVisibleCount] = useState<number>(1);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    if (visibleCount < lines.length) {
      // Deliberate cinematic pause between lines; extra hold before the final "...right?"
      const isNextToLast = visibleCount === lines.length - 1;
      const delay = isNextToLast ? 2200 : 1300;

      const timer = window.setTimeout(() => {
        setVisibleCount(prev => prev + 1);
      }, delay);
      return () => window.clearTimeout(timer);
    } else {
      const finishTimer = window.setTimeout(() => {
        setIsFinished(true);
      }, 1800);
      return () => window.clearTimeout(finishTimer);
    }
  }, [visibleCount, lines.length]);

  const handleTap = () => {
    if (visibleCount < lines.length) {
      setVisibleCount(prev => Math.min(lines.length, prev + 2));
    } else {
      audioManager.playClick();
      onComplete();
    }
  };

  return (
    <div
      onClick={handleTap}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: '24px',
        backgroundColor: '#040407'
      }}
    >
      <SceneContainer transitionType="cinematic">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '350px',
            width: '100%'
          }}
        >
          {lines.slice(0, visibleCount).map((line, index) => {
            const isFirst = index === 0;
            const isLast = index === lines.length - 1;
            const isDots = line === '...';

            return (
              <p
                key={index}
                className="animate-fade-in"
                style={{
                  fontSize: isFirst
                    ? 'clamp(28px, 7vw, 36px)'
                    : isLast
                    ? 'clamp(24px, 6vw, 30px)'
                    : isDots
                    ? 'clamp(22px, 5.5vw, 26px)'
                    : 'clamp(16px, 4.4vw, 20px)',
                  fontWeight: isFirst || isLast ? 800 : 500,
                  color: isLast
                    ? 'var(--color-accent)'
                    : isFirst
                    ? '#ffffff'
                    : 'var(--text-secondary)',
                  letterSpacing: isFirst ? '0.04em' : '-0.01em',
                  lineHeight: 1.4,
                  textAlign: 'center'
                }}
              >
                {line}
              </p>
            );
          })}
        </div>

        {isFinished && (
          <div
            className="animate-fade-in"
            style={{
              position: 'absolute',
              bottom: 'calc(var(--safe-bottom) + 36px)',
              color: 'var(--color-yes)',
              fontSize: '12.5px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{content.hintText}</span>
            <span style={{ animation: 'pulseSubtle 1.4s infinite' }}>→</span>
          </div>
        )}
      </SceneContainer>
    </div>
  );
};
