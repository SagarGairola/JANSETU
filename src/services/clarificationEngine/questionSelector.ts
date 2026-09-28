import type { NeedProfile } from '../../types';
import type { ClarificationDecision, ClarificationQuestion } from './types';

export class QuestionSelector {
  /**
   * Evaluates the citizen's NeedProfile and selects at most 1–2 critical or high-value questions.
   * If the need is sufficiently understood for initial scheme discovery, returns needsClarification: false.
   */
  selectQuestions(profile: NeedProfile): ClarificationDecision {
    const isUnknownDomain =
      !profile.domains ||
      profile.domains.length === 0 ||
      profile.domains.includes('unknown');

    // 1. CRITICAL: Purpose is unknown or purely ambiguous
    if (isUnknownDomain) {
      let promptText = 'What specific type of government support are you looking for?';
      if (profile.extractedProfile.targetFinancialAmount) {
        promptText = `What do you plan to use the ₹${profile.extractedProfile.targetFinancialAmount.toLocaleString('en-IN')} support for?`;
      }

      const purposeQuestion: ClarificationQuestion = {
        id: 'q-purpose',
        field: 'purpose_of_support',
        question: promptText,
        priority: 'critical',
        reason:
          'Government schemes are structured around specific citizen needs such as education, farming, business, or welfare.',
        affects: ['domain_relevance', 'scheme_discovery'],
        suggestedInputType: 'select',
        options: [
          'Education / College Studies',
          'Farming / Agriculture Support',
          'Starting or Expanding a Business',
          'Job Skills / Employment',
          'Healthcare / Medical Treatment',
          'Housing / Home Construction',
          'Other Support',
        ],
      };

      return {
        needsClarification: true,
        questions: [purposeQuestion],
        reason: 'Critical information missing',
      };
    }

    // 2. Need is sufficiently understood for initial scheme discovery
    // Under the Minimum Question Rule, we do NOT block the citizen with questionnaires
    // when a concrete domain and goal direction already exist.
    return {
      needsClarification: false,
      questions: [],
      reason: 'Need is sufficiently understood',
    };
  }
}
