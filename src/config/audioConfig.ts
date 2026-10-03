import type { SceneState } from '../types/experience';

export type TrackId =
  | 'openingMystery'
  | 'sgPlayful'
  | 'noPrank'
  | 'yesWarm'
  | 'teamWarm'
  | 'memoryNostalgia'
  | 'emotionalMinimal'
  | 'resultSilence'
  | 'reflectionWarm'
  | 'finalCredits';

export interface SoundtrackTrack {
  id: TrackId;
  title: string;
  mood: string;
  volume: number;
  fadeInDuration: number;
  fadeOutDuration: number;
}

export const SOUNDTRACK_REGISTRY: Record<TrackId, SoundtrackTrack> = {
  openingMystery: {
    id: 'openingMystery',
    title: 'Opening Mystery',
    mood: 'Atmospheric curiosity drone in F#',
    volume: 0.28,
    fadeInDuration: 1.0,
    fadeOutDuration: 0.8
  },
  sgPlayful: {
    id: 'sgPlayful',
    title: 'The Teammate Question',
    mood: 'Playful walking pizzicato bass & light marimba',
    volume: 0.30,
    fadeInDuration: 0.7,
    fadeOutDuration: 0.6
  },
  noPrank: {
    id: 'noPrank',
    title: 'NO Button Chase',
    mood: 'Energetic, funny, bouncy comedic chase',
    volume: 0.32,
    fadeInDuration: 0.3,
    fadeOutDuration: 0.6
  },
  yesWarm: {
    id: 'yesWarm',
    title: 'Look At You Being Nice',
    mood: 'Warm sweet acoustic Rhodes chords',
    volume: 0.28,
    fadeInDuration: 0.8,
    fadeOutDuration: 0.8
  },
  teamWarm: {
    id: 'teamWarm',
    title: 'Through Every Conflict',
    mood: 'Conversational warm team Rhodes chords',
    volume: 0.28,
    fadeInDuration: 0.8,
    fadeOutDuration: 0.8
  },
  memoryNostalgia: {
    id: 'memoryNostalgia',
    title: 'Memory Montage & Submission',
    mood: 'Cinematic rising momentum sawtooth drone in A',
    volume: 0.32,
    fadeInDuration: 0.6,
    fadeOutDuration: 0.8
  },
  emotionalMinimal: {
    id: 'emotionalMinimal',
    title: 'We Built This Together',
    mood: 'Sincere, quiet, heartfelt breath pads',
    volume: 0.26,
    fadeInDuration: 1.2,
    fadeOutDuration: 0.6
  },
  resultSilence: {
    id: 'resultSilence',
    title: 'Intentional Silence',
    mood: 'Pure silence for result reveal & comedy shock',
    volume: 0,
    fadeInDuration: 0,
    fadeOutDuration: 0.05
  },
  reflectionWarm: {
    id: 'reflectionWarm',
    title: 'That Part Is Ours',
    mood: 'Soft sincere warm acoustic pads',
    volume: 0.26,
    fadeInDuration: 1.2,
    fadeOutDuration: 0.8
  },
  finalCredits: {
    id: 'finalCredits',
    title: 'It Made It Here To Us',
    mood: 'Warm, uplifting, nostalgic D Major credits',
    volume: 0.32,
    fadeInDuration: 1.0,
    fadeOutDuration: 2.5
  }
};

/**
 * Mapping from experience scene to authoritative soundtrack track.
 */
export const SCENE_MUSIC_MAP: Record<SceneState, TrackId> = {
  OPENING: 'openingMystery',
  SG_QUESTION: 'sgPlayful',
  SG_YES_PATH: 'yesWarm',
  TEAM_QUESTIONS: 'teamWarm',
  MEMORY_MONTAGE: 'memoryNostalgia',
  EMOTIONAL: 'emotionalMinimal',
  COMEDY_CUT: 'resultSilence',
  ENDING: 'memoryNostalgia'
};

export const audioConfig = {
  masterVolume: 0.85,
  defaultBgmVolume: 0.30,
  defaultSfxVolume: 0.45,
  enableDebugLogs: true
};
