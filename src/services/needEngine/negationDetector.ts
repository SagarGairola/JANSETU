export interface NegatedConcept {
  term: string;
  targetDomain?: string;
  subject: 'self' | 'other' | 'general';
  rawMatch: string;
}

const NEGATION_PATTERNS: Array<{
  pattern: RegExp;
  term: string;
  domain?: string;
  subject: 'self' | 'other' | 'general';
}> = [
  // Agriculture negation
  {
    pattern: /\b(?:i(?:'m| am| was)?\s+)?(?:not|never|neither)\s+(?:a\s+)?farmer\b/i,
    term: 'farmer',
    domain: 'agriculture',
    subject: 'self',
  },
  {
    pattern: /\b(?:do not|don'?t)\s+(?:farm|do farming|have (?:a )?farm)\b/i,
    term: 'farming',
    domain: 'agriculture',
    subject: 'self',
  },
  {
    pattern: /\b(?:no|without|zero)\s+(?:agricultural\s+)?land(?:holding)?\b/i,
    term: 'landholding',
    domain: 'agriculture',
    subject: 'self',
  },
  {
    pattern: /\bnon[- ](?:agricultural|farming)\b/i,
    term: 'farming',
    domain: 'agriculture',
    subject: 'general',
  },

  // Education negation
  {
    pattern: /\b(?:i(?:'m| am)?\s+)?(?:not|never)\s+(?:a\s+)?student\b/i,
    term: 'student',
    domain: 'education',
    subject: 'self',
  },
  {
    pattern: /\bnot\s+(?:studying|in college|in school|for education)\b/i,
    term: 'student',
    domain: 'education',
    subject: 'self',
  },

  // Business negation
  {
    pattern: /\b(?:i(?:'m| am)?\s+)?(?:not|never)\s+(?:a\s+)?(?:business(?:man)?|entrepreneur|trader)\b/i,
    term: 'business',
    domain: 'business',
    subject: 'self',
  },
  {
    pattern: /\bnot\s+(?:starting|doing|running)\s+(?:a\s+)?business\b/i,
    term: 'business',
    domain: 'business',
    subject: 'self',
  },

  // Employment negation
  {
    pattern: /\bnot\s+unemployed\b/i,
    term: 'unemployed',
    domain: 'employment',
    subject: 'self',
  },

  // Loan vs Grant negation
  {
    pattern: /\bnot\s+(?:looking for|wanting|asking for)\s+(?:a\s+)?(?:loan|credit|debt)\b/i,
    term: 'loan',
    domain: 'business',
    subject: 'self',
  },
];

export class NegationDetector {
  /**
   * Identifies all negated concepts present in the text.
   */
  detectNegations(text: string): NegatedConcept[] {
    const negations: NegatedConcept[] = [];

    for (const item of NEGATION_PATTERNS) {
      const match = item.pattern.exec(text);
      if (match) {
        negations.push({
          term: item.term,
          targetDomain: item.domain,
          subject: item.subject,
          rawMatch: match[0],
        });
      }
    }

    return negations;
  }

  /**
   * Checks whether a specific domain is negated for 'self'.
   */
  isDomainNegatedForSelf(domain: string, negations: NegatedConcept[]): boolean {
    return negations.some(
      (n) => n.targetDomain === domain && (n.subject === 'self' || n.subject === 'general')
    );
  }

  /**
   * Checks whether a specific term (e.g. 'farmer', 'student') is negated for 'self'.
   */
  isTermNegatedForSelf(term: string, negations: NegatedConcept[]): boolean {
    return negations.some(
      (n) =>
        n.term.toLowerCase() === term.toLowerCase() &&
        (n.subject === 'self' || n.subject === 'general')
    );
  }
}
