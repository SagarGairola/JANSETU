import { createContext } from 'react';
import type { Scheme, CitizenProfileAnswers, NeedProfile } from '../types';

export interface DemoContextType {
  userNeed: string;
  setUserNeed: (need: string) => void;
  selectedSchemeId: string;
  setSelectedSchemeId: (id: string) => void;
  schemes: Scheme[];
  currentScheme: Scheme;
  answers: CitizenProfileAnswers;
  updateAnswer: (field: keyof CitizenProfileAnswers, value: string) => void;
  setSampleApplicant: () => void;
  blockerInput: string;
  setBlockerInput: (input: string) => void;
  documentStatuses: Record<string, Record<string, 'available' | 'missing' | 'needs_verification'>>;
  updateDocumentStatus: (docId: string, status: 'available' | 'missing' | 'needs_verification') => void;
  resetDocumentStatuses: () => void;
  resetDemo: () => void;
  needProfile: NeedProfile;
  clarificationAnswers: Record<string, string>;
  submitClarificationAnswer: (field: string, answer: string) => void;
}

export const DemoContext = createContext<DemoContextType | undefined>(undefined);
