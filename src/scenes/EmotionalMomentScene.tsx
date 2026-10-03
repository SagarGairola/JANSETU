import React, { useState } from 'react';
import { storyContent } from '../data/storyContent';
import { audioManager } from '../audio/AudioManager';
import { SceneContainer } from '../components/SceneContainer';
import { PrimaryButton } from '../components/PrimaryButton';

interface EmotionalMomentSceneProps {
  onEmotionalPeak: () => void;
}

export const EmotionalMomentScene: React.FC<EmotionalMomentSceneProps> = ({ onEmotionalPeak }) => {
  const content = storyContent.emotional;

  // Step: 0: Question | 1: Sincere response & Team Badge | 2: Ready to transition
  const [step, setStep] = useState<number>(0);
  const [responseStep, setResponseStep] = useState<number>(0);

  const handleYes = () => {
    audioManager.playGoldenChime();
    setStep(1);

    setTimeout(() => setResponseStep(1), 1400);
    setTimeout(() => setResponseStep(2), 2800);
    setTimeout(() => setResponseStep(3), 4200);
    setTimeout(() => {
      // Complete emotional scene, ready for comedy cut
      onEmotionalPeak();
    }, 6200);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#040207',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
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
          {/* Step 0: Sincere Team Question */}
          {step === 0 && (
            <div className="animate-fade-in" style={{ width: '100%' }}>
              <div style={{ marginBottom: '18px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                  {content.introLines[0]}
                </p>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '4px' }}>
                  {content.introLines[1]}
                </p>
              </div>

              <h2
                className="headline-lg"
                style={{
                  fontSize: 'clamp(22px, 5.8vw, 28px)',
                  marginBottom: '32px',
                  color: '#ffffff'
                }}
              >
                {content.question}
              </h2>

              <div style={{ width: '100%', maxWidth: '260px', margin: '0 auto' }}>
                <PrimaryButton
                  label={content.yesLabel}
                  onClick={handleYes}
                  variant="yes"
                />
              </div>
            </div>
          )}

          {/* Step 1: Sincere Response Lines */}
          {step === 1 && (
            <div className="animate-fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <p
                style={{
                  fontSize: 'clamp(20px, 5.2vw, 25px)',
                  color: 'var(--text-primary)',
                  fontWeight: 600
                }}
              >
                {content.responseLines[0]}
              </p>

              {responseStep >= 1 && (
                <p
                  className="animate-fade-in"
                  style={{
                    fontSize: 'clamp(18px, 4.8vw, 22px)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {content.responseLines[1]}
                </p>
              )}

              {responseStep >= 2 && (
                <div className="animate-pop-in" style={{ marginTop: '12px' }}>
                  <div
                    style={{
                      padding: '10px 24px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'rgba(255, 209, 102, 0.12)',
                      border: '1.5px solid #ffd166',
                      color: '#ffd166',
                      fontSize: 'clamp(18px, 4.8vw, 22px)',
                      fontWeight: 900,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase'
                    }}
                  >
                    <span>{content.teamBadge}</span>
                  </div>
                </div>
              )}

              {responseStep >= 3 && (
                <div className="animate-fade-in" style={{ marginTop: '12px' }}>
                  <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
                    {content.climaxLines[0]}
                  </p>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-accent)', marginTop: '4px' }}>
                    {content.climaxLines[1]}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </SceneContainer>
    </div>
  );
};
