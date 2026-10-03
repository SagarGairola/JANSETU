import React, { useState } from 'react';
import { storyContent } from '../data/storyContent';
import { audioManager } from '../audio/AudioManager';
import { SceneContainer } from '../components/SceneContainer';
import { PrimaryButton } from '../components/PrimaryButton';

interface SgYesPathSceneProps {
  wasInitialYes: boolean;
  onComplete: (trait: string, compliment: string) => void;
}

export const SgYesPathScene: React.FC<SgYesPathSceneProps> = ({
  wasInitialYes,
  onComplete
}) => {
  const content = storyContent.yesPath;

  // Steps:
  // 0: Intro reaction ("Ohhh, look at you being nice.")
  // 1: Trait selection
  // 2: Trait confirmation ("Interesting choice." -> "I'll allow it.")
  // 3: Compliment text input
  // 4: Saved & Evidence warning + comedic extension ("That was suspiciously nice...")
  const [step, setStep] = useState<number>(0);
  const [selectedTrait, setSelectedTrait] = useState<string>('');
  const [complimentInput, setComplimentInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmationSubline, setConfirmationSubline] = useState<boolean>(false);
  const [showSuspiciousComedy, setShowSuspiciousComedy] = useState<boolean>(false);

  const handleInitialNext = () => {
    audioManager.playClick();
    setStep(1);
  };

  const handleSelectTrait = (traitId: string) => {
    setSelectedTrait(traitId);
    audioManager.playClick();
    setStep(2);

    setTimeout(() => {
      setConfirmationSubline(true);
    }, 900);

    setTimeout(() => {
      setStep(3);
    }, 2200);
  };

  const handleSaveCompliment = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = complimentInput.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    audioManager.playGoldenChime();
    setStep(4);

    // Stagger the comedic extension ("That was suspiciously nice...")
    setTimeout(() => {
      setShowSuspiciousComedy(true);
    }, 1800);
  };

  const handleFinish = () => {
    audioManager.playClick();
    onComplete(selectedTrait, complimentInput.trim());
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
          padding: '10px 0'
        }}
      >
        {/* Step 0: Intro reaction */}
        {step === 0 && (
          <div className="animate-fade-in" style={{ width: '100%', textAlign: 'center' }}>
            <h2
              className="headline-lg"
              style={{
                fontSize: 'clamp(24px, 6vw, 30px)',
                marginBottom: '16px'
              }}
            >
              {wasInitialYes
                ? content.initialReaction
                : 'Finally! Took you long enough. 😌'}
            </h2>
            <p className="body-text" style={{ marginBottom: '32px' }}>
              {content.needEvidence}
            </p>
            <PrimaryButton
              label="Let's see the options 👀"
              onClick={handleInitialNext}
              variant="accent"
            />
          </div>
        )}

        {/* Step 1: Trait Question */}
        {step === 1 && (
          <div className="animate-fade-in" style={{ width: '100%', textAlign: 'center' }}>
            <h2
              className="headline-lg"
              style={{
                fontSize: 'clamp(20px, 5.2vw, 26px)',
                marginBottom: '24px'
              }}
            >
              {content.traitQuestion}
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                width: '100%',
                marginBottom: '16px'
              }}
            >
              {content.traits.map((trait, idx) => (
                <button
                  key={trait.id}
                  type="button"
                  onClick={() => handleSelectTrait(trait.id)}
                  className="btn-primary variant-subtle animate-fade-in"
                  style={{
                    padding: '14px 10px',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    animationDelay: `${idx * 60}ms`
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{trait.emoji}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{trait.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Confirmation */}
        {step === 2 && (
          <div className="animate-fade-in" style={{ width: '100%', textAlign: 'center' }}>
            <h2 className="headline-lg" style={{ marginBottom: '14px' }}>
              {content.traitConfirmation}
            </h2>
            {confirmationSubline && (
              <p
                className="animate-fade-in body-text"
                style={{
                  color: 'var(--color-accent)',
                  fontSize: '20px',
                  fontWeight: 600
                }}
              >
                {content.allowIt}
              </p>
            )}
          </div>
        )}

        {/* Step 3: Compliment Text Input */}
        {step === 3 && (
          <form
            onSubmit={handleSaveCompliment}
            className="animate-fade-in"
            style={{ width: '100%', textAlign: 'center' }}
          >
            <h2
              className="headline-lg"
              style={{
                fontSize: 'clamp(22px, 5.5vw, 28px)',
                marginBottom: '20px'
              }}
            >
              {content.complimentPrompt}
            </h2>

            <div style={{ width: '100%', marginBottom: '20px' }}>
              <input
                type="text"
                value={complimentInput}
                onChange={e => setComplimentInput(e.target.value)}
                placeholder={content.complimentPlaceholder}
                autoFocus
                maxLength={100}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '16px 18px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  textAlign: 'center',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <PrimaryButton
              label={isSubmitting ? 'SAVING...' : content.saveButtonText}
              type="submit"
              onClick={handleSaveCompliment}
              disabled={!complimentInput.trim() || isSubmitting}
              variant="yes"
            />
          </form>
        )}

        {/* Step 4: Saved & Evidence Warning + Comedy Extension */}
        {step === 4 && (
          <div className="animate-fade-in" style={{ width: '100%', textAlign: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(101, 230, 165, 0.15)',
                color: 'var(--color-yes)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                margin: '0 auto 16px auto',
                border: '1.5px solid var(--color-yes)'
              }}
            >
              ✓
            </div>
            <h2 className="headline-lg" style={{ marginBottom: '8px', fontSize: '26px', color: 'var(--color-yes)' }}>
              {content.complimentSaved}
            </h2>
            <p className="body-text" style={{ marginBottom: '16px', color: '#ffd166', fontSize: '15px' }}>
              {content.warningText}
            </p>

            {/* Comedy extension from Section 7 */}
            {showSuspiciousComedy && (
              <div className="animate-pop-in" style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  {content.suspiciousNice[0]}
                </p>
                <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-accent)' }}>
                  {content.suspiciousNice[1]}
                </p>
              </div>
            )}

            {showSuspiciousComedy && (
              <div style={{ width: '100%', maxWidth: '240px', margin: '0 auto' }}>
                <PrimaryButton
                  label={content.continueButton}
                  onClick={handleFinish}
                  variant="accent"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </SceneContainer>
  );
};
