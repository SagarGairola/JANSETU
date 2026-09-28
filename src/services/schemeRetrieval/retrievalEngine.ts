import type { NeedProfile, NeedDomain, NeedGoal, Scheme, SchemeSource } from '../../types';
import type {
  RetrievalQuery,
  SchemeRetrievalResponse,
  BeneficiaryContext,
} from './types';
import { getProviderRegistry } from './providerRegistry';
import { getSchemeSources } from './sourceTrust';

/**
 * Domain-specific contextual search term generator.
 * Enhances citizen natural language descriptions with standard civic terminology
 * without requiring the citizen to know official scheme titles.
 */
function generateContextualSearchTerms(
  domain: NeedDomain,
  goals: NeedGoal[],
  profile: NeedProfile
): string[] {
  const terms: Set<string> = new Set();
  const raw = profile.rawInput.toLowerCase();

  terms.add(domain);
  for (const g of goals) {
    terms.add(String(g).replace(/_/g, ' '));
  }

  if (domain === 'agriculture') {
    if (goals.includes('equipment') || raw.includes('equipment') || raw.includes('machine') || raw.includes('tractor')) {
      terms.add('agricultural equipment');
      terms.add('farm machinery');
      terms.add('mechanization');
      terms.add('tractor');
      terms.add('farm tools');
    }
    if (goals.includes('irrigation') || raw.includes('irrigation') || raw.includes('pump') || raw.includes('borewell')) {
      terms.add('irrigation');
      terms.add('solar pump');
      terms.add('water conservation');
    }
    if (goals.includes('crop_support') || goals.includes('income_support') || raw.includes('crop') || raw.includes('income')) {
      terms.add('crop cultivation');
      terms.add('income support');
      terms.add('landholding farmer');
    }
  } else if (domain === 'education') {
    if (goals.includes('scholarship') || goals.includes('fee_assistance') || raw.includes('fee') || raw.includes('scholarship')) {
      terms.add('scholarship');
      terms.add('fee assistance');
      terms.add('higher education');
      terms.add('tuition support');
      terms.add('student');
    }
    if (raw.includes('b.tech') || raw.includes('engineering') || raw.includes('degree')) {
      terms.add('b.tech');
      terms.add('professional degree');
      terms.add('post-matric');
    }
  } else if (domain === 'business' || domain === 'employment') {
    if (goals.includes('start_business') || raw.includes('shop') || raw.includes('start') || raw.includes('business')) {
      terms.add('start business');
      terms.add('small shop');
      terms.add('micro-enterprise');
      terms.add('credit-linked subsidy');
      terms.add('self-employment');
      terms.add('entrepreneurship');
    }
  } else if (domain === 'skill_development') {
    terms.add('skill development');
    terms.add('vocational training');
    terms.add('apprenticeship');
    terms.add('skilling');
  } else if (domain === 'housing') {
    terms.add('housing support');
    terms.add('pucca house');
    terms.add('rural housing');
  } else if (domain === 'healthcare') {
    terms.add('medical treatment');
    terms.add('health insurance');
    terms.add('hospital bills');
  }

  return Array.from(terms);
}

/**
 * Deterministically constructs RetrievalQuery intents from a structured NeedProfile.
 * Adheres strictly to the Minimum Question and Civic-Tech Honesty principles:
 * - Unresolved purpose requests (e.g. "I need ₹2 lakh.", "I need financial help.", "hello") yield ZERO queries.
 * - Distinct needs (e.g. housing + medical) yield separate queries.
 * - Citizen's location/state is preserved if stated, never fabricated.
 * - Beneficiary distinctions (e.g. user is student, father is farmer) are preserved without confusing roles.
 */
