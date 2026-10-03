import React, { useState, useRef } from 'react';
import { storyContent } from '../data/storyContent';
import { experienceConfig } from '../config/experienceConfig';
import { audioManager } from '../audio/AudioManager';
import { SceneContainer } from '../components/SceneContainer';
import { ReactionText } from '../components/ReactionText';

interface SGQuestionSceneProps {
  onYesChosen: (initialChoice: boolean, noCount: number) => void;
}

export const SGQuestionScene: React.FC<SGQuestionSceneProps> = ({ onYesChosen }) => {
  const content = storyContent.sgQuestion;
  const prankConfig = experienceConfig.noPrank;

  const [noClicks, setNoClicks] = useState<number>(0);
  const [reactionText, setReactionText] = useState<string>('');
  const [isMovingMode, setIsMovingMode] = useState<boolean>(false);
  const [moveCount, setMoveCount] = useState<number>(0);
  const [isNoDisappeared, setIsNoDisappeared] = useState<boolean>(false);
  const [noOffset, setNoOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isCooldown, setIsCooldown] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const noScale = Math.max(
    prankConfig.minScale,
    1 - noClicks * prankConfig.scaleShrinkStep
  );

  const yesScale = Math.min(
    prankConfig.maxYesScale,
    1 + noClicks * prankConfig.yesScaleGrowthStep
  );

  const moveOffsets = [
    { x: -75, y: -90 },
    { x: 80, y: 70 },
    { x: -65, y: 85 },
    { x: 70, y: -75 },
    { x: 0, y: 110 }
  ];

  const handleNoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCooldown || isNoDisappeared) return;

    setIsCooldown(true);
    setTimeout(() => setIsCooldown(false), prankConfig.movementPauseMs);

    const nextNoClicks = noClicks + 1;
    setNoClicks(nextNoClicks);

    // Switch to playful chaotic prank soundtrack on NO
    audioManager.playNoPrankMusic();
    audioManager.playShrinkPop(nextNoClicks);

    if (experienceConfig.ENABLE_HAPTICS && 'vibrate' in navigator) {
      try { navigator.vibrate(45); } catch {}
    }

    if (!isMovingMode) {
      // Still in stationary shrinking phase
      const reactionIdx = Math.min(nextNoClicks - 1, content.noReactions.length - 1);
      setReactionText(content.noReactions[reactionIdx]);

      if (nextNoClicks >= prankConfig.clicksBeforeMoving) {
        setIsMovingMode(true);
        audioManager.playWhoosh();
        setNoOffset(moveOffsets[0]);
      }
    } else {
      // In moving phase
      const nextMoveCount = moveCount + 1;
      setMoveCount(nextMoveCount);
      audioManager.playWhoosh();

      if (nextMoveCount >= prankConfig.maxMovingCatches) {
        // Disappear!
        setIsNoDisappeared(true);
        setReactionText(content.noDisappearedMessage);
      } else {
        const nextOffset = moveOffsets[nextMoveCount % moveOffsets.length];
        setNoOffset(nextOffset);
        const movingReactionIdx = Math.min(nextMoveCount - 1, content.noMovingReactions.length - 1);
        setReactionText(content.noMovingReactions[movingReactionIdx]);
      }
    }
  };

  const handleYesClick = () => {
    audioManager.playClick();
    const wasInitialYes = noClicks === 0;
    onYesChosen(wasInitialYes, noClicks);
  };

  return (
    <SceneContainer transitionType="normal">
      <div
        ref={containerRef}
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '12px 0'
        }}
      >
        {/* Main Question */}
        <h1
          className="headline-lg"
          style={{
            marginBottom: '32px',
            maxWidth: '360px',
            textAlign: 'center'
          }}
        >
          {content.question}
        </h1>

        {/* Buttons Playground */}
        <div
          style={{
            width: '100%',
            maxWidth: '340px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            alignItems: 'center',
            position: 'relative',
            minHeight: '230px',
            justifyContent: 'center'
          }}
        >
          {/* YES BUTTON */}
          <div
            style={{
              width: '100%',
              transform: `scale(${yesScale})`,
              transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transformOrigin: 'center center',
              zIndex: 20
            }}
          >
            <button
              type="button"
              onClick={handleYesClick}
              className="btn-primary variant-yes"
              aria-label={`${content.yesLabel}: ${content.yesSubtext}`}
            >
              <span className="btn-main-label">{content.yesLabel}</span>
              <span className="btn-sub-label">{content.yesSubtext}</span>
            </button>
          </div>

          {/* NO BUTTON */}
          {!isNoDisappeared && (
            <div
              style={{
                width: '100%',
                position: isMovingMode ? 'absolute' : 'relative',
                transform: isMovingMode
                  ? `translate3d(${noOffset.x}px, ${noOffset.y}px, 0) scale(${noScale})`
                  : `scale(${noScale})`,
                transition: isMovingMode
                  ? 'transform 0.42s cubic-bezier(0.2, 0.9, 0.3, 1.15)'
                  : 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transformOrigin: 'center center',
                zIndex: isMovingMode ? 30 : 15,
                touchAction: 'manipulation'
              }}
            >
              <button
                type="button"
                onClick={handleNoClick}
                className="btn-primary variant-no"
                aria-label={`${content.noLabel}: ${content.noSubtext}`}
                style={{
                  minHeight: '56px',
                  opacity: isCooldown ? 0.92 : 1.0
                }}
              >
                <span className="btn-main-label">{content.noLabel}</span>
                <span className="btn-sub-label">{content.noSubtext}</span>
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Reaction Text */}
        <div style={{ minHeight: '38px', marginTop: '22px' }}>
          <ReactionText text={reactionText} variant={isNoDisappeared ? 'accent' : 'comedy'} />
        </div>
      </div>
    </SceneContainer>
  );
};
