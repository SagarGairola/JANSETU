import type { NeedProfile } from '../../types';
import { QuestionSelector } from './questionSelector';
import { AnswerMerger } from './answerMerger';
import type { ClarificationDecision } from './types';

export class ClarificationEngine {
  private questionSelector = new QuestionSelector();
  private answerMerger = new AnswerMerger();

  evaluateClarification(profile: NeedProfile): ClarificationDecision {
    return this.questionSelector.selectQuestions(profile);
  }

  mergeAnswer(
    profile: NeedProfile,
    field: string,
    answer: string
  ): NeedProfile {
    return this.answerMerger.mergeAnswer(profile, field, answer);
  }
}

let clarificationEngineInstance: ClarificationEngine | null = null;

export function getClarificationEngine(): ClarificationEngine {
  if (!clarificationEngineInstance) {
    clarificationEngineInstance = new ClarificationEngine();
  }
  return clarificationEngineInstance;
}

export function evaluateClarification(profile: NeedProfile): ClarificationDecision {
  return getClarificationEngine().evaluateClarification(profile);
}

export function mergeClarificationAnswer(
  profile: NeedProfile,
  field: string,
  answer: string
): NeedProfile {
  return getClarificationEngine().mergeAnswer(profile, field, answer);
}
