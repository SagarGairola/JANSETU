import type { Scheme, NeedDomain, NeedGoal, SchemeSource } from '../../types';

export type ProviderSourceMode =
  | 'LOCAL_FALLBACK'
  | 'AUTHORIZED_REMOTE'
  | 'EXTERNAL_VERIFIED'
  | 'UNAVAILABLE';

export interface BeneficiaryContext {
  isUserBeneficiary: boolean;
  familyRole?: string;
  studentStatus?: string;
  occupation?: string;
  familyOccupation?: string;
  employmentStatus?: string;
  businessStatus?: string;
}

export interface RetrievalQuery {
  intentId: string;
  naturalLanguageQuery: string;
  domain: NeedDomain;
  goals: NeedGoal[];
  location?: {
    state?: string;
    district?: string;
  };
  beneficiaryContext?: BeneficiaryContext;
  searchTerms: string[];
  originatingNeed?: string;
}

export interface ProviderTrustReport {
  providerName: string;
  providerType: string;
  isConfigured: boolean;
  isVerified: boolean;
  reason?: string;
}

export interface SchemeRetrievalResponse {
  schemes: Scheme[];
  sourceMode: ProviderSourceMode;
  activeProviderName: string;
  retrievalTimestamp: string;
  queriesExecuted: RetrievalQuery[];
  hasMatches: boolean;
  unavailableProviders: Array<{
    providerName: string;
    providerType: string;
    reason: string;
  }>;
  warnings: string[];
  sourceTrustSummaries: Record<string, SchemeSource[]>;
}
