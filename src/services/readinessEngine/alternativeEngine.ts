import type { Scheme } from '../../types';
import type { SchemeAlternative } from './types';

export function findEligibleAlternatives(
  blockedScheme: Scheme,
  allSchemes: Scheme[],
  _userCategory?: string
): SchemeAlternative[] {
  const alternatives: SchemeAlternative[] = [];

  // Filter schemes in the EXACT same category/need domain only
  const categoryCandidates = allSchemes
    .filter((s) => s.id !== blockedScheme.id && s.category === blockedScheme.category)
    // Sort by lowest bureaucracy friction score first (Fast to apply comes first)
    .sort((a, b) => (a.bureaucracyScore ?? 5) - (b.bureaucracyScore ?? 5));

  for (const candidate of categoryCandidates) {
    const isPmegpMudraPair =
      blockedScheme.id === 'pmegp-micro-enterprise' && candidate.id === 'pm-mudra-shishu';

    const immediateApplyMessage = isPmegpMudraPair
      ? `While you acquire that document, here is PM MUDRA Shishu that you can apply for TODAY with your current documents.`
      : `While you work on obtaining missing documents, here is ${candidate.name} which requires lower documentation (Friction: ${candidate.bureaucracyScore ?? 3}/10).`;

    alternatives.push({
      schemeId: candidate.id,
      schemeName: candidate.name,
      ministryOrDepartment: candidate.ministryOrDepartment,
      whyRelevant: isPmegpMudraPair
        ? `Provides up to ₹50,000 collateral-free micro-enterprise funding with zero EDP certificate required.`
        : `Provides support in ${blockedScheme.category} without the heavy documentation barrier that blocked your application.`,
      differenceFromCurrent:
        candidate.benefitSummary || 'Alternative scheme option in the same category.',
      bureaucracyScore: candidate.bureaucracyScore,
      frictionLabel: candidate.frictionLabel,
      immediateApplyMessage,
    });
  }

  // Civic rule: If no genuine same-domain alternative exists in connected sources,
  // return empty array. NEVER force unrelated schemes (e.g. no farming/business for students).
  return alternatives;
}
