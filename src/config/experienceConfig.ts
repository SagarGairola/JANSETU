/**
 * =========================================================================
 * SG TEAM EXPERIENCE - CENTRAL CONFIGURATION (V3 SUBMISSION EXPERIENCE)
 * =========================================================================
 * Clean configuration for feature flags, timings, and audio.
 */
export const experienceConfig = {
  // Feature Flags
  SHOW_MUSIC_TOGGLE: true,
  ENABLE_NO_PRANK: true,
  ENABLE_HAPTICS: true,

  // Timing Configurations (in milliseconds)
  timings: {
    // Opening: deliberate cinematic pauses (total ~14s)
    openingLineDelay: 1350,
    openingFinalPauseDelay: 2200,

    // Team Questions: pacing for reaction to land
    teamReactionDelay: 2200,

    // Memory Montage & Payoff: rapid kinetic cuts then breathing room (~20s)
    montageWordInterval: 320,
    montagePauseDelay: 1400,
    montagePayoffLineDelay: 1800,

    // Emotional: slow, minimal hold (total ~25s)
    emotionalIntroDelay: 1500,
    emotionalJourneyDelay: 1600,
    emotionalClimaxDelay: 2200,
    emotionalBadgeHold: 3500,

    // Comedy Cut: comedic snap (~6s)
    comedyLineDelay: 1200,

    // Final Ending: V6 real result, silence, reflection & credits sequence
    endingSubmissionHoldDelay: 2200,
    endingResultIntroDelay: 1600,
    endingSilenceDuration: 2600,
    endingShiftDelay: 1800,
    endingCallbackWordInterval: 520,
    endingReflectionLineDelay: 1500,
    endingComedyDelay: 1500,
    endingWordInterval: 680,
    endingFinalRevealDelay: 2800,
  },

  // Prank Mechanics Tuning
  noPrank: {
    scaleShrinkStep: 0.14,
    minScale: 0.44,
    yesScaleGrowthStep: 0.10,
    maxYesScale: 1.45,
    clicksBeforeMoving: 4,
    maxMovingCatches: 4,
    movementPauseMs: 650,
  },

  // Audio configuration & volume levels
  audio: {
    masterVolume: 0.85,
    bgmVolume: 0.50,
    sfxVolume: 0.70,
  }
};
