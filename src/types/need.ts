export type NeedDomain =
  | 'education'
  | 'agriculture'
  | 'employment'
  | 'skill_development'
  | 'business'
  | 'housing'
  | 'healthcare'
  | 'women'
  | 'child'
  | 'disability'
  | 'senior_citizen'
  | 'social_security'
  | 'social_welfare'
  | 'rural_development'
  | 'other'
  | 'unknown';

export type AgricultureGoal =
  | 'equipment'
  | 'irrigation'
  | 'crop_support'
  | 'seeds'
  | 'fertilizer'
  | 'insurance'
  | 'income_support'
  | 'livestock'
  | 'land'
  | 'energy_cost';

export type EducationGoal =
  | 'scholarship'
  | 'fee_assistance'
  | 'hostel'
  | 'books'
  | 'education_loan'
  | 'coaching'
  | 'skill_training'
  | 'student_employment';

export type BusinessGoal =
  | 'start_business'
  | 'expand_business'
  | 'equipment'
  | 'working_capital'
  | 'credit'
  | 'market_support'
  | 'training';

export type EmploymentGoal =
  | 'find_job'
  | 'apprenticeship'
  | 'skill_training'
  | 'self_employment'
  | 'entrepreneurship';

export type GeneralGoal =
  | 'financial_assistance'
  | 'medical_treatment'
  | 'housing_support'
  | 'pension'
  | 'unspecified_support';

export type NeedGoal =
  | AgricultureGoal
  | EducationGoal
  | BusinessGoal
  | EmploymentGoal
  | GeneralGoal
  | string;

export type SupportType =
  | 'financial_grant'
  | 'loan_or_credit'
  | 'subsidized_equipment'
  | 'fee_waiver'
  | 'training_or_coaching'
  | 'insurance_coverage'
  | 'pension_or_stipend'
  | 'infrastructure_or_housing'
  | 'general_support';

export type QuestionPriority = 'critical' | 'high' | 'optional';

export interface MissingFieldAssessment {
  field: string;
  label: string;
  reason: string;
  priority: QuestionPriority;
  suggestedInputType?: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
}

export interface ExtractedCitizenProfile {
  age?: number;
  gender?: 'male' | 'female' | 'transgender' | 'other';
  category?: 'SC' | 'ST' | 'OBC' | 'General' | 'Minority' | string;
  state?: string;
  district?: string;
  occupation?: string;
  familyOccupation?: string;
  educationLevel?: string;
  studentStatus?: 'student' | 'not_student' | 'unknown';
  employmentStatus?: 'employed' | 'unemployed' | 'self_employed' | 'unknown';
  annualFamilyIncome?: number;
  targetFinancialAmount?: number;
  businessStatus?: 'new' | 'existing' | 'unknown';
  businessType?: string;
  hasLandholding?: boolean;
  isRural?: boolean;
  otherFacts?: Record<string, unknown>;
}

export interface MatchedConcept {
  term: string;
  domain: NeedDomain;
  goal?: NeedGoal;
  confidence: number;
  sourcePhrase: string;
  negated?: boolean;
}

export interface ExtractedFact {
  field: string;
  value: unknown;
  sourceText: string;
  confidence: number;
}

export interface NeedExplanation {
  matchedConcepts: MatchedConcept[];
  extractedFacts: ExtractedFact[];
  unresolvedInformation: string[];
  warnings: string[];
}

export interface DistinctNeed {
  domain: NeedDomain;
  goals: NeedGoal[];
  desiredSupportTypes: SupportType[];
  contextSummary: string;
}

export interface NeedProfile {
  rawInput: string;
  domains: NeedDomain[];
  primaryDomain: NeedDomain;
  secondaryDomains: NeedDomain[];
  distinctNeeds: DistinctNeed[];
  goals: NeedGoal[];
  situations: string[];
  desiredSupportTypes: SupportType[];
  extractedProfile: ExtractedCitizenProfile;
  unknownImportantFields: string[];
  missingFieldAssessments: MissingFieldAssessment[];
  confidence: 'high' | 'medium' | 'low';
  explanation: NeedExplanation;
}
