import type { Scheme } from '../../types';

export type ProviderType = 'local' | 'myscheme_api' | 'external' | 'hybrid';

export interface SchemeSearchRequest {
  query?: string;
  domains?: Array<'education' | 'agriculture' | 'healthcare' | 'business' | 'social_welfare' | string>;
  goals?: string[];
  location?: {
    state?: string;
    district?: string;
  };
  occupation?: string;
  age?: number;
  gender?: string;
  category?: string;
  income?: number | string;
  education?: string;
  studentStatus?: string;
  structuredContext?: Record<string, unknown>;
  maxResults?: number;
}

export interface SchemeSearchResult {
  schemes: Scheme[];
  providerName: string;
  providerType: ProviderType;
  retrievalTimestamp: string;
  isVerified: boolean;
  totalCount: number;
  sourceMetadata?: Record<string, unknown>;
  warnings?: string[];
  errors?: string[];
}

export interface SchemeProvider {
  readonly name: string;
  readonly type: ProviderType;
  search(request: SchemeSearchRequest): Promise<SchemeSearchResult>;
  getById(id: string): Promise<Scheme | null>;
}
