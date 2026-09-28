export type ReadinessStatus =
  | 'ready'
  | 'missing'
  | 'verification_required'
  | 'ineligible';

export type CriterionAssessmentStatus =
  | 'appears_satisfied'
  | 'needs_verification'
  | 'appears_not_satisfied';

export type ReadinessCategory =
  | 'ready_to_prepare'
  | 'needs_a_few_things'
  | 'needs_verification'
  | 'blocked_for_now';

export interface ReadinessItemDetail {
  id: string;
  title: string;
  type: 'document' | 'eligibility_blocker' | 'verification';
  status: 'ready' | 'missing' | 'needs_verification' | 'blocked';
  purposeOrReason: string;
  issuingAuthority?: string;
  actionableHint?: string;
  isMandatory?: boolean;
}

export interface ApplicationReadinessEvaluation {
  category: ReadinessCategory;
  categoryBadgeLabel: string;
  categoryStatus: ReadinessStatus;
  headline: string;
  summaryDiagnostic: string;
  blockers: ReadinessItemDetail[];
  missingItems: ReadinessItemDetail[];
  verificationItems: ReadinessItemDetail[];
  readyItems: ReadinessItemDetail[];
  totalRequired: number;
  totalReady: number;
}

export interface EvaluatedCriterion {
  criterionId: string;
  label: string;
  description: string;
  status: CriterionAssessmentStatus;
  explanation: string;
}

export interface EligibilityEvaluationResult {
  criteria: EvaluatedCriterion[];
  satisfiedCount: number;
  unclearCount: number;
  unsatisfiedCount: number;
  overallEligibilitySummary: 'likely_eligible_with_verification' | 'issues_detected' | 'insufficient_data';
  summaryHeadline: string;
  summaryExplanation: string;
}

export interface CitizenProfileAnswers {
  // Education
  annualIncome?: string;
  isEnrolledInCollege?: string;
  isDomicileResident?: string;

  // Agriculture
  hasLandholding?: string;
  hasCompletedEkyc?: string;

  // Business
  isAge18Plus?: string;
  isNewUnit?: string;
  educationQualification?: string;
}

export interface EligibilityCriterion {
  id: string;
  label: string;
  description: string;
  isSatisfied: boolean | 'unclear' | 'not_satisfied';
  rationale?: string;
}

export interface DocumentRequirement {
  id: string;
  name: string;
  purpose: string;
  isMandatory: boolean;
  issuingAuthority?: string;
  currentStatus: 'available' | 'missing' | 'needs_verification';
  notes?: string;
  estimatedTurnaroundDays?: number;
  isHeavyDocument?: boolean;
  frictionTier?: 'instant' | 'low' | 'moderate' | 'high';
}

export interface ReadinessItem {
  id: string;
  title: string;
  category: 'document' | 'eligibility' | 'verification';
  status: ReadinessStatus;
  description: string;
  actionableHint?: string;
  officialRequirementSource?: string;
}

export interface NextAction {
  stepNumber: number;
  title: string;
  summary: string;
  instructions: string[];
  designatedPortalOrOffice: string;
  estimatedTime?: string;
}

export type NextActionPriority = 1 | 2 | 3 | 4;

export type NextActionType =
  | 'review_eligibility'
  | 'prepare_requirement'
  | 'verify_information'
  | 'prepare_application';

export interface PrioritizedNextAction {
  priority: NextActionPriority;
  priorityLabel: string;
  type: NextActionType;
  title: string;
  targetItemTitle?: string;
  whyThisComesFirst: string;
  whatToDo: string;
  instructions: string[];
  whatHappensNext: string;
  designatedAuthorityOrPortal?: string;
  primaryCtaLabel: string;
  primaryCtaPath: string;
}

export interface Scheme {
  id: string;
  name: string;
  ministryOrDepartment: string;
  category:
    | 'education'
    | 'agriculture'
    | 'healthcare'
    | 'business'
    | 'social_welfare'
    | 'social_security'
    | 'housing'
    | 'employment'
    | 'skill_development'
    | 'women'
    | 'disability'
    | 'senior_citizen';
  shortPurpose: string;
  benefitSummary: string;
  targetAudience: string;
  officialPortalUrl: string;
  officialPortalName: string;
  bureaucracyScore: number;
  frictionLabel?: 'Fast to Apply' | 'Moderate Documentation' | 'High Documentation Required';
  eligibilityCriteria: EligibilityCriterion[];
  requiredDocuments: DocumentRequirement[];
  readinessSummary: {
    readinessScorePercentage: number;
    overallStatus: ReadinessStatus;
    headline: string;
  };
  whyRelevantDefault?: string;
  worthCheckingPoints?: string[];
  sources?: SchemeSource[];
  coverage?: string;
  goals?: string[];
  beneficiaryProfile?: Record<string, unknown>;
}

export type VerificationStatus = 'VERIFIED' | 'NEEDS_VERIFICATION' | 'UNAVAILABLE';

export interface SchemeSource {
  url: string;
  title: string;
  authority?: string;
  sourceType: 'official_portal' | 'gazette' | 'ministry_guideline' | 'other';
  official: boolean;
  lastVerified?: string;
  notes?: string;
}

export interface Evidence {
  claim: string;
  source?: SchemeSource;
  verificationStatus: VerificationStatus;
}

export interface UserInformation {
  statedNeed: string;
  name?: string;
  category?: string;
  annualFamilyIncome?: number;
  studentStatus?: string;
  residenceState?: string;
  documentsDeclared: Record<string, 'available' | 'missing' | 'needs_verification'>;
}

export interface DemoState {
  userNeed: string;
  selectedSchemeId: string;
  userInfo: UserInformation;
  simulationBlockerText?: string;
}

export * from './need';
