import { ALL_CATEGORIES, ALL_FIELDS, ALL_GENDERS, ALL_INDIA, CATEGORIES, CATEGORY_LABELS, EDUCATION_LABELS, EDUCATION_LEVELS, FIELD_LABELS, FIELDS_OF_STUDY, GENDER_LABELS, GENDERS, INCOME_BANDS, SPECIAL_FLAG_LABELS, STATES } from '@/types/options';
import type { Category, FieldOfStudy, Gender, SpecialFlag } from '@/types/options';
import type { Scholarship } from '@/types/scholarship';
import type { UserProfile } from '@/types/profile';
import { formatLakh } from '@/lib/format';

export type CriterionId = 'level' | 'field' | 'category' | 'state' | 'income' | 'marks' | 'gender' | 'flags';
export type CriterionStatus = 'met' | 'near' | 'not_met' | 'unknown';
export type MatchTier = 'eligible' | 'nearly_eligible' | 'not_eligible';

export interface MatchCriterion {
  id: CriterionId;
  label: string;
  weight: number;
  status: CriterionStatus;
  explanation: string;
}

export interface MatchResult {
  score: number;
  eligible: boolean;
  tier: MatchTier;
  criteria: MatchCriterion[];
}

export const NEAR_MARKS_MARGIN = 5;

const WEIGHTS: Record<CriterionId, number> = {
  level: 15,
  field: 20,
  category: 15,
  state: 10,
  income: 15,
  marks: 15,
  gender: 5,
  flags: 5,
};

const CREDIT: Record<CriterionStatus, number> = {
  met: 1,
  near: 0.5,
  not_met: 0,
  unknown: 0,
};

const CRITERION_LABELS: Record<CriterionId, string> = {
  level: 'Education level',
  field: 'Field of study',
  category: 'Category',
  state: 'State of residence',
  income: 'Family income',
  marks: 'Minimum marks',
  gender: 'Gender',
  flags: 'Special eligibility',
};

const isUnrestricted = <T>(allowed: readonly T[], total: readonly T[]): boolean =>
  total.every((item) => allowed.includes(item));

const joinLabels = (labels: string[]): string => {
  if (labels.length <= 1) return labels.join('');
  return `${labels.slice(0, -1).join(', ')} or ${labels[labels.length - 1]}`;
};

const isOption = <T extends string>(options: readonly T[], value: unknown): value is T =>
  typeof value === 'string' && (options as readonly string[]).includes(value);

const unknownCriterion = (id: CriterionId, explanation: string): MatchCriterion => ({
  id,
  label: CRITERION_LABELS[id],
  weight: WEIGHTS[id],
  status: 'unknown',
  explanation,
});

const levelCriterion = (scholarship: Scholarship, profile: UserProfile): MatchCriterion => {
  if (!isOption(EDUCATION_LEVELS, profile.level)) return unknownCriterion('level', 'Add your education level to check this');
  const met = scholarship.levels.includes(profile.level);
  return {
    id: 'level',
    label: CRITERION_LABELS.level,
    weight: WEIGHTS.level,
    status: met ? 'met' : 'not_met',
    explanation: met
      ? `Open to ${EDUCATION_LABELS[profile.level]} students`
      : `Meant for ${joinLabels(scholarship.levels.map((level) => EDUCATION_LABELS[level]))} students`,
  };
};

const fieldCriterion = (scholarship: Scholarship, profile: UserProfile): MatchCriterion => {
  const open = isUnrestricted<FieldOfStudy>(scholarship.fields, ALL_FIELDS);
  if (!open && !isOption(FIELDS_OF_STUDY, profile.field)) return unknownCriterion('field', 'Add your field of study to check this');
  const met = open || scholarship.fields.includes(profile.field);
  let explanation: string;
  if (open) explanation = 'Open to every field of study';
  else if (met) explanation = `Covers ${FIELD_LABELS[profile.field]}`;
  else explanation = `Only for ${joinLabels(scholarship.fields.map((field) => FIELD_LABELS[field]))}`;
  return { id: 'field', label: CRITERION_LABELS.field, weight: WEIGHTS.field, status: met ? 'met' : 'not_met', explanation };
};

