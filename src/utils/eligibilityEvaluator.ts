import type {
  Scheme,
  CitizenProfileAnswers,
  EligibilityEvaluationResult,
  EvaluatedCriterion,
} from '../types';

export const SAMPLE_APPLICANT_PRESETS: Record<string, CitizenProfileAnswers> = {
  'post-matric-scholarship': {
    annualIncome: 'under_250k',
    isEnrolledInCollege: 'yes',
    isDomicileResident: 'unclear',
  },
  'pm-kisan': {
    hasLandholding: 'yes',
    hasCompletedEkyc: 'unclear',
  },
  'pmegp-micro-enterprise': {
    isAge18Plus: 'yes',
    isNewUnit: 'yes',
    educationQualification: 'class_8_plus',
  },
};

export function evaluateEligibility(
  scheme: Scheme,
  answers: CitizenProfileAnswers
): EligibilityEvaluationResult {
  const evaluatedCriteria: EvaluatedCriterion[] = [];

  for (const criterion of scheme.eligibilityCriteria) {
    let status: EvaluatedCriterion['status'] = 'needs_verification';
    let explanation = 'This condition cannot be evaluated from the details provided.';

    switch (criterion.id) {
      // Post-Matric Scholarship
      case 'crit-income':
        if (answers.annualIncome === 'under_250k') {
          status = 'appears_satisfied';
          explanation = 'Declared annual family income is within the ₹2,50,000 threshold for this demo.';
        } else if (answers.annualIncome === 'over_250k') {
          status = 'appears_not_satisfied';
          explanation = 'Reported family income exceeds the ₹2,50,000 published scheme threshold.';
        } else {
          status = 'needs_verification';
          explanation = 'Annual income details have not been selected yet.';
        }
        break;

      case 'crit-enrollment':
        if (answers.isEnrolledInCollege === 'yes') {
          status = 'appears_satisfied';
          explanation = 'You indicated active enrollment in an eligible post-matric institution.';
        } else if (answers.isEnrolledInCollege === 'no') {
          status = 'appears_not_satisfied';
          explanation = 'Current post-matric college enrollment is required for this scholarship.';
        } else {
          status = 'needs_verification';
          explanation = 'Institutional enrollment status requires confirmation.';
        }
        break;

      case 'crit-domicile':
        if (answers.isDomicileResident === 'yes') {
          status = 'appears_satisfied';
          explanation = 'Declared as a bona fide domicile resident of the applying state/UT.';
        } else if (answers.isDomicileResident === 'no') {
          status = 'appears_not_satisfied';
          explanation = 'Applicant does not hold domicile residency in the applying state.';
        } else {
          status = 'needs_verification';
          explanation = 'State domicile records cannot be confirmed from the details provided.';
        }
        break;

      // PM-KISAN
      case 'crit-land':
        if (answers.hasLandholding === 'yes') {
          status = 'appears_satisfied';
          explanation = 'You indicated cultivable landholding in family revenue records.';
        } else if (answers.hasLandholding === 'no') {
          status = 'appears_not_satisfied';
          explanation = 'Cultivable agricultural landholding is a mandatory scheme prerequisite.';
        } else {
          status = 'needs_verification';
          explanation = 'Land parcel ownership has not been declared.';
        }
        break;

      case 'crit-ekyc':
        if (answers.hasCompletedEkyc === 'yes') {
          status = 'appears_satisfied';
          explanation = 'Aadhaar biometric or OTP e-KYC declared as completed.';
        } else if (answers.hasCompletedEkyc === 'no') {
          status = 'appears_not_satisfied';
          explanation = 'Biometric or OTP-based e-KYC has not been completed on the PM-KISAN portal.';
        } else {
          status = 'needs_verification';
          explanation = 'Aadhaar e-KYC status requires official portal verification.';
        }
        break;

      // PMEGP
      case 'crit-age-biz':
        if (answers.isAge18Plus === 'yes') {
          status = 'appears_satisfied';
          explanation = 'Applicant meets the minimum legal age requirement (18+ years).';
        } else if (answers.isAge18Plus === 'no') {
          status = 'appears_not_satisfied';
          explanation = 'Applicant must be at least 18 years of age at the time of application.';
        } else {
          status = 'needs_verification';
          explanation = 'Applicant age has not been specified.';
        }
        break;

      case 'crit-unit-biz':
        if (answers.isNewUnit === 'yes') {
          status = 'appears_satisfied';
          explanation = 'Assistance requested for establishing a new greenfield micro-venture.';
        } else if (answers.isNewUnit === 'no') {
          status = 'appears_not_satisfied';
          explanation = 'PMEGP subsidies apply strictly to new projects, not existing units.';
        } else {
          status = 'needs_verification';
          explanation = 'New unit establishment status needs verification.';
        }
        break;

      case 'crit-edu-biz':
        if (answers.educationQualification === 'class_8_plus') {
          status = 'appears_satisfied';
          explanation = 'Satisfies educational qualification criteria (Class 8 pass or higher).';
        } else if (answers.educationQualification === 'below_class_8') {
          status = 'needs_verification';
          explanation = 'Allowed for service units < ₹5L or manufacturing < ₹10L; otherwise requires Class 8 certificate.';
        } else {
          status = 'needs_verification';
          explanation = 'Highest educational qualification needs to be selected.';
        }
        break;

      default:
        status = criterion.isSatisfied === true ? 'appears_satisfied' : 'needs_verification';
        explanation = criterion.rationale || 'Assessment based on published conditions.';
        break;
    }

    evaluatedCriteria.push({
      criterionId: criterion.id,
      label: criterion.label,
      description: criterion.description,
      status,
      explanation,
    });
  }

  const satisfiedCount = evaluatedCriteria.filter((c) => c.status === 'appears_satisfied').length;
  const unclearCount = evaluatedCriteria.filter((c) => c.status === 'needs_verification').length;
  const unsatisfiedCount = evaluatedCriteria.filter((c) => c.status === 'appears_not_satisfied').length;

  let overallEligibilitySummary: EligibilityEvaluationResult['overallEligibilitySummary'] = 'insufficient_data';
  let summaryHeadline = '';
  let summaryExplanation = '';

  if (unsatisfiedCount > 0) {
    overallEligibilitySummary = 'issues_detected';
    summaryHeadline = `${unsatisfiedCount} condition${unsatisfiedCount > 1 ? 's' : ''} appear not satisfied`;
    summaryExplanation =
      'One or more conditions do not currently match the information provided. Review the details above before moving forward.';
  } else if (satisfiedCount > 0 && unclearCount === 0) {
    overallEligibilitySummary = 'likely_eligible_with_verification';
    summaryHeadline = `Criteria Matched: All ${satisfiedCount} conditions appear satisfied`;
    summaryExplanation =
      'Based on the details provided, your profile matches published scheme criteria. Formal legal eligibility remains subject to official authority verification.';
  } else if (satisfiedCount > 0 && unclearCount > 0) {
    overallEligibilitySummary = 'likely_eligible_with_verification';
    summaryHeadline = `Criteria Partially Matched: ${satisfiedCount} condition${satisfiedCount > 1 ? 's' : ''} satisfied • ${unclearCount} need${unclearCount === 1 ? 's' : ''} verification`;
    summaryExplanation =
      'Your declared details match core criteria, but supporting verification is required before submission readiness.';
  } else {
    overallEligibilitySummary = 'insufficient_data';
    summaryHeadline = `${unclearCount} conditions need information`;
    summaryExplanation =
      'Provide answers to the questions above or click "Use sample applicant" to see an evaluation in this demo.';
  }

  return {
    criteria: evaluatedCriteria,
    satisfiedCount,
    unclearCount,
    unsatisfiedCount,
    overallEligibilitySummary,
    summaryHeadline,
    summaryExplanation,
  };
}
