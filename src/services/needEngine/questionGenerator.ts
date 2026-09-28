import type {
  ExtractedCitizenProfile,
  MissingFieldAssessment,
  NeedDomain,
  NeedGoal,
} from '../../types';

export class QuestionGenerator {
  generateMissingFields(
    domains: NeedDomain[],
    goals: NeedGoal[],
    profile: ExtractedCitizenProfile
  ): MissingFieldAssessment[] {
    const assessments: MissingFieldAssessment[] = [];

    // 1. UNKNOWN OR GENERAL DOMAIN
    if (domains.includes('unknown') || domains.length === 0) {
      assessments.push({
        field: 'purpose_of_support',
        label: 'Purpose of Government Support',
        reason:
          'The type of government scheme depends entirely on whether you need help with education, farming, business, employment, or healthcare.',
        priority: 'critical',
        suggestedInputType: 'select',
        options: ['Education / Studies', 'Farming / Agriculture', 'Starting or Growing a Business', 'Job / Skill Training', 'Other'],
      });
      return assessments;
    }

    // 2. EDUCATION DOMAIN
    if (domains.includes('education')) {
      if (!profile.state) {
        assessments.push({
          field: 'state',
          label: 'State of Residence',
          reason: 'State-specific scholarships and fee assistance programs vary by domicile.',
          priority: 'high',
          suggestedInputType: 'text',
        });
      }
      if (profile.annualFamilyIncome === undefined) {
        assessments.push({
          field: 'annualFamilyIncome',
          label: 'Annual Family Income',
          reason: 'Most scholarships have strict family income thresholds (e.g. < ₹2.5 Lakh per annum).',
          priority: 'high',
          suggestedInputType: 'number',
        });
      }
      if (!profile.educationLevel && (!profile.studentStatus || profile.studentStatus === 'unknown')) {
        assessments.push({
          field: 'educationLevel',
          label: 'Current Academic Level / Course',
          reason: 'Eligibility depends on current enrollment status and academic level (post-matric, undergraduate, professional).',
          priority: 'high',
          suggestedInputType: 'select',
          options: ['Post-Matric (11th/12th)', 'Undergraduate (BA/B.Sc/B.Tech)', 'Postgraduate', 'Diploma/ITI'],
        });
      }
      if (!profile.category) {
        assessments.push({
          field: 'socialCategory',
          label: 'Social Category',
          reason: 'Many government scholarships are reserved for specific social categories (SC, ST, OBC, Minority).',
          priority: 'optional',
          suggestedInputType: 'select',
          options: ['General', 'OBC', 'SC', 'ST', 'Minority'],
        });
      }
    }

    // 3. AGRICULTURE DOMAIN
    if (domains.includes('agriculture')) {
      if (!profile.state) {
        assessments.push({
          field: 'state',
          label: 'State of Farmland',
          reason: 'Agricultural subsidies, crop insurance, and solar pump programs are administered at the state level.',
          priority: 'high',
          suggestedInputType: 'text',
        });
      }
      if (profile.hasLandholding === undefined) {
        assessments.push({
          field: 'hasLandholding',
          label: 'Cultivable Landholding',
          reason: 'Schemes like PM-KISAN and equipment subsidies require cultivable land records in the farmer name.',
          priority: 'high',
          suggestedInputType: 'boolean',
        });
      }
      if (goals.length === 0 || goals.every((g) => g === 'crop_support')) {
        assessments.push({
          field: 'agriculture_goal',
          label: 'Specific Agricultural Need',
          reason: 'Government support differs for buying equipment, solar pumps/irrigation, seed subsidies, or direct income.',
          priority: 'high',
          suggestedInputType: 'select',
          options: ['Farm Equipment / Machinery', 'Irrigation / Solar Pump', 'Seeds & Fertilizer', 'Direct Income Support'],
        });
      }
    }

    // 4. BUSINESS DOMAIN
    if (domains.includes('business')) {
      if (!profile.businessStatus || profile.businessStatus === 'unknown') {
        assessments.push({
          field: 'businessStatus',
          label: 'New Unit vs Existing Enterprise',
          reason: 'Schemes like PMEGP are restricted to new units, while Mudra/credit schemes support existing business expansion.',
          priority: 'high',
          suggestedInputType: 'select',
          options: ['Starting a new business', 'Expanding an existing business'],
        });
      }
      if (!profile.businessType) {
        assessments.push({
          field: 'businessType',
          label: 'Type of Business Activity',
          reason: 'Manufacturing, service, and retail trading units have different subsidy limits and project cost ceilings.',
          priority: 'high',
          suggestedInputType: 'text',
        });
      }
      if (!profile.state) {
        assessments.push({
          field: 'state',
          label: 'Location / State',
          reason: 'State industrial development policies offer local capital subsidies and margin money.',
          priority: 'high',
          suggestedInputType: 'text',
        });
      }
      if (profile.age === undefined) {
        assessments.push({
          field: 'age',
          label: 'Applicant Age',
          reason: 'Self-employment credit schemes generally require applicants to be at least 18 years of age.',
          priority: 'optional',
          suggestedInputType: 'number',
        });
      }
    }

    // 5. EMPLOYMENT & SKILL DEVELOPMENT
    if (domains.includes('employment') || domains.includes('skill_development')) {
      if (!profile.educationLevel) {
        assessments.push({
          field: 'educationLevel',
          label: 'Highest Educational Qualification',
          reason: 'Technical skill development courses have minimum qualification prerequisites (8th/10th/12th pass).',
          priority: 'high',
          suggestedInputType: 'select',
          options: ['Below 10th', '10th Pass', '12th Pass', 'Graduate / Diploma'],
        });
      }
      if (!profile.state) {
        assessments.push({
          field: 'state',
          label: 'State of Residence',
          reason: 'Skill development training centers and placement programs are allocated by district and state.',
          priority: 'high',
          suggestedInputType: 'text',
        });
      }
    }

    return assessments;
  }
}
