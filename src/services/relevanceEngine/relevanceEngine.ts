import type { Scheme, NeedProfile } from '../../types';
import type {
  EvaluatedSchemeRelevance,
  RelevanceEvaluationResult,
} from './types';

export class RelevanceEngine {
  /**
   * Evaluates relevance between a structured NeedProfile and available Schemes
   * using multi-signal compatibility (domain, goal, beneficiary, and context).
   */
  evaluate(needProfile: NeedProfile, schemes: Scheme[]): RelevanceEvaluationResult {
    // 1. Guard against unknown or purely ambiguous input
    const isUnknownDomain =
      !needProfile.domains ||
      needProfile.domains.length === 0 ||
      needProfile.domains.includes('unknown');

    if (isUnknownDomain) {
      return {
        results: [],
        directMatches: [],
        alternativeMatches: [],
        hasMatches: false,
        needProfile,
      };
    }

    const evaluated: EvaluatedSchemeRelevance[] = [];

    for (const scheme of schemes) {
      const result = this.evaluateSingleScheme(needProfile, scheme);
      if (result.tier !== 'NOT_RELEVANT') {
        evaluated.push(result);
      }
    }

    // Sort by score descending
    evaluated.sort((a, b) => b.relevanceScore - a.relevanceScore);

    const directMatches = evaluated.filter((r) => r.tier === 'DIRECT_MATCH');
    const alternativeMatches = evaluated.filter((r) => r.tier === 'RELEVANT_ALTERNATIVE');

    return {
      results: evaluated,
      directMatches,
      alternativeMatches,
      hasMatches: evaluated.length > 0,
      needProfile,
    };
  }

