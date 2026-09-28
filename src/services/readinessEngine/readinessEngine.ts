import type { Scheme } from '../../types';
import type { EligibilityAssessment } from '../evidenceEngine/types';
import type { ApplicationReadinessV2, ReadinessState } from './types';
import { extractMissingInformation } from './missingInformation';
import { evaluateDocumentReadiness } from './documentReadiness';
import { findEligibleAlternatives } from './alternativeEngine';
import { resolveReadinessBlockers } from './blockerResolver';
import { resolveSingleNextAction } from './nextActionResolver';

export interface ReadinessEvaluationInput {
  scheme: Scheme;
  eligibilityAssessment: EligibilityAssessment;
  documentOverrides?: Record<string, 'available' | 'missing' | 'needs_verification'>;
  allCatalogueSchemes?: Scheme[];
}

export function evaluateApplicationReadinessV2(
  input: ReadinessEvaluationInput
): ApplicationReadinessV2 {
  const {
    scheme,
    eligibilityAssessment,
    documentOverrides = {},
    allCatalogueSchemes = [],
  } = input;

  // 1. Extract missing factual information from eligibility evaluation
  const missingInformation = extractMissingInformation(eligibilityAssessment);

  // 2. Evaluate document readiness based on required documents and declared status
  const documentReadiness = evaluateDocumentReadiness(scheme, documentOverrides);

  // 3. Resolve prioritized blockers (P0 to P4)
  const blockers = resolveReadinessBlockers(
    scheme,
    eligibilityAssessment,
    missingInformation,
    documentReadiness
  );

  // 4. Resolve alternative schemes if blocked
  const alternatives =
    blockers.some((b) => b.priority === 'P0') ||
    eligibilityAssessment.overallStatus === 'DOES_NOT_APPEAR_ELIGIBLE'
      ? findEligibleAlternatives(scheme, allCatalogueSchemes)
      : [];

  // 5. Determine the single highest priority next action
  const nextAction = resolveSingleNextAction(scheme, blockers);

  // 6. Aggregate categorical readiness state
  let readinessState: ReadinessState;
  let readinessBadgeLabel: string;
  let headline: string;
  let summaryDiagnostic: string;

  const hasP0Blocker = blockers.some((b) => b.priority === 'P0');
  const hasP1Blocker = blockers.some((b) => b.priority === 'P1');
  const hasP2Blocker = blockers.some((b) => b.priority === 'P2');
  const hasP3Blocker = blockers.some((b) => b.priority === 'P3');

  if (hasP0Blocker || eligibilityAssessment.overallStatus === 'DOES_NOT_APPEAR_ELIGIBLE') {
    readinessState = 'BLOCKED';
    readinessBadgeLabel = 'BLOCKED FOR NOW';
    headline = 'Application Readiness Blocked by Eligibility Condition';
    summaryDiagnostic =
      'Application readiness is blocked because a published eligibility condition does not currently match your information. Review the specific reasons or explore relevant alternatives.';
  } else if (hasP1Blocker || eligibilityAssessment.overallStatus === 'INSUFFICIENT_INFORMATION') {
    readinessState = 'INSUFFICIENT_INFORMATION';
    readinessBadgeLabel = 'INFORMATION NEEDED';
    headline = 'Missing Information Needed to Check Readiness';
    summaryDiagnostic =
      'Before evaluating application readiness, JANSETU needs key details (such as annual family income) to verify basic scheme conditions.';
  } else if (hasP2Blocker || hasP3Blocker) {
    readinessState = 'ALMOST_READY';
    readinessBadgeLabel = 'ALMOST READY';
    const missingDocsCount = documentReadiness.filter((d) => d.status === 'MISSING').length;
    headline = missingDocsCount > 0
      ? `Missing ${missingDocsCount} Mandatory Document${missingDocsCount > 1 ? 's' : ''}`
      : 'Requirements Require Verification';
    summaryDiagnostic =
      'Your eligibility conditions appear satisfied, but required documents or institutional verifications must be addressed before applying on the official portal.';
  } else {
    readinessState = 'READY_TO_APPLY';
    readinessBadgeLabel = 'READY TO APPLY';
    headline = 'Ready to Prepare Official Application';
    summaryDiagnostic =
      'All eligibility prerequisites and required documents are marked ready. You can safely assemble your application package and proceed to the official portal.';
  }

  const readyItemsCount = documentReadiness.filter((d) => d.status === 'AVAILABLE').length;
  const totalRequirementsCount =
    eligibilityAssessment.rules.length + documentReadiness.length;

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    eligibilityStatus: eligibilityAssessment.overallStatus,
    readinessState,
    readinessBadgeLabel,
    headline,
    summaryDiagnostic,
    missingInformation,
    documentReadiness,
    blockers,
    alternatives,
    nextAction,
    readyItemsCount,
    totalRequirementsCount,
  };
}
