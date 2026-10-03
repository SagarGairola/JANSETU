import React, { useState } from 'react';
import { storyContent } from '../data/storyContent';
import { audioManager } from '../audio/AudioManager';
import { SceneContainer } from '../components/SceneContainer';
import { PrimaryButton } from '../components/PrimaryButton';

interface TeamQuestionsSceneProps {
  onComplete: (choice: 'ABSOLUTELY' | 'NEVER_AGAIN') => void;
}

export const TeamQuestionsScene: React.FC<TeamQuestionsSceneProps> = ({ onComplete }) => {
  const content = storyContent.teamQuestions;
  const comp = content.compatibilityCheck;

  // Step: 0: Question | 1: Answer Reaction | 2: Short Compatibility Check
  const [step, setStep] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<'ABSOLUTELY' | 'NEVER_AGAIN' | null>(null);
  const [compStep, setCompStep] = useState<number>(0);

  const handleSelect = (choice: 'ABSOLUTELY' | 'NEVER_AGAIN') => {
    setSelectedChoice(choice);
    audioManager.playClick();
    setStep(1);

    // After 2.4s, show the short comedy compatibility check
    setTimeout(() => {
      setStep(2);
      audioManager.playPop();

      // Telemetry sequence: checking -> result
      setTimeout(() => setCompStep(1), 1200);
      setTimeout(() => {
        audioManager.playGoldenChime();
        setCompStep(2);
      }, 2400);
    }, 2400);
  };

  const handleProceed = () => {
    audioManager.playClick();
    onComplete(selectedChoice || 'ABSOLUTELY');
  };

  return (
    <SceneContainer transitionType="normal">
      <div
        style={{
          width: '100%',
          maxWidth: '360px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 0',
          textAlign: 'center'
        }}
      >
        {/* Step 0: Question */}
        {step === 0 && (
          <div className="animate-fade-in" style={{ width: '100%' }}>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {content.introLines[0]}
            </p>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '24px' }}>
              {content.introLines[1]}
            </p>

            <h2
              className="headline-lg"
              style={{
                fontSize: 'clamp(20px, 5.2vw, 26px)',
                marginBottom: '28px'
              }}
            >
              {content.question}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
              <button
                type="button"
                onClick={() => handleSelect('ABSOLUTELY')}
                className="btn-primary variant-yes"
              >
                <span className="btn-main-label">{content.choiceAlways.label}</span>
                <span className="btn-sub-label">{content.choiceAlways.subtext}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelect('NEVER_AGAIN')}
                className="btn-primary variant-no"
              >
                <span className="btn-main-label">{content.choiceNever.label}</span>
                <span className="btn-sub-label">{content.choiceNever.subtext}</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Answer Reaction */}
        {step === 1 && selectedChoice && (
          <div className="animate-pop-in" style={{ width: '100%' }}>
            {selectedChoice === 'ABSOLUTELY' ? (
              <div>
                <h2 className="headline-lg" style={{ color: 'var(--color-yes)', marginBottom: '12px', fontSize: '28px' }}>
                  {content.choiceAlways.reaction[0]}
                </h2>
                <p className="body-text" style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
                  {content.choiceAlways.reaction[1]}
                </p>
              </div>
            ) : (
              <div>
                <h2 className="headline-lg" style={{ color: 'var(--color-no)', marginBottom: '12px', fontSize: '26px' }}>
                  {content.choiceNever.reaction[0]}
                </h2>
                <p className="body-text" style={{ fontSize: '17px', color: 'var(--text-primary)' }}>
                  {content.choiceNever.reaction[1]}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Short Compatibility Check Comedy Beat (Section 9) */}
        {step === 2 && (
          <div className="animate-fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px 16px',
                fontFamily: 'monospace'
              }}
            >
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {comp.checkingText}
              </p>

              {compStep >= 1 && (
                <div className="animate-fade-in" style={{ fontSize: '12px', color: 'var(--color-accent)', marginBottom: '6px' }}>
                  [SCANNING 48 HOURS OF CHAT LOGS...]
                </div>
              )}

              {compStep >= 2 && (
                <div className="animate-pop-in" style={{ marginTop: '12px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{comp.resultLabel} </span>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-yes)' }}>
                    {comp.resultText}
                  </span>
                </div>
              )}
            </div>

            {compStep >= 2 && (
              <div className="animate-fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', marginTop: '8px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {comp.leadIn}
                </p>

                <div style={{ width: '100%', maxWidth: '240px' }}>
                  <PrimaryButton
                    label="Enter Memory Montage 👉"
                    onClick={handleProceed}
                    variant="accent"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </SceneContainer>
  );
};