const categoryCriterion = (scholarship: Scholarship, profile: UserProfile): MatchCriterion => {
  const open = isUnrestricted<Category>(scholarship.categories, ALL_CATEGORIES);
  if (!open && !isOption(CATEGORIES, profile.category)) return unknownCriterion('category', 'Add your category to check this');
  const met = open || scholarship.categories.includes(profile.category);
  let explanation: string;
  if (open) explanation = 'Open to all categories';
  else if (met) explanation = `Open to your ${CATEGORY_LABELS[profile.category]} category`;
  else explanation = `Reserved for ${joinLabels(scholarship.categories.map((category) => CATEGORY_LABELS[category]))}`;
  return { id: 'category', label: CRITERION_LABELS.category, weight: WEIGHTS.category, status: met ? 'met' : 'not_met', explanation };
};

const stateCriterion = (scholarship: Scholarship, profile: UserProfile): MatchCriterion => {
  const open = scholarship.states.includes(ALL_INDIA);
  if (!open && !isOption(STATES, profile.state)) return unknownCriterion('state', 'Add your state of residence to check this');
  const met = open || scholarship.states.includes(profile.state);
  let explanation: string;
  if (open) explanation = 'Available to students across India';
  else if (met) explanation = `Available to residents of ${profile.state}`;
  else explanation = `Only for residents of ${joinLabels(scholarship.states.filter((state) => state !== ALL_INDIA))}`;
  return { id: 'state', label: CRITERION_LABELS.state, weight: WEIGHTS.state, status: met ? 'met' : 'not_met', explanation };
};

const incomeCriterion = (scholarship: Scholarship, profile: UserProfile): MatchCriterion => {
  const base = { id: 'income' as const, label: CRITERION_LABELS.income, weight: WEIGHTS.income };
  if (scholarship.maxIncome === null) {
    return { ...base, status: 'met', explanation: 'No family income limit applies' };
  }
  const band = INCOME_BANDS.find((item) => item.id === profile.incomeBand);
  if (!band) return unknownCriterion('income', 'Add your income band to check this');
  const limit = formatLakh(scholarship.maxIncome);
  if (band.max <= scholarship.maxIncome) {
    return { ...base, status: 'met', explanation: `Your family income (${band.label}) is under the ${limit} limit` };
  }
  if (band.min < scholarship.maxIncome) {
    return {
      ...base,
      status: 'near',
      explanation: `Your income band (${band.label}) may cross the ${limit} limit. Keep your certificate handy`,
    };
  }
  return { ...base, status: 'not_met', explanation: `Your income band (${band.label}) is above the ${limit} limit` };
};

const marksCriterion = (scholarship: Scholarship, profile: UserProfile): MatchCriterion => {
  const base = { id: 'marks' as const, label: CRITERION_LABELS.marks, weight: WEIGHTS.marks };
  if (scholarship.minMarks === null) {
    return { ...base, status: 'met', explanation: 'No minimum marks required' };
  }
  if (typeof profile.percentage !== 'number' || !Number.isFinite(profile.percentage)) {
    return unknownCriterion('marks', 'Add your latest percentage to check this');
  }
  if (profile.percentage >= scholarship.minMarks) {
    return {
      ...base,
      status: 'met',
      explanation: `Your ${profile.percentage}% meets the ${scholarship.minMarks}% minimum`,
    };
  }
  if (profile.percentage >= scholarship.minMarks - NEAR_MARKS_MARGIN) {
    const shortBy = scholarship.minMarks - profile.percentage;
    return {
      ...base,
      status: 'near',
      explanation: `Your ${profile.percentage}% is ${shortBy}% below the ${scholarship.minMarks}% minimum`,
    };
  }
  return {
    ...base,
    status: 'not_met',
    explanation: `Your ${profile.percentage}% is below the ${scholarship.minMarks}% minimum`,
  };
};

