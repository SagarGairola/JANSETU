import type { Scheme, NeedProfile } from '../../types';

export type RelevanceTier = 'DIRECT_MATCH' | 'RELEVANT_ALTERNATIVE' | 'NOT_RELEVANT';

export interface EvaluatedSchemeRelevance {
  scheme: Scheme;
  tier: RelevanceTier;
  relevanceLabel: 'Strong match' | 'Relevant to explore' | 'Not relevant';
  relevanceScore: number;
  whyItFits: string;
  worthChecking: string[];
  signals: {
    domainMatch: boolean;
    goalMatch: boolean;
    beneficiaryMatch: boolean;
    contextMatch: boolean;
  };
}

export interface RelevanceEvaluationResult {
  results: EvaluatedSchemeRelevance[];
  directMatches: EvaluatedSchemeRelevance[];
  alternativeMatches: EvaluatedSchemeRelevance[];
  hasMatches: boolean;
  needProfile: NeedProfile;
}
