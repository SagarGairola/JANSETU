import type {
  ExtractedCitizenProfile,
  ExtractedFact,
} from '../../types';
import { INDIAN_STATES } from './taxonomy';
import type { NegatedConcept } from './negationDetector';

export class ProfileExtractor {
  extract(text: string, negations: NegatedConcept[]): {
    profile: ExtractedCitizenProfile;
    facts: ExtractedFact[];
  } {
    const profile: ExtractedCitizenProfile = {};
    const facts: ExtractedFact[] = [];

    const isFarmerNegated = negations.some(
      (n) => n.term === 'farmer' || n.term === 'farming'
    );
    const isStudentNegated = negations.some((n) => n.term === 'student');
    const isUnemployedNegated = negations.some((n) => n.term === 'unemployed');

    // 1. AGE EXTRACTION
    const ageMatch =
      /\b(?:i(?:'m| am)|age(?:\s+is)?)\s*([1-9][0-9])\b/i.exec(text) ||
      /\b([1-9][0-9])\s*(?:years?\s+old|yrs?\s+old)\b/i.exec(text);

    if (ageMatch) {
      const parsedAge = parseInt(ageMatch[1], 10);
      if (parsedAge >= 12 && parsedAge <= 100) {
        profile.age = parsedAge;
        facts.push({
          field: 'age',
          value: parsedAge,
          sourceText: ageMatch[0],
          confidence: 0.95,
        });
      }
    }

    // 2. STATE EXTRACTION
    for (const state of INDIAN_STATES) {
      const regex = new RegExp(`\\b${state}\\b`, 'i');
      const match = regex.exec(text);
      if (match) {
        profile.state = state;
        facts.push({
          field: 'state',
          value: state,
          sourceText: match[0],
          confidence: 0.95,
        });
        break;
      }
    }

    if (!profile.state) {
      if (/\b(?:up|u\.p\.)\b/i.test(text) && !/\b(?:set\s+up|sign\s+up|pick\s+up|grown?\s+up|give\s+up|start\s+up|startup)\b/i.test(text)) {
        profile.state = 'Uttar Pradesh';
        facts.push({
          field: 'state',
          value: 'Uttar Pradesh',
          sourceText: 'UP',
          confidence: 0.9,
        });
      }
    }

    // 3. STUDENT STATUS & EDUCATION
    if (!isStudentNegated) {
      const studentMatch =
        /\b(?:i(?:'m| am)?\s+(?:a\s+)?student|studying|enrolled|got admission|admission into college|in college|in school|(?:my\s+)?studies)\b/i.exec(text);
      if (studentMatch) {
        profile.studentStatus = 'student';
        facts.push({
          field: 'studentStatus',
          value: 'student',
          sourceText: studentMatch[0],
          confidence: 0.9,
        });
      }
    } else {
      profile.studentStatus = 'not_student';
      facts.push({
        field: 'studentStatus',
        value: 'not_student',
        sourceText: 'Negated student expression',
        confidence: 0.9,
      });
    }

    const educationDegreeMatch =
      /\b(b\.?tech|m\.?tech|mbbs|b\.?com|b\.?sc|ba|m\.?sc|m\.?com|diploma|iti|10th|12th|matric|post-matric|higher secondary|graduate|post-graduate|college)\b/i.exec(text);
    if (educationDegreeMatch) {
      profile.educationLevel = educationDegreeMatch[1].toUpperCase();
      facts.push({
        field: 'educationLevel',
        value: profile.educationLevel,
        sourceText: educationDegreeMatch[0],
        confidence: 0.9,
      });
    }

    // 4. EMPLOYMENT STATUS
    if (!isUnemployedNegated) {
      const unemployedMatch =
        /\b(?:i(?:'m| am)?\s+unemployed|unemployed|without a job|jobless|looking for a job|need a job)\b/i.exec(text);
      if (unemployedMatch) {
        profile.employmentStatus = 'unemployed';
        facts.push({
          field: 'employmentStatus',
          value: 'unemployed',
          sourceText: unemployedMatch[0],
          confidence: 0.9,
        });
      }
    }

    // 5. FAMILY & OCCUPATION CONTEXT
    const familyFarmMatch =
      /\b(?:my\s+family\s+farms|father\s+farms|father\s+is\s+(?:a\s+)?farmer|parents\s+are\s+farmers|family\s+is\s+farming|(?:(?:father|family|parents)\s+is\b.*farmer|farmer.*(?:father|family|parents)\s+is\b))\b/i.exec(text);
    if (familyFarmMatch) {
      profile.familyOccupation = 'farmer';
      facts.push({
        field: 'familyOccupation',
        value: 'farmer',
        sourceText: familyFarmMatch[0],
        confidence: 0.9,
      });
    } else if (!isFarmerNegated) {
      const selfFarmerMatch =
        /\b(?:i(?:'m| am)?\s+(?:a\s+)?(?:small\s+)?farmer|i\s+farm|my\s+farm|for\s+my\s+farm)\b/i.exec(text);
      if (selfFarmerMatch) {
        profile.occupation = 'farmer';
        facts.push({
          field: 'occupation',
          value: 'farmer',
          sourceText: selfFarmerMatch[0],
          confidence: 0.85,
        });
      }
    }

    const householdWorkerMatch =
      /\b(?:(?:my\s+)?mother\s+is\s+(?:a\s+)?(?:household\s+worker|domestic\s+worker|house\s+maid|maid)|household\s+worker|domestic\s+worker|house\s+maid|maid)\b/i.exec(text);
    if (householdWorkerMatch) {
      if (/\b(?:mother|family)\b/i.test(householdWorkerMatch[0]) || /\b(?:for\s+her|my\s+mother)\b/i.test(text)) {
        profile.familyOccupation = 'household_worker';
        facts.push({
          field: 'familyOccupation',
          value: 'household_worker',
          sourceText: householdWorkerMatch[0],
          confidence: 0.9,
        });
      } else {
        profile.occupation = 'household_worker';
        facts.push({
          field: 'occupation',
          value: 'household_worker',
          sourceText: householdWorkerMatch[0],
          confidence: 0.9,
        });
      }
    }

    const tailoringMatch = /\b(?:know\s+tailoring|tailor|tailoring\s+work|tailoring\s+shop)\b/i.exec(text);
    if (tailoringMatch) {
      profile.occupation = 'tailor';
      profile.businessType = 'tailoring';
      facts.push({
        field: 'occupation',
        value: 'tailor',
        sourceText: tailoringMatch[0],
        confidence: 0.85,
      });
    }

    // 6. BUSINESS STATUS (NEW VS EXISTING)
    const newBizMatch =
      /\b(?:start(?:ing)?|open(?:ing)?|begin|launch|set up)\s+(?:a\s+|an\s+)?(?:small\s+)?(?:business|shop|store|enterprise|venture|unit)|start something small\b/i.exec(text);
    const existingBizMatch =
      /\b(?:expand(?:ing)?|scale up|upgrade)\s+(?:my\s+|our\s+|the\s+)?(?:business|shop|workshop|store|it)|already (?:run|have)|currently run|running a (?:small\s+)?(?:shop|business)|for my work\b/i.exec(text);

    if (existingBizMatch) {
      profile.businessStatus = 'existing';
      facts.push({
        field: 'businessStatus',
        value: 'existing',
        sourceText: existingBizMatch[0],
        confidence: 0.85,
      });
    } else if (newBizMatch) {
      profile.businessStatus = 'new';
      facts.push({
        field: 'businessStatus',
        value: 'new',
        sourceText: newBizMatch[0],
        confidence: 0.85,
      });
    }

    // 7. LOCATION CONTEXT: RURAL
    const ruralMatch = /\b(?:village|rural|panchayat|gram)\b/i.exec(text);
    if (ruralMatch) {
      profile.isRural = true;
      facts.push({
        field: 'isRural',
        value: true,
        sourceText: ruralMatch[0],
        confidence: 0.8,
      });
    }

    // 8. FINANCIAL AMOUNTS: INCOME VS TARGET REQUEST AMOUNT
    this.extractFinancialAmounts(text, profile, facts);

    return { profile, facts };
  }

  private extractFinancialAmounts(
    text: string,
    profile: ExtractedCitizenProfile,
    facts: ExtractedFact[]
  ): void {
    // A. Annual Family Income patterns
    // e.g. "earns around ₹3 lakh a year", "income is ₹2.5 lakh", "family income 300000"
    const incomePattern =
      /\b(?:family\s+earns|income\s+is|earns|family\s+income|annual\s+income)(?:\s+around|\s+about|\s+of)?\s*(?:rs\.?|inr|₹)?\s*([0-9]+(?:\.[0-9]+)?)\s*(lakh|lac|lacs|lakhs|k|thousand|crore|cr)?(?:\s+(?:a\s+year|annually|per\s+annum|yearly))?\b/i;
    
    const incomeMatch = incomePattern.exec(text);
    if (incomeMatch) {
      const parsedValue = this.parseIndianNumber(incomeMatch[1], incomeMatch[2]);
      if (parsedValue > 0) {
        profile.annualFamilyIncome = parsedValue;
        facts.push({
          field: 'annualFamilyIncome',
          value: parsedValue,
          sourceText: incomeMatch[0],
          confidence: 0.9,
        });
      }
    }

    // B. Target Requested Amount patterns (e.g. "I need ₹2 lakh", "want 50000", "loan of ₹1 lakh", "give me 50000 loan")
    const targetAmountPattern =
      /\b(?:need|want|require|looking for|loan of|grant of|give\s+(?:me\s+)?)\s*(?:rs\.?|inr|₹)?\s*([0-9]+(?:\.[0-9]+)?)\s*(lakh|lac|lacs|lakhs|k|thousand|crore|cr)?\b|\b([0-9]{4,})\s*(?:loan|grant|credit|assistance)\b|\b(?:rs\.?|inr|₹)\s*([0-9]+(?:\.[0-9]+)?)\s*(lakh|lac|lacs|lakhs|k|thousand|crore|cr)?\b/i;

    const targetMatch = targetAmountPattern.exec(text);
    // Ensure we don't accidentally treat income as target amount
    if (targetMatch && (!incomeMatch || targetMatch.index !== incomeMatch.index)) {
      const numStr = targetMatch[1] || targetMatch[3] || targetMatch[4];
      const unitStr = targetMatch[2] || targetMatch[5];
      if (numStr) {
        const parsedValue = this.parseIndianNumber(numStr, unitStr);
        if (parsedValue > 0 && parsedValue !== profile.annualFamilyIncome) {
          profile.targetFinancialAmount = parsedValue;
          facts.push({
            field: 'targetFinancialAmount',
            value: parsedValue,
            sourceText: targetMatch[0],
            confidence: 0.85,
          });
        }
      }
    }
  }

  private parseIndianNumber(numStr: string, unitStr?: string): number {
    const base = parseFloat(numStr);
    if (isNaN(base)) return 0;

    const unit = (unitStr || '').toLowerCase();
    if (unit.startsWith('lakh') || unit.startsWith('lac')) {
      return Math.round(base * 100000);
    }
    if (unit.startsWith('cr') || unit.startsWith('crore')) {
      return Math.round(base * 10000000);
    }
    if (unit.startsWith('k') || unit.startsWith('thousand')) {
      return Math.round(base * 1000);
    }

    // Raw number without unit: e.g. 200000, 50000
    return Math.round(base);
  }
}
