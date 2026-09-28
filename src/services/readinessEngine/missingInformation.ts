import type { EligibilityAssessment } from '../evidenceEngine/types';
import type { MissingInformationItem } from './types';

/**
 * Extracts missing factual information from upstream eligibility rule evaluations.
 * Strictly maintains the boundary: Information is NOT the same as a document requirement.
 */
export function extractMissingInformation(
  assessment: EligibilityAssessment
): MissingInformationItem[] {
  const missingItems: MissingInformationItem[] = [];

  for (const rule of assessment.rules) {
    if (rule.status === 'UNKNOWN') {
      let field = rule.ruleId;
      let label = rule.ruleLabel;
      let reason = rule.explanation || rule.ruleDescription;
      let priority: MissingInformationItem['priority'] = rule.isHardDisqualifier
        ? 'critical'
        : 'high';

      switch (rule.ruleId) {
        case 'crit-income':
          field = 'annualFamilyIncome';
          label = 'Annual Family Income';
          reason =
            'Scheme eligibility requires family income within the published threshold. Declare or verify your income.';
          break;

        case 'crit-enrollment':
          field = 'studentStatus';
          label = 'Educational Enrollment Status';
          reason =
            'Scheme is restricted to actively enrolled students in recognized institutions.';
          break;

        case 'crit-domicile':
          field = 'stateDomicile';
          label = 'State Domicile / Residence';
          reason =
            'State-specific quota eligibility depends on confirmed residence in the applying state.';
          priority = 'high';
          break;

        case 'crit-land':
          field = 'landholdingStatus';
          label = 'Agricultural Landholding';
          reason =
            'Direct income support requires registered cultivable land in state revenue records.';
          break;

        case 'crit-age-biz':
          field = 'applicantAge';
          label = 'Applicant Age';
          reason = 'Applicant must be at least 18 years old at the time of application.';
          break;

        case 'crit-unit-biz':
          field = 'businessUnitStatus';
          label = 'New vs Existing Unit';
          reason =
            'Assistance applies strictly to greenfield new projects, not operational units.';
          break;

        case 'crit-edu-biz':
          field = 'educationalQualification';
          label = 'Educational Qualification';
          reason =
            'Minimum Class 8 pass is required for manufacturing projects exceeding ₹10 Lakh.';
          priority = 'optional';
          break;
      }

      missingItems.push({
        field,
        label,
        reason,
        priority,
        status: 'UNKNOWN',
      });
    }
  }

  return missingItems;
}