export function generateRetrievalQueries(profile: NeedProfile): RetrievalQuery[] {
  // Check for completely unclarified / unknown / empty domains
  const validDomains = profile.domains.filter((d) => d !== 'unknown' && d !== 'other');
  if (validDomains.length === 0) {
    return [];
  }

  // Check for unresolved ambiguous requests with missing purpose
  if (
    profile.unknownImportantFields.includes('purpose_of_support') &&
    validDomains.length === 0
  ) {
    return [];
  }

  const queries: RetrievalQuery[] = [];
  const extracted = profile.extractedProfile;

  // Handle Multi-Need: If distinct needs are identified, construct dedicated queries for each
  if (profile.distinctNeeds && profile.distinctNeeds.length > 1) {
    profile.distinctNeeds.forEach((need, index) => {
      const queryTerms = generateContextualSearchTerms(need.domain, need.goals, profile);
      const isFamilyDomain = need.domain === 'agriculture' && !!extracted.familyOccupation;

      queries.push({
        intentId: `intent-${need.domain}-${index + 1}`,
        naturalLanguageQuery: profile.rawInput,
        domain: need.domain,
        goals: need.goals,
        location: extracted.state ? { state: extracted.state } : undefined,
        beneficiaryContext: {
          isUserBeneficiary: !isFamilyDomain,
          familyRole: extracted.familyOccupation ? 'father' : undefined,
          familyOccupation: extracted.familyOccupation,
          occupation: isFamilyDomain ? undefined : extracted.occupation,
          studentStatus: extracted.studentStatus,
          employmentStatus: extracted.employmentStatus,
          businessStatus: extracted.businessStatus,
        },
        searchTerms: queryTerms,
        originatingNeed: need.contextSummary,
      });
    });
    return queries;
  }

  // Handle single or primary domain queries
  for (const domain of validDomains) {
    const goalsForDomain = profile.goals;
    const queryTerms = generateContextualSearchTerms(domain, goalsForDomain, profile);

    // Contextual beneficiary assignment
    const beneficiary: BeneficiaryContext = {
      isUserBeneficiary: true,
      familyRole: extracted.familyOccupation ? 'father' : undefined,
      familyOccupation: extracted.familyOccupation,
      occupation: extracted.occupation,
      studentStatus: extracted.studentStatus,
      employmentStatus: extracted.employmentStatus,
      businessStatus: extracted.businessStatus,
    };

    // If citizen states family farms but user needs education:
    // primary user intent is education, user is NOT a farmer
    if (domain === 'education' && extracted.familyOccupation === 'farmer') {
      beneficiary.isUserBeneficiary = true;
      beneficiary.occupation = undefined; // user is student/individual, not farmer
    }

    queries.push({
      intentId: `intent-${domain}-1`,
      naturalLanguageQuery: profile.rawInput,
      domain,
      goals: goalsForDomain,
      location: extracted.state ? { state: extracted.state } : undefined,
      beneficiaryContext: beneficiary,
      searchTerms: queryTerms,
      originatingNeed: `Support for ${domain}`,
    });
  }

  return queries;
}

export class SchemeRetrievalEngine {
  private registry = getProviderRegistry();

  async retrieve(profile: NeedProfile): Promise<SchemeRetrievalResponse> {
    const queries = generateRetrievalQueries(profile);
    const retrievalTimestamp = new Date().toISOString();

    // Collect provider trust and unavailable status reports
    const unavailableProviders: Array<{
      providerName: string;
      providerType: string;
      reason: string;
    }> = [];
    const warnings: string[] = [];

    const trustReports = this.registry.getTrustReports();
    for (const report of trustReports) {
      if (!report.isConfigured && report.reason) {
        unavailableProviders.push({
          providerName: report.providerName,
          providerType: report.providerType,
          reason: report.reason,
        });
      }
    }

    // If queries cannot be formed (ambiguous need, greetings, undefined purpose)
    if (queries.length === 0) {
      return {
        schemes: [],
        sourceMode: 'LOCAL_FALLBACK',
        activeProviderName: 'LocalSchemeProvider',
        retrievalTimestamp,
        queriesExecuted: [],
        hasMatches: false,
        unavailableProviders,
        warnings: [
          'No specific government support domain or actionable purpose identified in citizen input.',
        ],
        sourceTrustSummaries: {},
      };
    }

    // Fallback Policy:
    // Remote providers are unconfigured in this prototype.
    // Fall back to verified LocalSchemeProvider.
    const localProvider = this.registry.getLocalFallbackProvider();
    const candidateSchemesMap: Map<string, Scheme> = new Map();
    const sourceTrustSummaries: Record<string, SchemeSource[]> = {};

    for (const query of queries) {
      const searchResult = await localProvider.search({
        query: query.searchTerms.join(' '),
        domains: [query.domain],
        goals: query.goals.map(String),
      });

      for (const scheme of searchResult.schemes) {
        // Enforce strict category match with query domain (preventing cross-contamination)
        if (scheme.category === query.domain) {
          if (!candidateSchemesMap.has(scheme.id)) {
            candidateSchemesMap.set(scheme.id, scheme);
            sourceTrustSummaries[scheme.id] = getSchemeSources(scheme);
          }
        }
      }
    }

    const candidateSchemes = Array.from(candidateSchemesMap.values());
    const hasMatches = candidateSchemes.length > 0;

    return {
      schemes: candidateSchemes,
      sourceMode: 'LOCAL_FALLBACK',
      activeProviderName: localProvider.name,
      retrievalTimestamp,
      queriesExecuted: queries,
      hasMatches,
      unavailableProviders,
      warnings,
      sourceTrustSummaries,
    };
  }
}

let retrievalEngineInstance: SchemeRetrievalEngine | null = null;

export function getSchemeRetrievalEngine(): SchemeRetrievalEngine {
  if (!retrievalEngineInstance) {
    retrievalEngineInstance = new SchemeRetrievalEngine();
  }
  return retrievalEngineInstance;
}

export async function retrieveCandidateSchemes(
  profile: NeedProfile
): Promise<SchemeRetrievalResponse> {
  return getSchemeRetrievalEngine().retrieve(profile);
}