const genderCriterion = (scholarship: Scholarship, profile: UserProfile): MatchCriterion => {
  const open = isUnrestricted<Gender>(scholarship.genders, ALL_GENDERS);
  if (!open && (!isOption(GENDERS, profile.gender) || profile.gender === 'other')) {
    return unknownCriterion('gender', 'Add your gender to check this; prefer-not-to-say answers will not exclude you');
  }
  const met = open || scholarship.genders.includes(profile.gender as Gender);
  let explanation: string;
  if (open) explanation = 'Open to all genders';
  else if (met) explanation = `Open to ${GENDER_LABELS[profile.gender as Gender].toLowerCase()} students`;
  else explanation = `Only for ${joinLabels(scholarship.genders.map((gender) => GENDER_LABELS[gender].toLowerCase()))} students`;
  return { id: 'gender', label: CRITERION_LABELS.gender, weight: WEIGHTS.gender, status: met ? 'met' : 'not_met', explanation };
};

const flagsCriterion = (scholarship: Scholarship, profile: UserProfile): MatchCriterion => {
  const base = { id: 'flags' as const, label: CRITERION_LABELS.flags, weight: WEIGHTS.flags };
  if (scholarship.flags.length === 0) {
    return { ...base, status: 'met', explanation: 'No special eligibility needed' };
  }
  const flags = Array.isArray(profile.flags) ? profile.flags : [];
  const matched = scholarship.flags.filter((flag: SpecialFlag) => flags.includes(flag));
  const required = joinLabels(scholarship.flags.map((flag) => SPECIAL_FLAG_LABELS[flag]));
  if (matched.length > 0) {
    return { ...base, status: 'met', explanation: `You qualify as: ${joinLabels(matched.map((flag) => SPECIAL_FLAG_LABELS[flag]))}` };
  }
  if (!profile.flagsKnown && flags.length === 0) return unknownCriterion('flags', 'Add your special eligibility information to check this');
  return { ...base, status: 'not_met', explanation: `Requires: ${required}` };
};

/** Evaluate every criterion and calculate a transparent eligibility tier and score. */
export const evaluateScholarship = (scholarship: Scholarship, profile: UserProfile): MatchResult => {
  const criteria: MatchCriterion[] = [
    levelCriterion(scholarship, profile),
    fieldCriterion(scholarship, profile),
    categoryCriterion(scholarship, profile),
    stateCriterion(scholarship, profile),
    incomeCriterion(scholarship, profile),
    marksCriterion(scholarship, profile),
    genderCriterion(scholarship, profile),
    flagsCriterion(scholarship, profile),
  ];

  const knownCriteria = criteria.filter((criterion) => criterion.status !== 'unknown');
  const knownWeight = knownCriteria.reduce((total, criterion) => total + criterion.weight, 0);
  const weighted = knownCriteria.reduce((total, criterion) => total + criterion.weight * CREDIT[criterion.status], 0);
  const score = knownWeight === 0 ? 0 : Math.round((weighted / knownWeight) * 100);
  const hardFail = criteria.some((criterion) => criterion.status === 'not_met');
  const nearlyEligible = !hardFail && criteria.some((criterion) => criterion.status === 'near' || criterion.status === 'unknown');
  const eligible = !hardFail && !nearlyEligible;

  return {
    score,
    eligible,
    tier: hardFail ? 'not_eligible' : nearlyEligible ? 'nearly_eligible' : 'eligible',
    criteria,
  };
};

const SEVERITY: Record<CriterionStatus, number> = { not_met: 0, unknown: 1, near: 2, met: 3 };

/** Select the most useful criteria to summarize on compact scholarship cards. */
export const pickHighlights = (criteria: MatchCriterion[], limit: number): MatchCriterion[] =>
  [...criteria]
    .sort((a, b) => SEVERITY[a.status] - SEVERITY[b.status] || b.weight - a.weight)
    .slice(0, limit);

/** Map a match score to the shared visual strength token. */
export const scoreTone = (score: number): 'strong' | 'good' | 'partial' => {
  if (score >= 75) return 'strong';
  if (score >= 50) return 'good';
  return 'partial';
};
