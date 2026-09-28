import type { Scheme } from '../../types';
import type { ReadinessBlocker, PrimaryNextAction } from './types';

export function resolveSingleNextAction(
  scheme: Scheme,
  blockers: ReadinessBlocker[]
): PrimaryNextAction {
  // If there are unresolved blockers, select the top blocker strictly by priority
  if (blockers.length > 0) {
    const topBlocker = blockers[0];

    switch (topBlocker.priority) {
      case 'P0':
        return {
          priority: 'P0',
          priorityLabel: 'PRIORITY P0 — RESOLVE ELIGIBILITY BLOCKER',
          title: 'Review your eligibility information',
          whatToDo:
            'Review your declared answers if entered by mistake, or explore alternative schemes suited to your profile.',
          whyThisComesFirst: topBlocker.why,
          primaryCtaLabel: topBlocker.actionCta.label,
          primaryCtaPath: topBlocker.actionCta.path,
          designatedAuthority: scheme.officialPortalName,
          instructions: [
            'Return to the Eligibility check screen.',
            `Review the condition regarding "${topBlocker.title.replace('Eligibility Blocker: ', '')}".`,
            'If your situation does not match this condition, explore alternative schemes on the Scheme Discovery screen.',
          ],
        };

      case 'P1':
        return {
          priority: 'P1',
          priorityLabel: 'PRIORITY P1 — PROVIDE MISSING INFORMATION',
          title: topBlocker.title,
          whatToDo: topBlocker.nextAction,
          whyThisComesFirst: topBlocker.why,
          primaryCtaLabel: topBlocker.actionCta.label,
          primaryCtaPath: topBlocker.actionCta.path,
          designatedAuthority: scheme.ministryOrDepartment,
          instructions: [
            'Open the Eligibility check screen.',
            'Declare or update the missing detail to enable condition evaluation.',
            'Once provided, JANSETU will determine your application readiness.',
          ],
        };

      case 'P2':
        return {
          priority: 'P2',
          priorityLabel: 'PRIORITY P2 — OBTAIN MISSING REQUIREMENT',
          title: `Get your ${topBlocker.title.replace('Missing Mandatory Document: ', '')} ready`,
          whatToDo: topBlocker.nextAction,
          whyThisComesFirst: topBlocker.why,
          primaryCtaLabel: topBlocker.actionCta.label,
          primaryCtaPath: topBlocker.actionCta.path,
          designatedAuthority: scheme.ministryOrDepartment,
          instructions: [
            'Check the Requirements checklist for exact issuing authority and acceptable formats.',
            'Apply through your nearest Common Service Centre (CSC) or state portal if needed.',
            'Once obtained, mark this document as Available in the Requirements checklist.',
          ],
        };

      case 'P3':
        return {
          priority: 'P3',
          priorityLabel: 'PRIORITY P3 — CONFIRM VERIFICATION CHECK',
          title: `Confirm your ${topBlocker.title.replace('Verification Check: ', '')}`,
          whatToDo: topBlocker.nextAction,
          whyThisComesFirst: topBlocker.why,
          primaryCtaLabel: topBlocker.actionCta.label,
          primaryCtaPath: topBlocker.actionCta.path,
          designatedAuthority: scheme.officialPortalName,
          instructions: [
            'Check with the verifying institution (e.g. bank, NPCI mapper, or registrar).',
            'Verify that records and active linkages match the published guidelines.',
            'Once confirmed, mark the check as Ready in Requirements.',
          ],
        };

      case 'P4':
      default:
        return {
          priority: 'P4',
          priorityLabel: 'PRIORITY P4 — REVIEW SUPPORTING DETAILS',
          title: topBlocker.title,
          whatToDo: topBlocker.nextAction,
          whyThisComesFirst: topBlocker.why,
          primaryCtaLabel: topBlocker.actionCta.label,
          primaryCtaPath: topBlocker.actionCta.path,
          designatedAuthority: scheme.officialPortalName,
          instructions: ['Review supporting details on the Requirements screen.'],
        };
    }
  }

  // READY TO APPLY (Zero unresolved blockers)
  return {
    priority: 'P4',
    priorityLabel: 'PRIORITY P4 — PREPARE OFFICIAL APPLICATION',
    title: 'Prepare your official application package',
    whatToDo: `Review your prepared documents and proceed to ${scheme.officialPortalName} to begin official application registration. Keep digital copies ready for upload.`,
    whyThisComesFirst:
      'All prerequisites and required documents are marked ready based on your declared information. You are in a strong position to assemble your package and submit on the official portal.',
    primaryCtaLabel: 'Proceed to Official Portal Info →',
    primaryCtaPath: '/official-application',
    designatedAuthority: `${scheme.officialPortalName} (${scheme.officialPortalUrl})`,
    instructions: [
      'Assemble certified scanned copies of all verified documents.',
      `Ensure your mobile number linked to Aadhaar is active for OTP verification on ${scheme.officialPortalName}.`,
      `Log in or register on ${scheme.officialPortalName}.`,
      'Complete the form fields accurately and attach uploaded proofs.',
    ],
  };
}
