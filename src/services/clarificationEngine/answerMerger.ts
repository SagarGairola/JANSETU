import type { NeedProfile } from '../../types';
import { understandCitizenNeed } from '../needEngine';

export class AnswerMerger {
  /**
   * Safely merges a clarification answer into an existing NeedProfile.
   * Preserves original rawInput, prior facts, and previous answers while enriching the profile.
   */
  mergeAnswer(
    currentProfile: NeedProfile,
    field: string,
    answer: string
  ): NeedProfile {
    if (!answer || !answer.trim()) {
      return currentProfile;
    }

    const trimmedAnswer = answer.trim();

    // 1. If purpose was answered, re-analyze with the clarified purpose context
    if (field === 'purpose_of_support') {
      const enrichedText = `${currentProfile.rawInput} (Clarified Need: ${trimmedAnswer})`;
      const reanalyzed = understandCitizenNeed(enrichedText);

      // Preserve original rawInput and previous facts
      return {
        ...reanalyzed,
        rawInput: currentProfile.rawInput,
        extractedProfile: {
          ...currentProfile.extractedProfile,
          ...reanalyzed.extractedProfile,
        },
      };
    }

    // 2. Direct field merge
    const updatedProfile = { ...currentProfile.extractedProfile };
    if (field === 'state') {
      updatedProfile.state = trimmedAnswer;
    } else if (field === 'annualFamilyIncome') {
      const parsed = parseInt(trimmedAnswer.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsed)) {
        updatedProfile.annualFamilyIncome = parsed;
      }
    } else if (field === 'businessStatus') {
      if (trimmedAnswer.toLowerCase().includes('new')) {
        updatedProfile.businessStatus = 'new';
      } else if (trimmedAnswer.toLowerCase().includes('expand') || trimmedAnswer.toLowerCase().includes('exist')) {
        updatedProfile.businessStatus = 'existing';
      }
    } else {
      updatedProfile.otherFacts = {
        ...(updatedProfile.otherFacts || {}),
        [field]: trimmedAnswer,
      };
    }

    return {
      ...currentProfile,
      extractedProfile: updatedProfile,
      unknownImportantFields: currentProfile.unknownImportantFields.filter(
        (f) => f !== field
      ),
      missingFieldAssessments: currentProfile.missingFieldAssessments.filter(
        (a) => a.field !== field
      ),
    };
  }
}
