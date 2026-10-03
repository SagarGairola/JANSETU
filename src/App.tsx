import React, { useState, useEffect, useCallback } from 'react';
import type { SceneState, UserResponses } from './types/experience';
import { audioManager } from './audio/AudioManager';

// Components
import { MusicControl } from './components/MusicControl';
import { AudioDebugPanel } from './components/AudioDebugPanel';

// Scenes (Restored V6 Storyline)
import { OpeningScene } from './scenes/OpeningScene';
import { SGQuestionScene } from './scenes/SGQuestionScene';
import { SgYesPathScene } from './scenes/SgYesPathScene';
import { TeamQuestionsScene } from './scenes/TeamQuestionsScene';
import { MemoryMontageScene } from './scenes/MemoryMontageScene';
import { EmotionalMomentScene } from './scenes/EmotionalMomentScene';
import { ComedyCutScene } from './scenes/ComedyCutScene';
import { EndingScene } from './scenes/EndingScene';

// Styles
import './styles/experience.css';

export const App: React.FC = () => {
  const [currentScene, setCurrentScene] = useState<SceneState>('OPENING');
  const [userResponses, setUserResponses] = useState<UserResponses>({
    initialLikeSg: null,
    noClickCount: 0,
    sgLikedTrait: null,
    compliment: '',
    surviveHackathon: null,
    teamWorthIt: null
  });

  // Set initial scene on AudioManager
  useEffect(() => {
    audioManager.onSceneChanged('OPENING');
  }, []);

  // Unlock audio on any initial interaction anywhere on page
  useEffect(() => {
    const handleFirstInteraction = () => {
      audioManager.unlock();
      audioManager.onSceneChanged(currentScene);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, { passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { passive: true });

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [currentScene]);

  // Transition to next scene and trigger authoritative scene audio
  const goToScene = useCallback((scene: SceneState) => {
    setCurrentScene(scene);
    audioManager.onSceneChanged(scene);
  }, []);

  // Determine atmospheric background glow based on active scene
  const getAtmosphereClass = () => {
    switch (currentScene) {
      case 'SG_QUESTION':
        return userResponses.noClickCount > 0 ? 'comedy-glow' : '';
      case 'SG_YES_PATH':
        return 'lounge-glow';
      case 'MEMORY_MONTAGE':
        return 'nostalgic';
      case 'EMOTIONAL':
      case 'ENDING':
        return 'emotional-warmth';
      default:
        return '';
    }
  };

  return (
    <div className="app-viewport">
      {/* Atmosphere Background Aura */}
      <div className={`scene-atmosphere ${getAtmosphereClass()}`} />

      {/* Top Floating App Bar */}
      <header className="top-header">
        <span className="brand-badge">JANSETU</span>
        <MusicControl />
      </header>

      {/* Scene State Machine Controller */}
      {currentScene === 'OPENING' && (
        <OpeningScene
          onComplete={() => goToScene('SG_QUESTION')}
        />
      )}

      {currentScene === 'SG_QUESTION' && (
        <SGQuestionScene
          onYesChosen={(wasInitialYes, noCount) => {
            setUserResponses(prev => ({
              ...prev,
              initialLikeSg: wasInitialYes,
              noClickCount: noCount
            }));
            goToScene('SG_YES_PATH');
          }}
        />
      )}

      {currentScene === 'SG_YES_PATH' && (
        <SgYesPathScene
          wasInitialYes={userResponses.initialLikeSg ?? true}
          onComplete={(trait, compliment) => {
            setUserResponses(prev => ({
              ...prev,
              sgLikedTrait: trait,
              compliment
            }));
            goToScene('TEAM_QUESTIONS');
          }}
        />
      )}

      {currentScene === 'TEAM_QUESTIONS' && (
        <TeamQuestionsScene
          onComplete={(choice) => {
            setUserResponses(prev => ({
              ...prev,
              surviveHackathon: choice
            }));
            goToScene('MEMORY_MONTAGE');
          }}
        />
      )}

      {currentScene === 'MEMORY_MONTAGE' && (
        <MemoryMontageScene
          onComplete={() => goToScene('EMOTIONAL')}
        />
      )}

      {currentScene === 'EMOTIONAL' && (
        <EmotionalMomentScene
          onEmotionalPeak={() => goToScene('COMEDY_CUT')}
        />
      )}

      {currentScene === 'COMEDY_CUT' && (
        <ComedyCutScene
          onProceed={() => goToScene('ENDING')}
        />
      )}

      {currentScene === 'ENDING' && (
        <EndingScene
          userCompliment={userResponses.compliment}
          onReplay={() => {
            setUserResponses({
              initialLikeSg: null,
              noClickCount: 0,
              sgLikedTrait: null,
              compliment: '',
              surviveHackathon: null,
              teamWorthIt: null
            });
            goToScene('OPENING');
          }}
        />
      )}

      {/* Development Audio Debug Indicator */}
      <AudioDebugPanel />
    </div>
  );
};

export default App;
