import { LocalSchemeProvider } from './localSchemeProvider';
import { MySchemeProvider } from './mySchemeProvider';
import type { SchemeProvider } from './types';

let localProviderInstance: LocalSchemeProvider | null = null;

export type ProviderSelection = 'local' | 'myscheme';

/**
 * Factory to retrieve the designated SchemeProvider instance.
 * Defaults strictly to LocalSchemeProvider for deterministic, verified local execution.
 */
export function getSchemeProvider(type: ProviderSelection = 'local'): SchemeProvider {
  switch (type) {
    case 'myscheme':
      return new MySchemeProvider();
    case 'local':
    default:
      if (!localProviderInstance) {
        localProviderInstance = new LocalSchemeProvider();
      }
      return localProviderInstance;
  }
}
