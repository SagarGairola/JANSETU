import type { Scheme } from '../../types';
import type { EligibilityAssessment } from '../evidenceEngine/types';
import type {
  ReadinessBlocker,
  DocumentReadinessItem,
  MissingInformationItem,
} from './types';

export function resolveReadinessBlockers(
  scheme: Scheme,
  eligibilityAssessment: EligibilityAssessment,
  missingInfo: MissingInformationItem[],
  documents: DocumentReadinessItem[]
): ReadinessBlocker[] {
  const blockers: ReadinessBlocker[] = [];

  // ----------------------------------------------------
  // P0: HARD ELIGIBILITY FAILURES
  // ----------------------------------------------------
  for (const rule of eligibilityAssessment.rules) {
    if (rule.status === 'FAILED') {
      blockers.push({
        id: `blocker-p0-${rule.ruleId}`,
        priority: 'P0',
        title: `Eligibility Blocker: ${rule.ruleLabel}`,
        type: 'eligibility_failure',
        what: `Your declared details do not meet published eligibility rules for "${rule.ruleLabel}".`,
        why: `Submitting an official application on ${scheme.officialPortalName} will lead to immediate rejection because ${rule.explanation}`,
        evidence: rule.evidence?.claim || rule.requiredCondition,
        nextAction:
          'Review your declared answers if entered by mistake, or explore relevant alternative schemes suited to your profile.',
        actionCta: {
          label: '← Review Eligibility Information',
          path: '/eligibility',
        },
      });
    }
  }

  // ----------------------------------------------------
  // P1: CRITICAL MISSING INFORMATION NEEDED FOR ELIGIBILITY
  // ----------------------------------------------------
  for (const info of missingInfo) {
    if (info.priority === 'critical') {
      blockers.push({
        id: `blocker-p1-${info.field}`,
        priority: 'P1',
        title: `Information Required: ${info.label}`,
        type: 'missing_information',
        what: `Your ${info.label} has not been provided.`,
        why: info.reason,
        evidence: `Published ${scheme.name} prerequisite criteria.`,
        nextAction: `Provide your ${info.label.toLowerCase()} in the eligibility check to confirm if this scheme fits your situation.`,
        actionCta: {
          label: `Provide ${info.label} →`,
          path: '/eligibility',
        },
      });
    }
  }

  // ----------------------------------------------------
  // P2: CRITICAL MISSING DOCUMENTS
  // ----------------------------------------------------
  for (const doc of documents) {
    if (doc.status === 'MISSING' && doc.isMandatory) {
      const turnaroundText = doc.estimatedTurnaroundDays
        ? ` This typically takes ${doc.estimatedTurnaroundDays === 14 ? '10-15' : doc.estimatedTurnaroundDays} days to acquire.`
        : '';
      const isHeavy = doc.isHeavyDocument;

      blockers.push({
        id: `blocker-p2-${doc.id}`,
        priority: 'P2',
        title: isHeavy ? `Heavy Documentation Blocker: ${doc.name}` : `Missing Mandatory Document: ${doc.name}`,
        type: 'missing_document',
        what: `You match the criteria for ${scheme.name}, BUT you are missing the ${doc.name}.${turnaroundText}`,
        why: `Mandatory prerequisite document required by ${scheme.ministryOrDepartment} (${doc.purpose}).${turnaroundText}`,
        evidence: `Published list of mandatory application attachments on ${scheme.officialPortalName}.`,
        nextAction: `Obtain this document from ${doc.issuingAuthority || 'the designated issuing authority'}, or pivot to an immediate low-friction alternative.`,
        actionCta: {
          label: 'View Requirement Checklist →',
          path: '/requirements',
        },
      });
    }
  }

  // ----------------------------------------------------
  // P3: SUPPORTING VERIFICATION / LINKAGE CHECKS
  // ----------------------------------------------------
  for (const doc of documents) {
    if (doc.status === 'UNKNOWN' && doc.isMandatory) {
      blockers.push({
        id: `blocker-p3-${doc.id}`,
        priority: 'P3',
        title: `Verification Check: ${doc.name}`,
        type: 'verification_pending',
        what: `"${doc.name}" exists but requires institutional linkage or validation.`,
        why: doc.notes || 'Official portals require active validation to avoid benefit transfer stalls.',
        evidence: `Official portal submission guidelines for ${scheme.name}.`,
        nextAction: `Confirm active status with ${doc.issuingAuthority || 'verifying authority'} and mark ready.`,
        actionCta: {
          label: 'Check Verification Details →',
          path: '/requirements',
        },
      });
    }
  }

  // Sort blockers strictly by priority: P0 > P1 > P2 > P3 > P4
  const priorityRank: Record<string, number> = {
    P0: 0,
    P1: 1,
    P2: 2,
    P3: 3,
    P4: 4,
  };

  blockers.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);

  return blockers;
}
