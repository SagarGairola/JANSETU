import type { Scheme } from '../../types';
import type { DocumentReadinessItem, DocumentReadinessStatus } from './types';

export function evaluateDocumentReadiness(
  scheme: Scheme,
  documentOverrides: Record<string, 'available' | 'missing' | 'needs_verification'> = {}
): DocumentReadinessItem[] {
  const items: DocumentReadinessItem[] = [];

  for (const doc of scheme.requiredDocuments) {
    const rawStatus = documentOverrides[doc.id] || doc.currentStatus;
    let status: DocumentReadinessStatus;

    switch (rawStatus) {
      case 'available':
        status = 'AVAILABLE';
        break;
      case 'missing':
        status = 'MISSING';
        break;
      case 'needs_verification':
        status = 'UNKNOWN'; // Document exists but requires linkage/verification
        break;
      default:
        status = 'UNKNOWN';
        break;
    }

    items.push({
      id: doc.id,
      name: doc.name,
      purpose: doc.purpose,
      status,
      isMandatory: doc.isMandatory,
      issuingAuthority: doc.issuingAuthority,
      notes: doc.notes,
      estimatedTurnaroundDays: doc.estimatedTurnaroundDays,
      isHeavyDocument: doc.isHeavyDocument,
      frictionTier: doc.frictionTier,
    });
  }

  return items;
}
