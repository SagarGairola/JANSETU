export type EvidenceType =
  | 'eligibility_rule'
  | 'beneficiary_rule'
  | 'location_rule'
  | 'age_rule'
  | 'income_rule'
  | 'document_rule'
  | 'application_rule'
  | 'exclusion_rule';

export type SourceTrustLevel =
  | 'OFFICIAL_SOURCE'
  | 'VERIFIED_CLAIM'
  | 'UNVERIFIED_CLAIM'
  | 'MISSING_SOURCE';

export type RuleEvaluationStatus = 'SATISFIED' | 'FAILED' | 'UNKNOWN';

export type OverallEligibilityStatus =
  | 'APPEARS_ELIGIBLE'
  | 'NEEDS_VERIFICATION'
  | 'DOES_NOT_APPEAR_ELIGIBLE'
  | 'INSUFFICIENT_INFORMATION';

export interface RuleEvidence {
  sourceUrl?: string;
  sourceTitle?: string;
  authority?: string;
  claim: string;
  evidenceType: EvidenceType;
  trustLevel: SourceTrustLevel;
  verified: boolean;
  notes?: string;
}

export interface EvaluatedSchemeRule {
  ruleId: string;
  ruleLabel: string;
  ruleDescription: string;
  requiredCondition: string;
  status: RuleEvaluationStatus;
  userFact: string | unknown;
  userFactSource: 'need_profile' | 'interactive_answer' | 'unprovided';
  isHardDisqualifier: boolean;
  evidence?: RuleEvidence;
  explanation: string;
}

export interface EligibilityAssessment {
  schemeId: string;
  schemeName: string;
  overallStatus: OverallEligibilityStatus;
  statusBadgeLabel: string;
  headline: string;
  summaryExplanation: string;
  rules: EvaluatedSchemeRule[];
  satisfiedCount: number;
  failedCount: number;
  unknownCount: number;
  evidenceSummary: {
    officialSourcesCount: number;
    verifiedClaimsCount: number;
    unverifiedClaimsCount: number;
    missingSourcesCount: number;
  };
}
