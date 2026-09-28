import type {
  NeedDomain,
  NeedGoal,
  SupportType,
} from '../../types';

export interface ConceptDefinition {
  id: string;
  term: string;
  patterns: RegExp[];
  domain: NeedDomain;
  goal?: NeedGoal;
  defaultSupportType?: SupportType;
  negationPatterns?: RegExp[];
  weight?: number;
}

export const INDIAN_STATES: string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Andaman and Nicobar Islands',
  'Lakshadweep',
];

export const GENERAL_AMBIGUOUS_PATTERNS: RegExp[] = [
  /\b(?:i need|want|looking for|require)\s+(?:government\s+)?(?:help|support|assistance|scheme|schemes|yojana|yojna)\b/i,
  /\b(?:don'?t know|not sure)\s+(?:which|what)\s+scheme\b/i,
  /\bi need (?:some )?money\b/i,
  /\bi need financial (?:help|support|assistance)\b/i,
  /\bgovernment (?:help|aid|grant|scheme)\b/i,
];

export const DOMAIN_CONCEPTS: ConceptDefinition[] = [
  // ----------------------------------------------------
  // AGRICULTURE CONCEPTS & GOALS
  // ----------------------------------------------------
  {
    id: 'agri_equipment',
    term: 'agricultural equipment',
    patterns: [
      /\b(?:tractor|harvester|rotavator|power tiller|tiller|combine|sprayer|plough|plow)\b/i,
      /\b(?:farm|farming|agricultural|agri)\s+(?:machinery|machine|equipment|implements|tools)\b/i,
      /\b(?:equipment|machinery|machine)\s+for\s+(?:my\s+|our\s+)?(?:farm|farming|crops|agriculture)\b/i,
      /\bbuy(?:ing)?\s+(?:equipment|machinery)\s+(?:and|for)\b/i,
      /\bbuy(?:ing)?\s+(?:farm\s+|agricultural\s+)?(?:equipment|machinery|tools)\b/i,
    ],
    domain: 'agriculture',
    goal: 'equipment',
    defaultSupportType: 'subsidized_equipment',
  },
  {
    id: 'agri_irrigation',
    term: 'irrigation support',
    patterns: [
      /\b(?:irrigation|borewell|tube ?well|drip irrigation|sprinkler system|water pump|canal water)\b/i,
      /\b(?:irrigate|watering)\s+(?:my\s+|our\s+)?(?:fields?|crops?|farm|land)\b/i,
      /\bpump(?:set)?\s+for\s+(?:irrigation|farm|fields?)\b/i,
    ],
    domain: 'agriculture',
    goal: 'irrigation',
    defaultSupportType: 'subsidized_equipment',
  },
  {
    id: 'agri_energy',
    term: 'irrigation & farm energy cost',
    patterns: [
      /\b(?:diesel\s+costs?|electricity\s+cost|power\s+subsidy|solar\s+pump|reduce\s+diesel)\b/i,
      /\b(?:diesel|fuel|power|electricity)\s+for\s+irrigation\b/i,
      /\boperating\s+costs?\s+for\s+(?:tubewell|tube ?well|irrigation)\b/i,
    ],
    domain: 'agriculture',
    goal: 'energy_cost',
    defaultSupportType: 'financial_grant',
  },
  {
    id: 'agri_crop_support',
    term: 'crop cultivation support',
    patterns: [
      /\b(?:crop\s+cultivation|crop\s+loss|crop\s+damage|crop\s+support|kisan\s+support)\b/i,
      /\b(?:growing|cultivating)\s+(?:crops?|paddy|wheat|cotton|vegetables|sugarcane)\b/i,
      /\b(?:kheti|krishi|kisan|fasal)\b/i,
    ],
    domain: 'agriculture',
    goal: 'crop_support',
    defaultSupportType: 'financial_grant',
  },
  {
    id: 'agri_seeds_fertilizers',
    term: 'seeds and fertilizers',
    patterns: [
      /\b(?:seeds?|fertilizer|fertilizers|urea|dap|manure|organic compost|pesticides?)\b/i,
    ],
    domain: 'agriculture',
    goal: 'seeds',
    defaultSupportType: 'financial_grant',
  },
  {
    id: 'agri_insurance',
    term: 'crop insurance',
    patterns: [
      /\b(?:crop\s+insurance|fasal\s+bima|weather\s+insurance|insurance\s+for\s+crops?)\b/i,
    ],
    domain: 'agriculture',
    goal: 'insurance',
    defaultSupportType: 'insurance_coverage',
  },
  {
    id: 'agri_livestock',
    term: 'livestock and dairy farming',
    patterns: [
      /\b(?:livestock|dairy\s+farm(?:ing)?|cattle|cows?|buffalo(?:es)?|goat\s+farm(?:ing)?|poultry|animal\s+husbandry)\b/i,
    ],
    domain: 'agriculture',
    goal: 'livestock',
    defaultSupportType: 'financial_grant',
  },
  {
    id: 'agri_general',
    term: 'farming context',
    patterns: [
      /\b(?:farm|farms|farmer|farmers|farming|agricultural|agriculture|landholding|cultivator)\b/i,
    ],
    domain: 'agriculture',
    goal: 'crop_support',
    defaultSupportType: 'financial_grant',
  },

  // ----------------------------------------------------
  // EDUCATION CONCEPTS & GOALS
  // ----------------------------------------------------
  {
    id: 'edu_fee_assistance',
    term: 'college / school fee assistance',
    patterns: [
      /\b(?:college\s+fees?|tuition\s+fees?|school\s+fees?|admission\s+fees?|university\s+fees?)\b/i,
      /\b(?:can'?t|cannot)\s+afford\s+(?:the\s+)?fees?\b/i,
      /\bhelp\s+(?:paying|to pay)\s+(?:college\s+)?fees?\b/i,
      /\bfees?\s+(?:are\s+)?(?:too\s+)?(?:expensive|high)\b/i,
      /\bafford\s+(?:college|university|school|studies|education)\b/i,
    ],
    domain: 'education',
    goal: 'fee_assistance',
    defaultSupportType: 'fee_waiver',
  },
  {
    id: 'edu_scholarship',
    term: 'scholarship or fellowship',
    patterns: [
      /\b(?:scholarship|scholarships|fellowship|fellowships|stipend|nsp|matric\s+scholarship)\b/i,
      /\bfinancial\s+(?:assistance|support|help|aid)\s+for\s+(?:my\s+|our\s+)?(?:higher\s+)?education\b/i,
      /\bfinancial\s+(?:assistance|support|help|aid)\s+for\s+(?:my\s+|our\s+)?studies\b/i,
    ],
    domain: 'education',
    goal: 'scholarship',
    defaultSupportType: 'financial_grant',
  },
  {
    id: 'edu_hostel_books',
    term: 'hostel and books support',
    patterns: [
      /\b(?:hostel\s+fees?|hostel\s+stay|books\s+and\s+stationery|study\s+materials?)\b/i,
    ],
    domain: 'education',
    goal: 'hostel',
    defaultSupportType: 'financial_grant',
  },
  {
    id: 'edu_loan',
    term: 'education loan',
    patterns: [
      /\b(?:education\s+loan|student\s+loan|study\s+loan)\b/i,
    ],
    domain: 'education',
    goal: 'education_loan',
    defaultSupportType: 'loan_or_credit',
  },
  {
    id: 'edu_coaching',
    term: 'exam coaching support',
    patterns: [
      /\b(?:coaching\s+fees?|competitive\s+exam\s+coaching|upsc\s+coaching|neet\s+coaching|jee\s+coaching)\b/i,
    ],
    domain: 'education',
    goal: 'coaching',
    defaultSupportType: 'fee_waiver',
  },
  {
    id: 'edu_general',
    term: 'education context',
    patterns: [
      /\b(?:education|higher\s+education|studies|student|students|studying|college|university|school|degree|post-matric|matric|b\.?tech|m\.?tech|b\.?sc|b\.?com|ba|admission)\b/i,
    ],
    domain: 'education',
    goal: 'scholarship',
    defaultSupportType: 'financial_grant',
  },

  // ----------------------------------------------------
  // BUSINESS & ENTREPRENEURSHIP CONCEPTS & GOALS
  // ----------------------------------------------------
  {
    id: 'biz_start',
    term: 'start a new business',
    patterns: [
      /\b(?:start|starting|open|opening|begin|launch|set up)\s+(?:a\s+|an\s+)?(?:small\s+)?(?:business|shop|store|enterprise|venture|startup|unit)\b/i,
      /\bstart\s+something\s+small\b/i,
      /\bnew\s+(?:business|shop|enterprise|micro-enterprise|unit)\b/i,
      /\bwant\s+to\s+become\s+(?:an?\s+)?entrepreneur\b/i,
    ],
    domain: 'business',
    goal: 'start_business',
    defaultSupportType: 'loan_or_credit',
  },
  {
    id: 'biz_expand',
    term: 'expand existing business',
    patterns: [
      /\b(?:expand|expanding|grow|growing|scale\s+up|upgrade)\s+(?:my\s+|our\s+|the\s+)?(?:business|shop|store|enterprise|workshop|it)\b/i,
      /\b(?:expand\s+it|business\s+expansion|expansion\s+of\s+business)\b/i,
      /\b(?:already\s+run|already\s+have|currently\s+run|running\s+a)\s+(?:small\s+)?(?:shop|business|workshop|trade)\b/i,
    ],
    domain: 'business',
    goal: 'expand_business',
    defaultSupportType: 'loan_or_credit',
  },
  {
    id: 'biz_equipment',
    term: 'business machinery and equipment',
    patterns: [
      /\b(?:tailoring\s+machine|sewing\s+machine|embroidery\s+machine|lathe|tools|machinery\s+for\s+work)\b/i,
      /\bbuy\s+(?:a\s+)?(?:better|new)\s+(?:machine|tool|equipment)\s+for\s+(?:my\s+|our\s+)?work\b/i,
      /\bequipment\s+for\s+(?:my\s+|our\s+)?(?:shop|business|workshop|tailoring|trade)\b/i,
    ],
    domain: 'business',
    goal: 'equipment',
    defaultSupportType: 'subsidized_equipment',
  },
  {
    id: 'biz_working_capital',
    term: 'working capital and credit',
    patterns: [
      /\b(?:working\s+capital|inventory\s+purchase|stock\s+for\s+shop|mudra\s+loan|business\s+loan|pmegp)\b/i,
    ],
    domain: 'business',
    goal: 'working_capital',
    defaultSupportType: 'loan_or_credit',
  },
  {
    id: 'biz_general',
    term: 'business / trade context',
    patterns: [
      /\b(?:business|enterprise|shop|store|entrepreneur|trader|merchant|tailoring|carpentry|artisan|handicraft)\b/i,
    ],
    domain: 'business',
    goal: 'start_business',
    defaultSupportType: 'loan_or_credit',
  },

  // ----------------------------------------------------
  // EMPLOYMENT & SKILL DEVELOPMENT CONCEPTS & GOALS
  // ----------------------------------------------------
  {
    id: 'skill_learning',
    term: 'learning a job skill',
    patterns: [
      /\b(?:learn|learning)\s+(?:a\s+)?(?:job\s+|computer\s+|technical\s+)?skills?\b/i,
      /\b(?:computer|digital|vocational|trade)\s+skills?\b/i,
      /\b(?:skill\s+development|skill\s+training|vocational\s+training|technical\s+training)\b/i,
      /\b(?:pmkvy|iti\s+course|trade\s+training|diploma\s+in\s+skill)\b/i,
      /\bwant\s+to\s+learn\s+(?:tailoring|plumbing|electrician|welding|beautician|coding|computers?)\b/i,
    ],
    domain: 'skill_development',
    goal: 'skill_training',
    defaultSupportType: 'training_or_coaching',
  },
  {
    id: 'emp_find_job',
    term: 'finding employment / job',
    patterns: [
      /\b(?:find\s+(?:a\s+)?job|looking\s+for\s+(?:a\s+)?job|need\s+(?:a\s+)?job|job\s+placement|unemployed)\b/i,
      /\b(?:रोजगार|naukri|rozgar)\b/i,
    ],
    domain: 'employment',
    goal: 'find_job',
    defaultSupportType: 'training_or_coaching',
  },
  {
    id: 'emp_self_employment',
    term: 'self-employment / livelihood',
    patterns: [
      /\b(?:self[- ]employment|self[- ]employed|earn\s+a\s+livelihood|livelihood\s+support)\b/i,
    ],
    domain: 'employment',
    goal: 'self_employment',
    defaultSupportType: 'loan_or_credit',
  },

  // ----------------------------------------------------
  // HEALTHCARE CONCEPTS
  // ----------------------------------------------------
  {
    id: 'health_medical',
    term: 'medical treatment support',
    patterns: [
      /\b(?:medical\s+bills?|hospital\s+bills?|medical\s+treatment|ayushman|surgery|operation\s+costs?|medicine\s+costs?|treatment\s+for|illness|disease)\b/i,
    ],
    domain: 'healthcare',
    goal: 'medical_treatment',
    defaultSupportType: 'insurance_coverage',
  },

  // ----------------------------------------------------
  // HOUSING CONCEPTS
  // ----------------------------------------------------
  {
    id: 'housing_home',
    term: 'housing assistance',
    patterns: [
      /\b(?:help\s+with\s+(?:my\s+|our\s+)?house|house\s+construction|build\s+a\s+house|pucca\s+house|pm\s+awas|roof\s+repair|home\s+subsidy|housing|house)\b/i,
    ],
    domain: 'housing',
    goal: 'housing_support',
    defaultSupportType: 'infrastructure_or_housing',
  },

  // ----------------------------------------------------
  // SOCIAL SECURITY & PENSION
  // ----------------------------------------------------
  {
    id: 'soc_sec_pension',
    term: 'pension and social security',
    patterns: [
      /\b(?:old\s+age\s+pension|widow\s+pension|disability\s+pension|social\s+security\s+pension|ration\s+card|bpl\s+card)\b/i,
    ],
    domain: 'social_security',
    goal: 'pension',
    defaultSupportType: 'pension_or_stipend',
  },
  {
    id: 'soc_sec_domestic_worker',
    term: 'unorganized / domestic worker support',
    patterns: [
      /\b(?:household\s+worker|domestic\s+worker|house\s+maid|maid|servant|kamwali|safai\s+karmi|sweeper|cleaner|unorganized\s+worker|informal\s+worker|eshram|e-shram)\b/i,
    ],
    domain: 'social_security',
    goal: 'domestic_worker',
    defaultSupportType: 'financial_grant',
  },

  // ----------------------------------------------------
  // STREET VENDOR & MICRO-CREDIT
  // ----------------------------------------------------
  {
    id: 'biz_street_vendor',
    term: 'street vendor / hawker support',
    patterns: [
      /\b(?:street\s+vendor|hawker|thela|thela[- ]wala|rehari|rehri|roadside\s+vendor|footpath\s+seller|svanidhi)\b/i,
    ],
    domain: 'business',
    goal: 'street_vendor',
    defaultSupportType: 'loan_or_credit',
  },

  // ----------------------------------------------------
  // WOMEN & MATERNITY CONCEPTS
  // ----------------------------------------------------
  {
    id: 'women_maternity',
    term: 'maternity and mother support',
    patterns: [
      /\b(?:pregnant|pregnancy|maternity|lactating\s+mother|newborn|infant|pmmvy|mother\s+support)\b/i,
    ],
    domain: 'women',
    goal: 'maternity_support',
    defaultSupportType: 'financial_grant',
  },

  // ----------------------------------------------------
  // SENIOR CITIZEN CONCEPTS
  // ----------------------------------------------------
  {
    id: 'senior_citizen_support',
    term: 'senior citizen / elderly support',
    patterns: [
      /\b(?:senior\s+citizen|elderly|old\s+age|60\s+years\s+old|65\s+years\s+old|above\s+60|aged\s+parents?|grandfather|grandmother|nana|nani|dada|dadi|vridha|pension\s+for\s+elderly)\b/i,
    ],
    domain: 'senior_citizen',
    goal: 'senior_citizen',
    defaultSupportType: 'pension_or_stipend',
  },

  // ----------------------------------------------------
  // DISABILITY CONCEPTS
  // ----------------------------------------------------
  {
    id: 'disability_support',
    term: 'support for persons with disability',
    patterns: [
      /\b(?:disabled|disability|handicapped|divyang|divyangjan|wheelchair|hearing\s+aid|blind|special\s+needs)\b/i,
    ],
    domain: 'disability',
    goal: 'disability_support',
    defaultSupportType: 'subsidized_equipment',
  },
];
