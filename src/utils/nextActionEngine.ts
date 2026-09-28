import type { Scheme, ApplicationReadinessEvaluation, PrioritizedNextAction } from '../types';

/**
 * Deterministic engine for deriving the highest priority next action for a citizen
 * based on current upstream eligibility and application readiness status.
 *
 * Priority order:
 * 1. Eligibility Blocker (disqualifier detected) -> Review eligibility answers
 * 2. Missing Requirement -> Obtain mandatory document
 * 3. Verification Required -> Confirm institutional / account linkage
 * 4. Fully Ready -> Prepare official portal application package
 */
export function determineNextAction(
  scheme: Scheme,
  readiness: ApplicationReadinessEvaluation
): PrioritizedNextAction {
  // PRIORITY 1: Eligibility Blocker
  if (readiness.blockers.length > 0) {
    const firstBlocker = readiness.blockers[0];
    const conditionName = firstBlocker.title.replace('Eligibility Blocker: ', '');

    return {
      priority: 1,
      priorityLabel: 'PRIORITY 1 — RESOLVE ELIGIBILITY BLOCKER',
      type: 'review_eligibility',
      title: 'Review your eligibility information',
      targetItemTitle: conditionName,
      whyThisComesFirst: `JANSETU detected an eligibility condition (${conditionName}) that appears not satisfied based on your declared profile. Submitting an application on ${scheme.officialPortalName} right now will lead to immediate rejection.`,
      whatToDo: `Review your declared eligibility responses. If you entered details incorrectly (such as income or category), update your answer. If your situation does not match this condition, this scheme cannot be applied for at this time.`,
      instructions: [
        `Return to the Eligibility check screen.`,
        `Inspect the question regarding "${conditionName}".`,
        `If your actual details qualify under published limits, update your response.`,
        `If not eligible, explore alternative schemes suited to your profile on the Scheme Discovery screen.`
      ],
      whatHappensNext: `Once eligibility conditions appear satisfied, JANSETU will unlock document readiness preparation.`,
      designatedAuthorityOrPortal: scheme.officialPortalName,
      primaryCtaLabel: '← Review Eligibility Information',
      primaryCtaPath: '/eligibility',
    };
  }

  // PRIORITY 2: Missing Requirement
  if (readiness.missingItems.length > 0) {
    const firstMissing = readiness.missingItems[0];
    const authority = firstMissing.issuingAuthority || 'Designated Issuing Authority / CSC';

    return {
      priority: 2,
      priorityLabel: 'PRIORITY 2 — OBTAIN MISSING REQUIREMENT',
      type: 'prepare_requirement',
      title: `Get your ${firstMissing.title} ready`,
      targetItemTitle: firstMissing.title,
      whyThisComesFirst: `JANSETU found this requirement is currently missing. Preparing it addresses the primary readiness gap before you continue.`,
      whatToDo: `Acquire or locate this document from ${authority}. ${firstMissing.actionableHint || 'Ensure the certificate is current and unexpired.'}`,
      instructions: [
        `Visit or apply through ${authority} or your nearest Common Service Centre (CSC).`,
        `Ensure all details (name, date of birth, identity number) match your official Aadhaar record exactly.`,
        `Obtain the physical document or certified digital copy (DigiLocker / e-District).`,
        `Once obtained, return to JANSETU and mark this document as Available in Requirements.`
      ],
      whatHappensNext: `Once this document is marked available, JANSETU will re-evaluate your readiness to proceed toward submission.`,
      designatedAuthorityOrPortal: authority,
      primaryCtaLabel: 'View Requirement Checklist →',
      primaryCtaPath: '/requirements',
    };
  }

  // PRIORITY 3: Verification Required
  if (readiness.verificationItems.length > 0) {
    const firstVerify = readiness.verificationItems[0];
    const authority = firstVerify.issuingAuthority || 'Verifying Institution / Bank / Department';
    const cleanTitle = firstVerify.title.replace('Eligibility Confirmation: ', '');

    return {
      priority: 3,
      priorityLabel: 'PRIORITY 3 — CONFIRM VERIFICATION CHECK',
      type: 'verify_information',
      title: `Confirm your ${cleanTitle}`,
      targetItemTitle: cleanTitle,
      whyThisComesFirst: `You have primary documents, but official portals require institutional linkages and valid records to prevent processing stalls or benefit transfer failures.`,
      whatToDo: `Confirm that this requirement is actively validated with ${authority}. ${firstVerify.actionableHint || 'Verify details before proceeding to portal submission.'}`,
      instructions: [
        `Check with ${authority} (e.g., your bank portal, NPCI mapper, or institutional registrar).`,
        `Verify that records and active linkages match the published guidelines for ${scheme.name}.`,
        `If discrepancies exist, resolve them at the branch or office before portal submission.`,
        `Once confirmed, update the check in JANSETU to Ready.`
      ],
      whatHappensNext: `When all verification checks are confirmed, your application will be categorized as Ready to Prepare.`,
      designatedAuthorityOrPortal: authority,
      primaryCtaLabel: 'Check Verification Details →',
      primaryCtaPath: '/requirements',
    };
  }

  // PRIORITY 4: Ready to Prepare / Apply
  return {
    priority: 4,
    priorityLabel: 'PRIORITY 4 — PREPARE OFFICIAL APPLICATION',
    type: 'prepare_application',
    title: 'Prepare your official application package',
    targetItemTitle: `${scheme.name} Application Package`,
    whyThisComesFirst: `All prerequisites and required documents are marked ready based on your declared information. You are in a strong position to assemble your package and submit on the official portal.`,
    whatToDo: `Review your prepared documents and proceed to ${scheme.officialPortalName} to begin official application registration. Keep digital copies ready for upload.`,
    instructions: [
      `Assemble certified scanned copies of all verified documents (PDF/JPEG as specified by portal).`,
      `Ensure your mobile number linked to Aadhaar is active for OTP verification on ${scheme.officialPortalName}.`,
      `Log in or register an applicant account on ${scheme.officialPortalName}.`,
      `Complete the form fields accurately and attach uploaded proofs.`
    ],
    whatHappensNext: `Final verification and eligibility determination are conducted by ${scheme.ministryOrDepartment} upon official submission.`,
    designatedAuthorityOrPortal: `${scheme.officialPortalName} (${scheme.officialPortalUrl})`,
    primaryCtaLabel: 'Proceed to Official Portal Info →',
    primaryCtaPath: '/official-application',
  };
}
