import type {
  DistinctNeed,
  MatchedConcept,
  NeedDomain,
  NeedExplanation,
  NeedGoal,
  NeedProfile,
  SupportType,
} from '../../types';
import { DOMAIN_CONCEPTS, GENERAL_AMBIGUOUS_PATTERNS } from './taxonomy';
import { NegationDetector } from './negationDetector';
import { ProfileExtractor } from './profileExtractor';
import { QuestionGenerator } from './questionGenerator';

export class NeedAnalyzer {
  private negationDetector = new NegationDetector();
  private profileExtractor = new ProfileExtractor();
  private questionGenerator = new QuestionGenerator();

  analyze(rawInput: string): NeedProfile {
    const text = (rawInput || '').trim();
    const warnings: string[] = [];

    // Empty input handling
    if (!text) {
      const missingAssessments = this.questionGenerator.generateMissingFields(['unknown'], [], {});
      return {
        rawInput: '',
        domains: ['unknown'],
        primaryDomain: 'unknown',
        secondaryDomains: [],
        distinctNeeds: [],
        goals: ['unspecified_support'],
        situations: [],
        desiredSupportTypes: ['general_support'],
        extractedProfile: {},
        unknownImportantFields: missingAssessments.map((a) => a.field),
        missingFieldAssessments: missingAssessments,
        confidence: 'low',
        explanation: {
          matchedConcepts: [],
          extractedFacts: [],
          unresolvedInformation: ['No input provided'],
          warnings: ['Empty input received'],
        },
      };
    }

    // 1. Detect Negations
    const negations = this.negationDetector.detectNegations(text);

    // 2. Extract Facts & Profile
    const { profile, facts } = this.profileExtractor.extract(text, negations);

    // 3. Match Taxonomy Concepts
    const matchedConcepts: MatchedConcept[] = [];

    for (const concept of DOMAIN_CONCEPTS) {
      // Check if domain is negated for self
      if (this.negationDetector.isDomainNegatedForSelf(concept.domain, negations)) {
        // Special case 1: if user says "my family farms", agriculture is NOT negated even if user is not a farmer
        const isFamilyAgriExempt =
          concept.domain === 'agriculture' && Boolean(profile.familyOccupation === 'farmer');
        // Special case 2: if a family member is the stated beneficiary (e.g. "not a student, but my daughter needs scholarship")
        const isFamilyMemberBeneficiary =
          concept.domain === 'education' &&
          /\b(?:daughter|son|child|children|sister|brother|kids?)\b/i.test(text);

        if (!isFamilyAgriExempt && !isFamilyMemberBeneficiary) {
          continue;
        }
      }

      for (const pattern of concept.patterns) {
        const match = pattern.exec(text);
        if (match) {
          matchedConcepts.push({
            term: concept.term,
            domain: concept.domain,
            goal: concept.goal,
            confidence: 0.9,
            sourcePhrase: match[0],
            negated: false,
          });
          break; // Avoid duplicate matches for same concept definition
        }
      }
    }

    // 4. Check for pure ambiguous/general input
    const isAmbiguousPattern = GENERAL_AMBIGUOUS_PATTERNS.some((p) => p.test(text));
    const nonGeneralConcepts = matchedConcepts.filter(
      (c) => c.domain !== 'unknown'
    );

    // If no concrete domain concepts matched
    if (nonGeneralConcepts.length === 0) {
      const isPureFinancial =
        /\b(?:money|financial\s+help|financial\s+support|₹\s*\d+|\d+\s*lakh)\b/i.test(text);

      const goals: NeedGoal[] = isPureFinancial
        ? ['financial_assistance']
        : ['unspecified_support'];

      const supportTypes: SupportType[] = isPureFinancial
        ? ['financial_grant', 'loan_or_credit']
        : ['general_support'];

      const missingAssessments = this.questionGenerator.generateMissingFields(
        ['unknown'],
        goals,
        profile
      );

      const unresolved = ['Specific purpose of government assistance is not identified'];
      if (profile.targetFinancialAmount) {
        unresolved.push(`Requested amount ₹${profile.targetFinancialAmount} detected, but objective is unknown`);
      }

      return {
        rawInput: text,
        domains: ['unknown'],
        primaryDomain: 'unknown',
        secondaryDomains: [],
        distinctNeeds: [],
        goals,
        situations: isAmbiguousPattern ? ['Ambiguous or general citizen inquiry'] : [],
        desiredSupportTypes: supportTypes,
        extractedProfile: profile,
        unknownImportantFields: missingAssessments.map((a) => a.field),
        missingFieldAssessments: missingAssessments,
        confidence: 'low',
        explanation: {
          matchedConcepts,
          extractedFacts: facts,
          unresolvedInformation: unresolved,
          warnings: isAmbiguousPattern
            ? ['Citizen expressed a general assistance request without specific domain indicators']
            : ['No recognized domain concepts found'],
        },
      };
    }

    // 5. Contextual Resolution & Multi-Domain Clustering
    const domainsSet = new Set<NeedDomain>();
    const goalsSet = new Set<NeedGoal>();
    const supportTypesSet = new Set<SupportType>();
    const situations: string[] = [];

    // Group matched concepts by domain
    const domainGroups = new Map<NeedDomain, MatchedConcept[]>();
    for (const concept of nonGeneralConcepts) {
      domainsSet.add(concept.domain);
      if (concept.goal) goalsSet.add(concept.goal);

      const group = domainGroups.get(concept.domain) || [];
      group.push(concept);
      domainGroups.set(concept.domain, group);
    }

    // Contextual handling: "I am a student and need financial help"
    // Financial help in an educational context maps to fee_assistance / scholarship
    const hasEducation = domainsSet.has('education');
    const mentionsFinancialHelp = /\b(?:financial\s+help|financial\s+support|can'?t\s+afford|fees?|money)\b/i.test(text);
    if (hasEducation && mentionsFinancialHelp) {
      goalsSet.add('fee_assistance');
      supportTypesSet.add('financial_grant');
      supportTypesSet.add('fee_waiver');
    }

    // Contextual handling: Skill development vs Employment
    if (domainsSet.has('skill_development')) {
      supportTypesSet.add('training_or_coaching');
    }
    if (domainsSet.has('business')) {
      supportTypesSet.add('loan_or_credit');
      if (goalsSet.has('equipment')) {
        supportTypesSet.add('subsidized_equipment');
      }
    }
    if (domainsSet.has('agriculture')) {
      if (goalsSet.has('equipment') || goalsSet.has('irrigation')) {
        supportTypesSet.add('subsidized_equipment');
      }
      if (goalsSet.has('crop_support') || goalsSet.has('energy_cost') || goalsSet.has('seeds')) {
        supportTypesSet.add('financial_grant');
      }
    }

    // Build distinct needs for multiple needs preservation
    const distinctNeeds: DistinctNeed[] = [];
    for (const [domain, concepts] of domainGroups.entries()) {
      const domainGoals: NeedGoal[] = Array.from(
        new Set(concepts.map((c) => c.goal).filter(Boolean) as NeedGoal[])
      );

      // Default goal if none specific
      if (domainGoals.length === 0) {
        if (domain === 'education') domainGoals.push('scholarship');
        else if (domain === 'agriculture') domainGoals.push('crop_support');
        else if (domain === 'business') domainGoals.push('start_business');
        else if (domain === 'employment') domainGoals.push('find_job');
      }

      const domainSupportTypes: SupportType[] = [];
      if (domain === 'education') domainSupportTypes.push('financial_grant', 'fee_waiver');
      else if (domain === 'agriculture') domainSupportTypes.push('subsidized_equipment', 'financial_grant');
      else if (domain === 'business') domainSupportTypes.push('loan_or_credit', 'subsidized_equipment');
      else if (domain === 'employment' || domain === 'skill_development') domainSupportTypes.push('training_or_coaching');
      else domainSupportTypes.push('general_support');

      let contextSummary = `Citizen indicated ${domain} intent`;
      if (domain === 'agriculture' && profile.familyOccupation === 'farmer') {
        contextSummary = 'Family farming context identified';
      } else if (domain === 'education' && profile.studentStatus === 'student') {
        contextSummary = 'Current student educational context identified';
      } else if (domain === 'business' && profile.businessStatus === 'existing') {
        contextSummary = 'Existing business expansion / equipment context identified';
      } else if (domain === 'business' && profile.businessStatus === 'new') {
        contextSummary = 'New business creation context identified';
      }

      distinctNeeds.push({
        domain,
        goals: domainGoals,
        desiredSupportTypes: domainSupportTypes,
        contextSummary,
      });

      situations.push(contextSummary);
    }

    // Sort domains: if agriculture is present purely due to family context (e.g. familyOccupation === 'farmer' and occupation !== 'farmer'),
    // deprioritize agriculture so the citizen's own stated need (e.g. education) becomes primaryDomain.
    const domains = Array.from(domainsSet).sort((a, b) => {
      if (profile.familyOccupation === 'farmer' && profile.occupation !== 'farmer') {
        if (a === 'agriculture') return 1;
        if (b === 'agriculture') return -1;
      }
      return 0;
    });
    const goals = Array.from(goalsSet);
    const desiredSupportTypes = Array.from(supportTypesSet);

    // Primary domain is the first action domain, secondary are the remainder
    const primaryDomain = domains[0] || 'unknown';
    const secondaryDomains = domains.slice(1);

    // Generate targeted missing fields
    const missingAssessments = this.questionGenerator.generateMissingFields(
      domains,
      goals,
      profile
    );

    // Explanation & Debug metadata
    const unresolved: string[] = [];
    if (!profile.state) unresolved.push('State of residence or location is unknown');
    if (domains.includes('education') && profile.annualFamilyIncome === undefined) {
      unresolved.push('Annual family income not specified');
    }
    if (domains.includes('business') && !profile.businessStatus) {
      unresolved.push('Unclear whether business is new or existing enterprise');
    }

    const explanation: NeedExplanation = {
      matchedConcepts,
      extractedFacts: facts,
      unresolvedInformation: unresolved,
      warnings,
    };

    return {
      rawInput: text,
      domains,
      primaryDomain,
      secondaryDomains,
      distinctNeeds,
      goals,
      situations,
      desiredSupportTypes: desiredSupportTypes.length > 0 ? desiredSupportTypes : ['general_support'],
      extractedProfile: profile,
      unknownImportantFields: missingAssessments.map((a) => a.field),
      missingFieldAssessments: missingAssessments,
      confidence: domains.length > 0 ? 'high' : 'medium',
      explanation,
    };
  }
}
