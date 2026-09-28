import { SAMPLE_SCHEMES } from '../../data/mockSchemes';
import type { Scheme } from '../../types';
import type { SchemeProvider, SchemeSearchRequest, SchemeSearchResult } from './types';

export class LocalSchemeProvider implements SchemeProvider {
  readonly name = 'LocalSchemeProvider';
  readonly type = 'local' as const;

  async search(request: SchemeSearchRequest = {}): Promise<SchemeSearchResult> {
    const { query, domains, goals, maxResults } = request;

    let results: Scheme[] = [...SAMPLE_SCHEMES];

    // Filter by domains if provided and non-empty
    if (domains && domains.length > 0) {
      const lowerDomains = domains.map((d) => d.toLowerCase());
      results = results.filter((scheme) =>
        lowerDomains.includes(scheme.category.toLowerCase())
      );
    }

    // Filter or match by query if provided
    if (query && query.trim().length > 0) {
      const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
      results = results.filter((scheme) => {
        const searchableText = [
          scheme.name,
          scheme.shortPurpose,
          scheme.benefitSummary,
          scheme.targetAudience,
          scheme.category,
          scheme.whyRelevantDefault || '',
          ...(scheme.worthCheckingPoints || []),
          ...(scheme.goals || []),
        ]
          .join(' ')
          .toLowerCase();

        // Match if any query token is found in the searchable text
        return queryTokens.some((token) => searchableText.includes(token));
      });
    }

    // Filter or match by goals if provided
    if (goals && goals.length > 0) {
      const lowerGoals = goals.map((g) => g.toLowerCase());
      results = results.filter((scheme) => {
        const searchableText = [
          scheme.shortPurpose,
          scheme.benefitSummary,
          scheme.targetAudience,
          ...(scheme.goals || []),
        ]
          .join(' ')
          .toLowerCase();

        return lowerGoals.some((g) => searchableText.includes(g));
      });
    }

    const totalCount = results.length;
    const finalSchemes =
      typeof maxResults === 'number' && maxResults > 0
        ? results.slice(0, maxResults)
        : results;

    return {
      schemes: finalSchemes,
      providerName: this.name,
      providerType: this.type,
      retrievalTimestamp: new Date().toISOString(),
      isVerified: true,
      totalCount,
    };
  }

  async getById(id: string): Promise<Scheme | null> {
    if (!id) return null;
    const found = SAMPLE_SCHEMES.find((scheme) => scheme.id === id);
    return found ? { ...found } : null;
  }
}
