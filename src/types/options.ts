export const EDUCATION_LEVELS = ['class10', 'class12', 'diploma', 'ug', 'pg', 'phd'] as const;
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

export const EDUCATION_LABELS: Record<EducationLevel, string> = {
  class10: 'Class 10',
  class12: 'Class 12',
  diploma: 'Diploma',
  ug: 'Undergraduate (UG)',
  pg: 'Postgraduate (PG)',
  phd: 'PhD / Research',
};

export const FIELDS_OF_STUDY = [
  'engineering',
  'medicine',
  'science',
  'commerce',
  'arts',
  'management',
  'agriculture',
  'law',
] as const;
export type FieldOfStudy = (typeof FIELDS_OF_STUDY)[number];

export const FIELD_LABELS: Record<FieldOfStudy, string> = {
  engineering: 'Engineering & Technology',
  medicine: 'Medicine & Health',
  science: 'Pure Science',
  commerce: 'Commerce & Economics',
  arts: 'Arts & Humanities',
  management: 'Management',
  agriculture: 'Agriculture',
  law: 'Law',
};

export const CATEGORIES = ['general', 'obc', 'sc', 'st', 'ews'] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  general: 'General',
  obc: 'OBC',
  sc: 'SC',
  st: 'ST',
  ews: 'EWS',
};

export const GENDERS = ['female', 'male', 'other'] as const;
export type Gender = (typeof GENDERS)[number];

export const GENDER_LABELS: Record<Gender, string> = {
  female: 'Female',
  male: 'Male',
  other: 'Other',
};

export const ALL_INDIA = 'All India';

export const STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;
export type State = (typeof STATES)[number];
export type Region = State | typeof ALL_INDIA;

export const SPECIAL_FLAGS = [
  'disability',
  'minority',
  'first_generation',
  'single_parent',
  'sports',
] as const;
export type SpecialFlag = (typeof SPECIAL_FLAGS)[number];

export const SPECIAL_FLAG_LABELS: Record<SpecialFlag, string> = {
  disability: 'Person with disability',
  minority: 'Minority community',
  first_generation: 'First-generation learner',
  single_parent: 'Single-parent household',
  sports: 'State or national sportsperson',
};

export const INCOME_BANDS = [
  { id: 'below_1l', label: 'Below ₹1 lakh', min: 0, max: 100000 },
  { id: '1l_2_5l', label: '₹1 – 2.5 lakh', min: 100000, max: 250000 },
  { id: '2_5l_5l', label: '₹2.5 – 5 lakh', min: 250000, max: 500000 },
  { id: '5l_8l', label: '₹5 – 8 lakh', min: 500000, max: 800000 },
  { id: '8l_12l', label: '₹8 – 12 lakh', min: 800000, max: 1200000 },
  { id: 'above_12l', label: 'Above ₹12 lakh', min: 1200000, max: Number.POSITIVE_INFINITY },
] as const;
export type IncomeBandId = (typeof INCOME_BANDS)[number]['id'];
export type IncomeBand = (typeof INCOME_BANDS)[number];

export const PROVIDER_TYPES = ['government', 'private', 'ngo', 'institution'] as const;
export type ProviderType = (typeof PROVIDER_TYPES)[number];

export const PROVIDER_LABELS: Record<ProviderType, string> = {
  government: 'Government',
  private: 'Private / CSR',
  ngo: 'NGO / Trust',
  institution: 'Institution',
};

export const AMOUNT_TYPES = ['one_time', 'annual'] as const;
export type AmountType = (typeof AMOUNT_TYPES)[number];

export const AMOUNT_TYPE_LABELS: Record<AmountType, string> = {
  one_time: 'one-time',
  annual: 'per year',
};

export const DOCUMENT_IDS = [
  'aadhaar',
  'income_certificate',
  'caste_certificate',
  'marksheet',
  'bank_passbook',
  'bonafide',
  'passport_photo',
  'domicile',
  'disability_certificate',
  'admission_letter',
  'sports_certificate',
] as const;
export type DocumentId = (typeof DOCUMENT_IDS)[number];

export const ALL_LEVELS: readonly EducationLevel[] = EDUCATION_LEVELS;
export const ALL_FIELDS: readonly FieldOfStudy[] = FIELDS_OF_STUDY;
export const ALL_CATEGORIES: readonly Category[] = CATEGORIES;
export const ALL_GENDERS: readonly Gender[] = GENDERS;