  private evaluateSingleScheme(
    profile: NeedProfile,
    scheme: Scheme
  ): EvaluatedSchemeRelevance {
    let score = 0;
    const signals = {
      domainMatch: false,
      goalMatch: false,
      beneficiaryMatch: false,
      contextMatch: false,
    };

    // Signal 1: Domain / Category compatibility
    // Primary domain receives highest weight, followed by secondary recognized domains.
    if (scheme.category === profile.primaryDomain) {
      signals.domainMatch = true;
      score += 45;
    } else if (profile.domains.includes(scheme.category)) {
      signals.domainMatch = true;
      score += 35;
    } else {
      return {
        scheme,
        tier: 'NOT_RELEVANT',
        relevanceLabel: 'Not relevant',
        relevanceScore: 0,
        whyItFits: '',
        worthChecking: [],
        signals,
      };
    }

    // Signal 2: Specific Goal compatibility
    const schemeGoals = scheme.goals || [];
    const hasMatchingGoal = profile.goals.some((g) => schemeGoals.includes(g as any));
    if (hasMatchingGoal) {
      signals.goalMatch = true;
      score += 30;
    }

    // Signal 3: Beneficiary Profile & Role compatibility
    const extracted = profile.extractedProfile;

    if (scheme.category === 'education') {
      if (extracted.studentStatus === 'student' || extracted.educationLevel) {
        signals.beneficiaryMatch = true;
        score += 20;
      }
    } else if (scheme.category === 'agriculture') {
      if (extracted.occupation === 'farmer') {
        signals.beneficiaryMatch = true;
        score += 20;
      } else if (extracted.familyOccupation === 'farmer') {
        signals.beneficiaryMatch = true;
        score += 15;
      }
    } else if (scheme.category === 'business') {
      if (extracted.businessStatus === 'new' || extracted.employmentStatus === 'unemployed') {
        signals.beneficiaryMatch = true;
        score += 20;
      } else if (extracted.businessStatus === 'existing') {
        signals.beneficiaryMatch = true;
        score += 10;
      }
    } else if (scheme.category === 'social_security' || scheme.category === 'social_welfare') {
      if (extracted.occupation === 'household_worker' || extracted.familyOccupation === 'household_worker') {
        signals.beneficiaryMatch = true;
        score += 25;
      } else {
        signals.beneficiaryMatch = true;
        score += 15;
      }
    } else if (scheme.category === 'healthcare' || scheme.category === 'housing') {
      signals.beneficiaryMatch = true;
      score += 20;
    } else if (scheme.category === 'skill_development') {
      signals.beneficiaryMatch = true;
      score += 20;
    } else if (scheme.category === 'women') {
      if (/\b(?:mother|woman|women|girl|female)\b/i.test(profile.rawInput)) {
        signals.beneficiaryMatch = true;
        score += 25;
      }
    }

    // Signal 4: Context / Desired Support compatibility
    if (
      scheme.category === 'education' &&
      (profile.desiredSupportTypes.includes('fee_waiver') || profile.desiredSupportTypes.includes('financial_grant'))
    ) {
      signals.contextMatch = true;
      score += 10;
    } else if (scheme.category === 'agriculture' && profile.desiredSupportTypes.includes('financial_grant')) {
      signals.contextMatch = true;
      score += 10;
    } else if (scheme.category === 'business' && profile.desiredSupportTypes.includes('loan_or_credit')) {
      signals.contextMatch = true;
      score += 10;
    } else if (scheme.category === 'social_security' || scheme.category === 'healthcare') {
      signals.contextMatch = true;
      score += 10;
    }

    // Deduce Tier: Only schemes matching the primaryDomain can be DIRECT_MATCH
    let tier: 'DIRECT_MATCH' | 'RELEVANT_ALTERNATIVE' | 'NOT_RELEVANT';
    let relevanceLabel: 'Strong match' | 'Relevant to explore' | 'Not relevant';

    if (score >= 60 && scheme.category === profile.primaryDomain) {
      tier = 'DIRECT_MATCH';
      relevanceLabel = 'Strong match';
    } else if (score >= 35) {
      tier = 'RELEVANT_ALTERNATIVE';
      relevanceLabel = 'Relevant to explore';
    } else {
      tier = 'NOT_RELEVANT';
      relevanceLabel = 'Not relevant';
    }

    // Generate truthful Why It Fits explanation without claiming eligibility
    let whyItFits = scheme.whyRelevantDefault || 'Matches your general requirement.';
    if (scheme.category === 'education') {
      if (signals.goalMatch) {
        whyItFits = 'Matches your requirement for education fee assistance and tuition financial support.';
      } else {
        whyItFits = 'May fit your educational background. Specific scholarship eligibility must be verified.';
      }
    } else if (scheme.category === 'agriculture') {
      if (extracted.familyOccupation === 'farmer') {
        whyItFits = "Relevant for your family's farming support and agricultural landholding assistance.";
      } else if (signals.goalMatch) {
        whyItFits = 'Provides direct financial support for eligible agricultural landholding farmers.';
      }
    } else if (scheme.category === 'business') {
      if (extracted.businessStatus === 'existing') {
        whyItFits = 'Provides credit-linked capital subsidy; check whether expansion projects qualify under current guidelines.';
      } else {
        whyItFits = 'Matches your intent to start a new enterprise or small business unit.';
      }
    }

    return {
      scheme,
      tier,
      relevanceLabel,
      relevanceScore: score,
      whyItFits,
      worthChecking: scheme.worthCheckingPoints || [
        'Basic eligibility criteria',
        'Required identity documents',
      ],
      signals,
    };
  }
}

let relevanceEngineInstance: RelevanceEngine | null = null;

export function getRelevanceEngine(): RelevanceEngine {
  if (!relevanceEngineInstance) {
    relevanceEngineInstance = new RelevanceEngine();
  }
  return relevanceEngineInstance;
}

export function evaluateSchemeRelevance(
  needProfile: NeedProfile,
  schemes: Scheme[]
): RelevanceEvaluationResult {
  return getRelevanceEngine().evaluate(needProfile, schemes);
}
