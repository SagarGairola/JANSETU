import type { Scheme, CitizenProfileAnswers, NeedProfile } from '../../types';
import type {
  EvaluatedSchemeRule,
  EligibilityAssessment,
  RuleEvaluationStatus,
  OverallEligibilityStatus,
} from './types';
import { resolveCriterionEvidence } from './evidenceResolver';

export interface EvaluationInput {
  scheme: Scheme;
  needProfile?: NeedProfile;
  answers?: CitizenProfileAnswers;
}

export function evaluateSchemeRules(input: EvaluationInput): EligibilityAssessment {
  const { scheme, needProfile, answers = {} } = input;
  const rules: EvaluatedSchemeRule[] = [];

  const extracted = needProfile?.extractedProfile;

  for (const criterion of scheme.eligibilityCriteria) {
    let status: RuleEvaluationStatus = 'UNKNOWN';
    let userFact: string | unknown = 'Not provided';
    let userFactSource: EvaluatedSchemeRule['userFactSource'] = 'unprovided';
    let explanation = 'Condition requires confirmation.';
    let isHardDisqualifier = false;

    const evidence = resolveCriterionEvidence(scheme, criterion);

    switch (criterion.id) {
      // ----------------------------------------------------
      // POST-MATRIC SCHOLARSHIP
      // ----------------------------------------------------
      case 'crit-enrollment':
        isHardDisqualifier = true;
        if (answers.isEnrolledInCollege === 'yes') {
          status = 'SATISFIED';
          userFact = 'Actively enrolled in college';
          userFactSource = 'interactive_answer';
          explanation = 'Declared enrollment in an eligible post-matric institution.';
        } else if (answers.isEnrolledInCollege === 'no') {
          status = 'FAILED';
          userFact = 'Not enrolled';
          userFactSource = 'interactive_answer';
          explanation = 'Post-matric college enrollment is required for this scholarship.';
        } else if (extracted?.studentStatus === 'student') {
          status = 'SATISFIED';
          userFact = extracted.educationLevel
            ? `Student (${extracted.educationLevel})`
            : 'Student';
          userFactSource = 'need_profile';
          explanation = 'You stated that you are an actively studying student.';
        } else if (extracted?.studentStatus === 'not_student') {
          status = 'FAILED';
          userFact = 'Not a student';
          userFactSource = 'need_profile';
          explanation = 'You indicated you are not a student. This scheme is strictly for students.';
        } else {
          status = 'UNKNOWN';
          userFact = 'Enrollment unconfirmed';
          explanation = 'Institutional enrollment status requires confirmation.';
        }
        break;

      case 'crit-income':
        isHardDisqualifier = true;
        // Civic rule: targetFinancialAmount (amount requested) != annualFamilyIncome
        if (answers.annualIncome === 'under_250k') {
          status = 'SATISFIED';
          userFact = 'Family income under ₹2,50,000';
          userFactSource = 'interactive_answer';
          explanation = 'Declared annual family income meets the published ceiling condition (< ₹2.5 Lakh).';
        } else if (answers.annualIncome === 'over_250k') {
          status = 'FAILED';
          userFact = 'Family income over ₹2,50,000';
          userFactSource = 'interactive_answer';
          explanation = 'Reported family income exceeds the ₹2,50,000 published scheme threshold.';
        } else if (typeof extracted?.annualFamilyIncome === 'number') {
          if (extracted.annualFamilyIncome <= 250000) {
            status = 'SATISFIED';
            userFact = `₹${extracted.annualFamilyIncome.toLocaleString('en-IN')}/year`;
            userFactSource = 'need_profile';
            explanation = 'Extracted family income falls within the ₹2,50,000 threshold.';
          } else {
            status = 'FAILED';
            userFact = `₹${extracted.annualFamilyIncome.toLocaleString('en-IN')}/year`;
            userFactSource = 'need_profile';
            explanation = 'Extracted family income exceeds the ₹2,50,000 threshold.';
          }
        } else {
          status = 'UNKNOWN';
          userFact = 'Income details not provided';
          explanation = 'Annual income details have not been verified yet.';
        }
        break;

      case 'crit-domicile':
        isHardDisqualifier = false;
        if (answers.isDomicileResident === 'yes') {
          status = 'SATISFIED';
          userFact = 'Domicile resident with proof';
          userFactSource = 'interactive_answer';
          explanation = 'Declared as a bona fide domicile resident of the applying state/UT.';
        } else if (answers.isDomicileResident === 'no') {
          status = 'FAILED';
          userFact = 'Out-of-state resident';
          userFactSource = 'interactive_answer';
          explanation = 'Applicant does not hold domicile residency in the applying state.';
        } else if (extracted?.state) {
          status = 'SATISFIED';
          userFact = `Resident of ${extracted.state}`;
          userFactSource = 'need_profile';
          explanation = `Identified residency in ${extracted.state}. State-level quota verification applies.`;
        } else {
          status = 'UNKNOWN';
          userFact = 'State domicile unverified';
          explanation = 'State domicile records cannot be confirmed from the details provided.';
        }
        break;

      // ----------------------------------------------------
      // PM-KISAN
      // ----------------------------------------------------
      case 'crit-land':
        isHardDisqualifier = true;
        // Beneficiary distinction: Check user occupation vs family occupation
        if (answers.hasLandholding === 'yes') {
          status = 'SATISFIED';
          userFact = 'Cultivable landholding registered';
          userFactSource = 'interactive_answer';
          explanation = 'You indicated cultivable landholding in family revenue records.';
        } else if (answers.hasLandholding === 'no') {
          status = 'FAILED';
          userFact = 'No landholding';
          userFactSource = 'interactive_answer';
          explanation = 'Cultivable agricultural landholding is a mandatory scheme prerequisite.';
        } else if (extracted?.hasLandholding === true) {
          status = 'SATISFIED';
          userFact = 'Landholding declared';
          userFactSource = 'need_profile';
          explanation = 'Indicated ownership of cultivable agricultural land.';
        } else if (extracted?.occupation === 'farmer') {
          status = 'SATISFIED';
          userFact = 'Primary occupation: Farmer';
          userFactSource = 'need_profile';
          explanation = 'You stated your occupation as farmer. Land record title verification applies.';
        } else if (extracted?.occupation && extracted.occupation !== 'farmer' && !extracted.familyOccupation) {
          status = 'FAILED';
          userFact = `Occupation: ${extracted.occupation}`;
          userFactSource = 'need_profile';
          explanation = 'PM-KISAN is exclusively available to landholding farmer families.';
        } else {
          status = 'UNKNOWN';
          userFact = 'Landholding status unverified';
          explanation = 'Cultivable landholding in revenue records has not been confirmed.';
        }
        break;

      case 'crit-ekyc':
        isHardDisqualifier = false;
        if (answers.hasCompletedEkyc === 'yes') {
          status = 'SATISFIED';
          userFact = 'Aadhaar e-KYC completed';
          userFactSource = 'interactive_answer';
          explanation = 'Aadhaar biometric or OTP e-KYC declared as completed on portal.';
        } else if (answers.hasCompletedEkyc === 'no') {
          status = 'FAILED';
          userFact = 'e-KYC pending';
          userFactSource = 'interactive_answer';
          explanation = 'Biometric or OTP-based e-KYC has not been completed on the PM-KISAN portal.';
        } else {
          status = 'UNKNOWN';
          userFact = 'e-KYC unverified';
          explanation = 'Aadhaar e-KYC status requires official portal verification.';
        }
        break;

      // ----------------------------------------------------
      // PMEGP MICRO-ENTERPRISE
      // ----------------------------------------------------
      case 'crit-age-biz':
        isHardDisqualifier = true;
        if (answers.isAge18Plus === 'yes') {
          status = 'SATISFIED';
          userFact = 'Age 18+ years';
          userFactSource = 'interactive_answer';
          explanation = 'Applicant meets the minimum legal age requirement (18+ years).';
        } else if (answers.isAge18Plus === 'no') {
          status = 'FAILED';
          userFact = 'Under 18 years';
          userFactSource = 'interactive_answer';
          explanation = 'Applicant must be at least 18 years of age at the time of application.';
        } else if (typeof extracted?.age === 'number') {
          if (extracted.age >= 18) {
            status = 'SATISFIED';
            userFact = `Age ${extracted.age}`;
            userFactSource = 'need_profile';
            explanation = 'Applicant meets the minimum age requirement.';
          } else {
            status = 'FAILED';
            userFact = `Age ${extracted.age}`;
            userFactSource = 'need_profile';
            explanation = 'Applicant is under 18 years of age.';
          }
        } else {
          status = 'UNKNOWN';
          userFact = 'Age not specified';
          explanation = 'Applicant age has not been specified.';
        }
        break;

      case 'crit-unit-biz':
        isHardDisqualifier = true;
        if (answers.isNewUnit === 'yes') {
          status = 'SATISFIED';
          userFact = 'Brand new unit';
          userFactSource = 'interactive_answer';
          explanation = 'Assistance requested for establishing a new greenfield micro-venture.';
        } else if (answers.isNewUnit === 'no') {
          status = 'FAILED';
          userFact = 'Existing unit';
          userFactSource = 'interactive_answer';
          explanation = 'PMEGP subsidies apply strictly to new projects, not existing units.';
        } else if (extracted?.businessStatus === 'new') {
          status = 'SATISFIED';
          userFact = 'New business venture';
          userFactSource = 'need_profile';
          explanation = 'You stated your intent to establish a new business venture.';
        } else if (extracted?.businessStatus === 'existing') {
          status = 'FAILED';
          userFact = 'Existing operational business';
          userFactSource = 'need_profile';
          explanation = 'PMEGP assistance is restricted to new enterprise setup, not existing units.';
        } else {
          status = 'UNKNOWN';
          userFact = 'New unit status unverified';
          explanation = 'New unit establishment status needs verification.';
        }
        break;

      case 'crit-edu-biz':
        isHardDisqualifier = false;
        if (answers.educationQualification === 'class_8_plus') {
          status = 'SATISFIED';
          userFact = 'Class 8 pass or higher';
          userFactSource = 'interactive_answer';
          explanation = 'Satisfies educational qualification criteria (Class 8 pass or higher).';
        } else if (answers.educationQualification === 'below_class_8') {
          status = 'UNKNOWN';
          userFact = 'Below Class 8';
          userFactSource = 'interactive_answer';
          explanation = 'Allowed for service units < ₹5L or manufacturing < ₹10L; otherwise requires Class 8 certificate.';
        } else {
          status = 'UNKNOWN';
          userFact = 'Education unprovided';
          explanation = 'Educational qualification needs to be confirmed for manufacturing projects > ₹10L.';
        }
        break;

      default:
        status = criterion.isSatisfied === true ? 'SATISFIED' : 'UNKNOWN';
        userFact = 'Published baseline criteria';
        explanation = criterion.rationale || 'Assessment based on published conditions.';
        break;
    }

    rules.push({
      ruleId: criterion.id,
      ruleLabel: criterion.label,
      ruleDescription: criterion.description,
      requiredCondition: criterion.description,
      status,
      userFact,
      userFactSource,
      isHardDisqualifier,
      evidence,
      explanation,
    });
  }

  const satisfiedCount = rules.filter((r) => r.status === 'SATISFIED').length;
  const failedCount = rules.filter((r) => r.status === 'FAILED').length;
  const unknownCount = rules.filter((r) => r.status === 'UNKNOWN').length;

  const hasFailedHardRule = rules.some((r) => r.isHardDisqualifier && r.status === 'FAILED');

  let overallStatus: OverallEligibilityStatus;
  let statusBadgeLabel: string;
  let headline: string;
  let summaryExplanation: string;

  if (hasFailedHardRule || failedCount > 0) {
    overallStatus = 'DOES_NOT_APPEAR_ELIGIBLE';
    statusBadgeLabel = 'Does not appear eligible';
    const failedRule = rules.find((r) => r.status === 'FAILED');
    headline = 'One or more published conditions do not appear to match';
    summaryExplanation = failedRule
      ? `Based on the information provided, you do not appear to meet: ${failedRule.ruleLabel}. ${failedRule.explanation}`
      : 'One or more mandatory conditions are not met according to the details provided.';
  } else if (satisfiedCount > 0 && unknownCount === 0) {
    overallStatus = 'APPEARS_ELIGIBLE';
    statusBadgeLabel = 'Appears eligible';
    headline = `All ${satisfiedCount} evaluated conditions appear satisfied`;
    summaryExplanation =
      'Based on the information provided, you appear to meet the conditions currently available to JANSETU. Formal approval remains subject to official document verification.';
  } else if (satisfiedCount > 0 && unknownCount > 0) {
    overallStatus = 'NEEDS_VERIFICATION';
    statusBadgeLabel = 'Needs verification';
    headline = `${satisfiedCount} condition${satisfiedCount > 1 ? 's' : ''} appear satisfied • ${unknownCount} need${unknownCount === 1 ? 's' : ''} verification`;
    summaryExplanation =
      'Your profile aligns with initial criteria, but formal verification of specific conditions is required before applying.';
  } else {
    overallStatus = 'INSUFFICIENT_INFORMATION';
    statusBadgeLabel = 'Insufficient information';
    headline = `${unknownCount} conditions need information`;
    summaryExplanation =
      'You may fit this scheme, but JANSETU still needs to verify some conditions from published criteria.';
  }

  // Count evidence sources
  let officialSourcesCount = 0;
  let verifiedClaimsCount = 0;
  let unverifiedClaimsCount = 0;
  let missingSourcesCount = 0;

  for (const r of rules) {
    if (!r.evidence || r.evidence.trustLevel === 'MISSING_SOURCE') {
      missingSourcesCount++;
    } else if (r.evidence.trustLevel === 'OFFICIAL_SOURCE') {
      officialSourcesCount++;
      if (r.evidence.verified) verifiedClaimsCount++;
    } else {
      unverifiedClaimsCount++;
    }
  }

  return {
    schemeId: scheme.id,
    schemeName: scheme.name,
    overallStatus,
    statusBadgeLabel,
    headline,
    summaryExplanation,
    rules,
    satisfiedCount,
    failedCount,
    unknownCount,
    evidenceSummary: {
      officialSourcesCount,
      verifiedClaimsCount,
      unverifiedClaimsCount,
      missingSourcesCount,
    },
  };
}
