import type { Scheme } from '../types';

export type RelevanceLabel =
  | 'Strong match'
  | 'Relevant to explore'
  | 'Also worth checking'
  | 'Potential conflict';

export interface DiscoveredScheme {
  scheme: Scheme;
  relevanceLabel: RelevanceLabel;
  whyItFits: string;
  worthChecking: string[];
  isPrimaryMatch: boolean;
}

export interface MatchResult {
  results: DiscoveredScheme[];
  hasStrongMatch: boolean;
  detectedCategory?: 'education' | 'agriculture' | 'business';
  detectedCategories?: Array<'education' | 'agriculture' | 'business'>;
}

const EDUCATION_KEYWORDS =
  /\b(education|study|studies|student|students|scholarship|scholarships|college|tuition|school|degree|fees?|university|course|matric|higher)\b/i;
const EDUCATION_NEGATION =
  /\b(?:not|non)\s+(?:a\s+)?student|\bnot\s+(?:for\s+education|studying|education)\b/i;

const FARMING_KEYWORDS =
  /\b(farm|farms|farmer|farmers|farming|crop|crops|kisan|agriculture|agricultural|land|landholding|harvest|cultivation|seed|seeds|fertilizer)\b/i;
const FARMING_NEGATION =
  /\b(?:not|non)\s+(?:a\s+)?farmer|\bno\s+land(?:holding)?|\b(?:don't|dont|not)\s+(?:have\s+land|farm|farming)|\bnon[- ](?:agricultural|farming)\b/i;

const BUSINESS_KEYWORDS =
  /\b(business|enterprise|shop|store|startup|micro|venture|credit|mudra|loan|trade|commerce|self-employed|entrepreneur|manufacturing|service unit)\b/i;
const BUSINESS_NEGATION =
  /\b(?:not|non)\s+(?:a\s+)?(?:business|entrepreneur)|\bnot\s+(?:starting\s+a\s+business|business)\b/i;

// Income ceiling conflict regex: Post-Matric Scholarship has an income ceiling of ₹2,50,000 (< 2.5 Lakh).
const INCOME_CONFLICT_REGEX =
  /\b(?:income|earning|salary|earn)\b.{0,25}\b(?:above|over|more than|exceeds?|>)\b.{0,15}\b(?:2\.?5|3|4|5|6|7|8|9|10|\d{2,})\b|\b(?:above|over|more than|exceeds?|>)\s*(?:rs\.?|inr|₹)?\s*(?:2\.?5|3|4|5|6|7|8|9|10|\d{2,})\s*(?:lakh|lac|lacs|lakhs)\b|\b(?:income|earning|salary|earn)\s*(?:is|of|around|about)?\s*(?:rs\.?|inr|₹)?\s*(?:[3-9]|\d{2,})\s*(?:lakh|lac|lacs|lakhs)\b|\b(?:rs\.?|inr|₹)?\s*(?:[3-9]|\d{2,})\s*(?:lakh|lac|lacs|lakhs)\s*(?:income|salary|annual|per annum)\b|\b(?:income|earning|salary|earn)\b.{0,20}\b(?:300000|400000|500000|600000|700000|800000|900000|1000000)\b/i;

export function matchSchemes(userNeed: string, schemes: Scheme[]): MatchResult {
  const trimmed = userNeed ? userNeed.trim() : '';

  if (!trimmed) {
    return {
      hasStrongMatch: false,
      results: schemes.map((scheme) => ({
        scheme,
        relevanceLabel: 'Relevant to explore',
        whyItFits: scheme.whyRelevantDefault || 'General citizen assistance scheme.',
        worthChecking: scheme.worthCheckingPoints || [
          'Basic eligibility criteria',
          'Required identity documents',
        ],
        isPrimaryMatch: false,
      })),
    };
  }

  // Detect domain relevance independently (no if/else-if masking)
  const isEducationMatch = EDUCATION_KEYWORDS.test(trimmed) && !EDUCATION_NEGATION.test(trimmed);
  const isAgricultureMatch = FARMING_KEYWORDS.test(trimmed) && !FARMING_NEGATION.test(trimmed);
  const isBusinessMatch = BUSINESS_KEYWORDS.test(trimmed) && !BUSINESS_NEGATION.test(trimmed);

  const isEducationNegated = EDUCATION_NEGATION.test(trimmed);
  const isAgricultureNegated = FARMING_NEGATION.test(trimmed);
  const isBusinessNegated = BUSINESS_NEGATION.test(trimmed);

  const detectedCategories: Array<'education' | 'agriculture' | 'business'> = [];
  if (isEducationMatch) detectedCategories.push('education');
  if (isAgricultureMatch) detectedCategories.push('agriculture');
  if (isBusinessMatch) detectedCategories.push('business');

  const hasAnyDomainMatch = detectedCategories.length > 0;
  const hasIncomeConflict = INCOME_CONFLICT_REGEX.test(trimmed);

  const results: DiscoveredScheme[] = schemes.map((scheme) => {
    let relevanceLabel: RelevanceLabel;
    let whyItFits: string;
    let isPrimaryMatch = false;

    if (scheme.category === 'education') {
      if (isEducationMatch) {
        if (hasIncomeConflict) {
          relevanceLabel = 'Potential conflict';
          whyItFits =
            'Matches your interest in educational assistance, but your stated income (> ₹2.5 Lakh) conflicts with the published scheme ceiling of ₹2,50,000/year.';
        } else {
          relevanceLabel = 'Strong match';
          whyItFits = 'Directly matches your stated need for education or student scholarship support.';
          isPrimaryMatch = true;
        }
      } else if (isEducationNegated) {
        relevanceLabel = 'Also worth checking';
        whyItFits = 'Student or educational assistance was indicated as not required.';
      } else if (hasAnyDomainMatch) {
        relevanceLabel = 'Also worth checking';
        whyItFits = scheme.whyRelevantDefault || 'Alternative support category you may consider.';
      } else {
        relevanceLabel = 'Relevant to explore';
        whyItFits = scheme.whyRelevantDefault || 'Potentially relevant citizen support scheme.';
      }
    } else if (scheme.category === 'agriculture') {
      if (isAgricultureMatch) {
        relevanceLabel = 'Strong match';
        whyItFits = 'Directly matches your stated need for agricultural or farming support.';
        isPrimaryMatch = true;
      } else if (isAgricultureNegated) {
        relevanceLabel = 'Also worth checking';
        whyItFits = 'Farming or agricultural assistance was indicated as not required.';
      } else if (hasAnyDomainMatch) {
        relevanceLabel = 'Also worth checking';
        whyItFits = scheme.whyRelevantDefault || 'Alternative support category you may consider.';
      } else {
        relevanceLabel = 'Relevant to explore';
        whyItFits = scheme.whyRelevantDefault || 'Potentially relevant citizen support scheme.';
      }
    } else if (scheme.category === 'business') {
      if (isBusinessMatch) {
        relevanceLabel = 'Strong match';
        whyItFits = 'Directly matches your stated need for micro-enterprise or small business credit.';
        isPrimaryMatch = true;
      } else if (isBusinessNegated) {
        relevanceLabel = 'Also worth checking';
        whyItFits = 'Business or enterprise assistance was indicated as not required.';
      } else if (hasAnyDomainMatch) {
        relevanceLabel = 'Also worth checking';
        whyItFits = scheme.whyRelevantDefault || 'Alternative support category you may consider.';
      } else {
        relevanceLabel = 'Relevant to explore';
        whyItFits = scheme.whyRelevantDefault || 'Potentially relevant citizen support scheme.';
      }
    } else {
      relevanceLabel = 'Relevant to explore';
      whyItFits = scheme.whyRelevantDefault || 'General citizen assistance scheme.';
    }

    const defaultWorthChecking =
      scheme.worthCheckingPoints && scheme.worthCheckingPoints.length > 0
        ? scheme.worthCheckingPoints
        : [
            'Core eligibility conditions',
            'Mandatory verification documents',
            'Designated official portal channel',
          ];

    const worthChecking =
      relevanceLabel === 'Potential conflict'
        ? ['Annual household income ceiling (< ₹2.50 Lakh)', ...defaultWorthChecking]
        : defaultWorthChecking;

    return {
      scheme,
      relevanceLabel,
      whyItFits,
      worthChecking,
      isPrimaryMatch,
    };
  });

  // Sort rank: Strong match (1) -> Potential conflict (2) -> Relevant to explore (3) -> Also worth checking (4)
  const rankMap: Record<RelevanceLabel, number> = {
    'Strong match': 1,
    'Potential conflict': 2,
    'Relevant to explore': 3,
    'Also worth checking': 4,
  };

  results.sort((a, b) => rankMap[a.relevanceLabel] - rankMap[b.relevanceLabel]);

  const hasStrongMatch = results.some((r) => r.relevanceLabel === 'Strong match');

  return {
    results,
    hasStrongMatch,
    detectedCategory: detectedCategories[0],
    detectedCategories,
  };
}
