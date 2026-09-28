import type {
  Scheme,
  EligibilityEvaluationResult,
  ApplicationReadinessEvaluation,
  ReadinessItemDetail,
} from '../types';

export function evaluateReadiness(
  scheme: Scheme,
  eligibilityResult: EligibilityEvaluationResult,
  documentOverrides: Record<string, 'available' | 'missing' | 'needs_verification'> = {}
): ApplicationReadinessEvaluation {
  const blockers: ReadinessItemDetail[] = [];
  const missingItems: ReadinessItemDetail[] = [];
  const verificationItems: ReadinessItemDetail[] = [];
  const readyItems: ReadinessItemDetail[] = [];

  // 1. Check for upstream eligibility blockers
  for (const criterion of eligibilityResult.criteria) {
    if (criterion.status === 'appears_not_satisfied') {
      blockers.push({
        id: `blocker-${criterion.criterionId}`,
        title: `Eligibility Blocker: ${criterion.label}`,
        type: 'eligibility_blocker',
        status: 'blocked',
        purposeOrReason: criterion.explanation,
        actionableHint:
          'Submitting an official application without satisfying this condition will lead to immediate rejection.',
        isMandatory: true,
      });
    } else if (criterion.status === 'needs_verification') {
      verificationItems.push({
        id: `verify-crit-${criterion.criterionId}`,
        title: `Eligibility Confirmation: ${criterion.label}`,
        type: 'verification',
        status: 'needs_verification',
        purposeOrReason: criterion.explanation,
        actionableHint: 'Confirm that your official documents match this scheme requirement.',
        isMandatory: true,
      });
    } else if (criterion.status === 'appears_satisfied') {
      readyItems.push({
        id: `ready-crit-${criterion.criterionId}`,
        title: `Eligibility: ${criterion.label}`,
        type: 'eligibility_blocker',
        status: 'ready',
        purposeOrReason: criterion.explanation,
        actionableHint: 'Condition appears satisfied based on applicant profile information.',
        isMandatory: true,
      });
    }
  }

  // 2. Process required documents
  for (const doc of scheme.requiredDocuments) {
    const effectiveStatus = documentOverrides[doc.id] || doc.currentStatus;

    if (effectiveStatus === 'available') {
      readyItems.push({
        id: doc.id,
        title: doc.name,
        type: 'document',
        status: 'ready',
        purposeOrReason: doc.purpose,
        issuingAuthority: doc.issuingAuthority,
        actionableHint: 'Document confirmed ready for presentation or digital submission.',
        isMandatory: doc.isMandatory,
      });
    } else if (effectiveStatus === 'missing') {
      missingItems.push({
        id: doc.id,
        title: doc.name,
        type: 'document',
        status: 'missing',
        purposeOrReason: doc.purpose,
        issuingAuthority: doc.issuingAuthority,
        actionableHint:
          doc.notes || 'Mandatory document must be acquired before submitting on the portal.',
        isMandatory: doc.isMandatory,
      });
    } else if (effectiveStatus === 'needs_verification') {
      verificationItems.push({
        id: doc.id,
        title: doc.name,
        type: 'verification',
        status: 'needs_verification',
        purposeOrReason: doc.purpose,
        issuingAuthority: doc.issuingAuthority,
        actionableHint:
          doc.notes || 'Document exists but requires linkage, renewal, or institutional validation.',
        isMandatory: doc.isMandatory,
      });
    }
  }

  const totalRequired =
    blockers.length + missingItems.length + verificationItems.length + readyItems.length;
  const totalReady = readyItems.length;

  // Determine categorical readiness state
  if (blockers.length > 0) {
    const names = blockers.map((b) => b.title.replace('Eligibility Blocker: ', '')).join(', ');
    return {
      category: 'blocked_for_now',
      categoryBadgeLabel: 'BLOCKED FOR NOW',
      categoryStatus: 'ineligible',
      headline: `${blockers.length} Disqualifying Blocker${blockers.length > 1 ? 's' : ''} Detected`,
      summaryDiagnostic: `Attempting to apply right now on ${scheme.officialPortalName} will likely result in immediate rejection because ${names} does not meet published guidelines. Resolve this requirement before proceeding.`,
      blockers,
      missingItems,
      verificationItems,
      readyItems,
      totalRequired,
      totalReady,
    };
  }

  if (missingItems.length > 0) {
    const docNames = missingItems.map((m) => m.title).join(', ');
    return {
      category: 'needs_a_few_things',
      categoryBadgeLabel: 'NEEDS A FEW THINGS',
      categoryStatus: 'missing',
      headline: `Missing ${missingItems.length} Mandatory Requirement${missingItems.length > 1 ? 's' : ''}`,
      summaryDiagnostic: `Even though your basic eligibility conditions appear satisfied, attempting to apply right now on ${scheme.officialPortalName} will likely result in rejection or delay because ${docNames} must be obtained first.`,
      blockers,
      missingItems,
      verificationItems,
      readyItems,
      totalRequired,
      totalReady,
    };
  }

  if (verificationItems.length > 0) {
    const firstCheck = verificationItems[0].title;
    return {
      category: 'needs_verification',
      categoryBadgeLabel: 'NEEDS VERIFICATION',
      categoryStatus: 'verification_required',
      headline: `${verificationItems.length} Item${verificationItems.length > 1 ? 's' : ''} Require Verification`,
      summaryDiagnostic: `You have the primary documents, but ${verificationItems.length} requirement${verificationItems.length > 1 ? 's' : ''} (including ${firstCheck}) require confirmation before you submit on ${scheme.officialPortalName} to avoid procedural rejections.`,
      blockers,
      missingItems,
      verificationItems,
      readyItems,
      totalRequired,
      totalReady,
    };
  }

  return {
    category: 'ready_to_prepare',
    categoryBadgeLabel: 'READY TO PREPARE',
    categoryStatus: 'ready',
    headline: 'Ready to Prepare Official Application',
    summaryDiagnostic: `All eligibility prerequisites and required documents are marked ready. You can safely assemble your application package and proceed to the official portal (${scheme.officialPortalName}).`,
    blockers,
    missingItems,
    verificationItems,
    readyItems,
    totalRequired,
    totalReady,
  };
}
