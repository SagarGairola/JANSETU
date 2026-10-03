import React, { useState, useEffect } from 'react';
import { storyContent } from '../data/storyContent';
import { experienceConfig } from '../config/experienceConfig';
import { audioManager } from '../audio/AudioManager';
import { SceneContainer } from '../components/SceneContainer';
import { PrimaryButton } from '../components/PrimaryButton';

interface MemoryMontageSceneProps {
  onComplete: () => void;
}

export const MemoryMontageScene: React.FC<MemoryMontageSceneProps> = ({ onComplete }) => {
  const content = storyContent.memoryMontage;
  const words = content.rapidWords;
  const annotations = content.annotations;

  // Phase: 0: Rapid Ticker Words | 1: Pause Lines ("And somehow... we made it.") | 2: Payoff Card
  const [phase, setPhase] = useState<number>(0);
  const [wordIdx, setWordIdx] = useState<number>(0);
  const [pauseStep, setPauseStep] = useState<number>(0);
  const [payoffVisibleCount, setPayoffVisibleCount] = useState<number>(1);

  // Phase 0: Rapid words ticker
  useEffect(() => {
    if (phase === 0) {
      if (wordIdx < words.length) {
        audioManager.playMontageTick();
        const currentWord = words[wordIdx];
        if (currentWord.includes('BUG') || currentWord.includes('NOT WORKING')) {
          audioManager.playGlitch();
        }

        const timer = setTimeout(() => {
          setWordIdx(prev => prev + 1);
        }, 580);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setPhase(1);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, wordIdx, words]);

  // Phase 1: Pause lines
  useEffect(() => {
    if (phase === 1) {
      if (pauseStep === 0) {
        const timer = setTimeout(() => {
          setPauseStep(1);
        }, 1200);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          audioManager.playGoldenChime();
          setPhase(2);
        }, 1800);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, pauseStep]);

  // Phase 2: Payoff lines
  useEffect(() => {
    if (phase === 2) {
      if (payoffVisibleCount < content.payoff.lines.length) {
        const timer = setTimeout(() => {
          setPayoffVisibleCount(prev => prev + 1);
        }, experienceConfig.timings.montagePayoffLineDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, payoffVisibleCount, content.payoff.lines.length]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#050308',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <SceneContainer transitionType="cinematic">
        <div
          style={{
            width: '100%',
            maxWidth: '360px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
          }}
        >
          {/* Phase 0: Rapid Cinematic Memory Flash with Short Annotations */}
          {phase === 0 && wordIdx < words.length && (
            <div
              key={wordIdx}
              className="animate-pop-in"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <span
                style={{
                  fontSize: 'clamp(32px, 9vw, 46px)',
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                  color: words[wordIdx].includes('NOT WORKING') ? '#ff7187' : 'var(--color-accent)',
                  textTransform: 'uppercase'
                }}
              >
                {words[wordIdx]}
              </span>

              {annotations[words[wordIdx]] && (
                <p
                  style={{
                    fontSize: '15px',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    fontStyle: 'italic'
                  }}
                >
                  "{annotations[words[wordIdx]]}"
                </p>
              )}
            </div>
          )}

          {/* Phase 1: Pause Lines */}
          {phase === 1 && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p
                style={{
                  fontSize: 'clamp(20px, 5.2vw, 25px)',
                  color: 'var(--text-secondary)',
                  fontWeight: 500
                }}
              >
                {content.pauseLines[0]}
              </p>

              {pauseStep >= 1 && (
                <h2
                  className="headline-lg animate-fade-in"
                  style={{
                    fontSize: 'clamp(26px, 7vw, 34px)',
                    color: 'var(--color-yes)',
                    fontWeight: 800
                  }}
                >
                  {content.pauseLines[1]}
                </h2>
              )}
            </div>
          )}

          {/* Phase 2: Payoff Card */}
          {phase === 2 && (
            <div className="animate-fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h2
                className="headline-lg"
                style={{
                  fontSize: 'clamp(28px, 7.5vw, 38px)',
                  color: 'var(--color-accent)',
                  letterSpacing: '0.08em',
                  marginBottom: '20px'
                }}
              >
                {content.payoff.title}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px', width: '100%' }}>
                {content.payoff.lines.slice(0, payoffVisibleCount).map((line, idx) => {
                  const isFinal = idx === content.payoff.lines.length - 1;
                  return (
                    <p
                      key={idx}
                      className="animate-fade-in"
                      style={{
                        fontSize: isFinal ? 'clamp(18px, 4.8vw, 22px)' : 'clamp(15px, 4.2vw, 18px)',
                        color: isFinal ? 'var(--color-yes)' : 'var(--text-secondary)',
                        fontWeight: isFinal ? 700 : 500
                      }}
                    >
                      {line}
                    </p>
                  );
                })}
              </div>

              {payoffVisibleCount >= content.payoff.lines.length && (
                <div className="animate-fade-in" style={{ width: '100%', maxWidth: '240px' }}>
                  <PrimaryButton
                    label={content.actionPrompt}
                    onClick={() => {
                      audioManager.playClick();
                      onComplete();
                    }}
                    variant="accent"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </SceneContainer>
    </div>
  );
};
