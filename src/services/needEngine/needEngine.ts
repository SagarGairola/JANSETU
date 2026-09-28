import type { NeedProfile } from '../../types';
import { NeedAnalyzer } from './needAnalyzer';

export class NeedUnderstandingEngine {
  private analyzer = new NeedAnalyzer();

  understandNeed(rawInput: string): NeedProfile {
    return this.analyzer.analyze(rawInput);
  }
}

let engineInstance: NeedUnderstandingEngine | null = null;

export function getNeedEngine(): NeedUnderstandingEngine {
  if (!engineInstance) {
    engineInstance = new NeedUnderstandingEngine();
  }
  return engineInstance;
}

export function understandCitizenNeed(rawInput: string): NeedProfile {
  return getNeedEngine().understandNeed(rawInput);
}
