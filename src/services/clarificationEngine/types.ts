import type { QuestionPriority } from '../../types';

export interface ClarificationQuestion {
  id: string;
  field: string;
  question: string;
  priority: QuestionPriority;
  reason: string;
  affects: string[];
  suggestedInputType?: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
  targetDomain?: string;
}

export type ClarificationDecisionReason =
  | 'Need is sufficiently understood'
  | 'Critical information missing'
  | 'High-value information missing';

export interface ClarificationDecision {
  needsClarification: boolean;
  questions: ClarificationQuestion[];
  reason: ClarificationDecisionReason;
}
