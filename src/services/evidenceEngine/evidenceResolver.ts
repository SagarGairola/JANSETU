import type { Scheme, EligibilityCriterion } from '../../types';
import type { RuleEvidence, EvidenceType, SourceTrustLevel } from './types';

/**
 * Maps a scheme's criterion ID to its specific official evidence classification.
 */
function classifyEvidenceType(criterionId: string): EvidenceType {
  switch (criterionId) {
    case 'crit-income':
      return 'income_rule';
    case 'crit-enrollment':
      return 'beneficiary_rule';
    case 'crit-domicile':
      return 'location_rule';
    case 'crit-land':
      return 'beneficiary_rule';
    case 'crit-ekyc':
      return 'application_rule';
    case 'crit-age-biz':
      return 'age_rule';
    case 'crit-unit-biz':
      return 'eligibility_rule';
    case 'crit-edu-biz':
      return 'eligibility_rule';
    default:
      return 'eligibility_rule';
  }
}

/**
 * Resolves truthful source evidence for a criterion without fabricating dates or URLs.
 */
export function resolveCriterionEvidence(
  scheme: Scheme,
  criterion: EligibilityCriterion
): RuleEvidence {
  const primarySource = scheme.sources && scheme.sources.length > 0 ? scheme.sources[0] : undefined;
  const evidenceType = classifyEvidenceType(criterion.id);

  if (!primarySource && !scheme.officialPortalUrl) {
    return {
      claim: criterion.description,
      evidenceType,
      trustLevel: 'MISSING_SOURCE' as SourceTrustLevel,
      verified: false,
      notes: 'No official source metadata is registered for this scheme criterion.',
    };
  }

  const sourceUrl = primarySource?.url || scheme.officialPortalUrl;
  const sourceTitle = primarySource?.title || scheme.officialPortalName || 'Official Portal Guidelines';
  const authority = primarySource?.authority || scheme.ministryOrDepartment;
  const isOfficial = primarySource?.official ?? true;

  const trustLevel: SourceTrustLevel = isOfficial ? 'OFFICIAL_SOURCE' : 'UNVERIFIED_CLAIM';

  return {
    sourceUrl,
    sourceTitle,
    authority,
    claim: criterion.description,
    evidenceType,
    trustLevel,
    verified: isOfficial,
    notes: `Derived from official publications of ${authority}.`,
  };
}
