import type { Scheme, SchemeSource } from '../../types';

export interface SourceValidationResult {
  isValid: boolean;
  official: boolean;
  warnings: string[];
}

export function validateSchemeSource(source: SchemeSource): SourceValidationResult {
  const warnings: string[] = [];

  if (!source.url || !source.url.startsWith('https://')) {
    warnings.push('Source URL should use secure HTTPS protocol.');
  }

  if (!source.title || source.title.trim().length === 0) {
    warnings.push('Source title is missing.');
  }

  // Civic-tech honesty rule: Do NOT accept invented or speculative dates
  if (source.lastVerified && isNaN(Date.parse(source.lastVerified))) {
    warnings.push('Invalid verification date format provided.');
  }

  return {
    isValid: warnings.length === 0,
    official: source.official ?? false,
    warnings,
  };
}

export function getSchemeSources(scheme: Scheme): SchemeSource[] {
  if (scheme.sources && scheme.sources.length > 0) {
    return scheme.sources;
  }

  // Construct truthful baseline source from officialPortalUrl if sources array not explicitly populated
  if (scheme.officialPortalUrl) {
    return [
      {
        url: scheme.officialPortalUrl,
        title: scheme.officialPortalName || 'Official Scheme Portal',
        authority: scheme.ministryOrDepartment,
        sourceType: 'official_portal',
        official: true,
      },
    ];
  }

  return [];
}
