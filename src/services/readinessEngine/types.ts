import type {
  OverallEligibilityStatus,
  RuleEvaluationStatus,
} from '../evidenceEngine/types';

export type ReadinessState =
  | 'READY_TO_APPLY'
  | 'ALMOST_READY'
  | 'BLOCKED'
  | 'INSUFFICIENT_INFORMATION';

export type BlockerPriority = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export interface ReadinessBlocker {
  id: string;
  priority: BlockerPriority;
  title: string;
  what: string;
  why: string;
  evidence: string;
  nextAction: string;
  type:
    | 'eligibility_failure'
    | 'missing_information'
    | 'missing_document'
    | 'verification_pending';
  actionCta: {
    label: string;
    path: string;
  };
}

export interface MissingInformationItem {
  field: string;
  label: string;
  reason: string;
  priority: 'critical' | 'high' | 'optional';
  status: RuleEvaluationStatus;
}

export type DocumentReadinessStatus = 'AVAILABLE' | 'MISSING' | 'UNKNOWN' | 'NOT_REQUIRED';

export interface DocumentReadinessItem {
  id: string;
  name: string;
  purpose: string;
  status: DocumentReadinessStatus;
  isMandatory: boolean;
  issuingAuthority?: string;
  notes?: string;
  estimatedTurnaroundDays?: number;
  isHeavyDocument?: boolean;
  frictionTier?: 'instant' | 'low' | 'moderate' | 'high';
}

export interface SchemeAlternative {
  schemeId: string;
  schemeName: string;
  ministryOrDepartment: string;
  whyRelevant: string;
  differenceFromCurrent: string;
  bureaucracyScore?: number;
  frictionLabel?: string;
  immediateApplyMessage?: string;
}

export interface PrimaryNextAction {
  priority: BlockerPriority;
  priorityLabel: string;
  title: string;
  whatToDo: string;
  whyThisComesFirst: string;
  primaryCtaLabel: string;
  primaryCtaPath: string;
  designatedAuthority?: string;
  instructions: string[];
}

export interface ApplicationReadinessV2 {
  schemeId: string;
  schemeName: string;
  eligibilityStatus: OverallEligibilityStatus;
  readinessState: ReadinessState;
  readinessBadgeLabel: string;
  headline: string;
  summaryDiagnostic: string;
  missingInformation: MissingInformationItem[];
  documentReadiness: DocumentReadinessItem[];
  blockers: ReadinessBlocker[];
  alternatives: SchemeAlternative[];
  nextAction: PrimaryNextAction;
  readyItemsCount: number;
  totalRequirementsCount: number;
}
