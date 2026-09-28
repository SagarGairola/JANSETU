import type { SchemeProvider } from '../schemeProviders/types';
import { LocalSchemeProvider } from '../schemeProviders/localSchemeProvider';
import { MySchemeProvider } from '../schemeProviders/mySchemeProvider';
import type { ProviderTrustReport } from './types';

export interface RegisteredProviderEntry {
  id: string;
  provider: SchemeProvider;
  isRemote: boolean;
  isAvailable: boolean;
  unavailabilityReason?: string;
}

export class ProviderRegistry {
  private providers: Map<string, RegisteredProviderEntry> = new Map();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    // 1. Verified Local Fallback Provider
    this.providers.set('local_fallback', {
      id: 'local_fallback',
      provider: new LocalSchemeProvider(),
      isRemote: false,
      isAvailable: true,
    });

    // 2. Official MyScheme Integration Adapter (Unconfigured Placeholder)
    // Truth-in-engineering rule: Check whether environment or runtime holds authorized credentials.
    // In this offline/isolated prototype, credentials are not present.
    this.providers.set('myscheme_api', {
      id: 'myscheme_api',
      provider: new MySchemeProvider(),
      isRemote: true,
      isAvailable: false,
      unavailabilityReason:
        'Authorized MyScheme API access is not configured. Live credentials and API Setu endpoints are not enabled in this prototype.',
    });
  }

  getProvider(id: string): RegisteredProviderEntry | undefined {
    return this.providers.get(id);
  }

  getLocalFallbackProvider(): SchemeProvider {
    const entry = this.providers.get('local_fallback');
    if (!entry) {
      return new LocalSchemeProvider();
    }
    return entry.provider;
  }

  getTrustReports(): ProviderTrustReport[] {
    const reports: ProviderTrustReport[] = [];
    for (const entry of this.providers.values()) {
      reports.push({
        providerName: entry.provider.name,
        providerType: entry.provider.type,
        isConfigured: entry.isAvailable,
        isVerified: !entry.isRemote,
        reason: entry.unavailabilityReason,
      });
    }
    return reports;
  }
}

let registryInstance: ProviderRegistry | null = null;

export function getProviderRegistry(): ProviderRegistry {
  if (!registryInstance) {
    registryInstance = new ProviderRegistry();
  }
  return registryInstance;
}
