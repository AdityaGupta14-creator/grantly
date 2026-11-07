import type { ProfileDraft } from '@/store/profileStore';
import type { UserProfile } from '@/types/profile';
import { CATEGORIES, EDUCATION_LEVELS, FIELDS_OF_STUDY, GENDERS, INCOME_BANDS, STATES, type Category, type EducationLevel, type FieldOfStudy, type Gender, type IncomeBandId, type SpecialFlag, type State } from '@/types/options';

export interface ProfileForm extends Omit<ProfileDraft, 'level' | 'field' | 'state' | 'category' | 'gender' | 'incomeBand' | 'percentage' | 'flags' | 'flagsKnown'> {
  level: EducationLevel | '';
  field: FieldOfStudy | '';
  state: State | '';
  category: Category | '';
  gender: Gender | '';
  incomeBand: IncomeBandId | '';
  percentage: string;
  flags: SpecialFlag[];
  flagsKnown: boolean;
}

export type ProfileFormErrors = Partial<Record<keyof ProfileForm, string>>;

export const MAX_PERCENTAGE = 100;

const selectValue = <T extends string>(value: unknown, options: readonly T[]): T | '' =>
  typeof value === 'string' && (options as readonly string[]).includes(value) ? value as T : '';

/** Convert a stored profile into an editable onboarding form model. */
export const profileToForm = (profile: UserProfile | null): ProfileForm => {
  if (!profile) {
    return {
      name: '',
      level: '',
      field: '',
      state: '',
      category: '',
      gender: '',
      incomeBand: '',
      percentage: '',
      flags: [],
      flagsKnown: false,
    };
  }
  return {
    name: profile.name ?? '',
    level: selectValue(profile.level, EDUCATION_LEVELS),
    field: selectValue(profile.field, FIELDS_OF_STUDY),
    state: selectValue(profile.state, STATES),
    category: selectValue(profile.category, CATEGORIES),
    gender: selectValue(profile.gender, GENDERS),
    incomeBand: selectValue(profile.incomeBand, INCOME_BANDS.map((item) => item.id)),
    percentage: profile.percentage == null ? '' : String(profile.percentage),
    flags: Array.isArray(profile.flags) ? profile.flags : [],
    flagsKnown: profile.flagsKnown ?? (Array.isArray(profile.flags) && profile.flags.length > 0),
  };
};

/** Return inline validation messages for required match-driving fields. */
export const validateProfileForm = (form: ProfileForm): ProfileFormErrors => {
  const errors: ProfileFormErrors = {};
  if (form.name.trim().length < 2) errors.name = 'Enter your name (at least 2 characters).';
  if (!form.level) errors.level = 'Choose your current education level.';
  if (!form.field) errors.field = 'Choose your field of study.';
  if (!form.state) errors.state = 'Choose your state of residence.';
  if (!form.category) errors.category = 'Choose your category.';
  if (!form.incomeBand) errors.incomeBand = 'Choose your annual family income band.';
  const percentage = Number(form.percentage);
  if (form.percentage.trim() === '' || Number.isNaN(percentage)) {
    errors.percentage = 'Enter your latest percentage or GPA equivalent.';
  } else if (percentage < 0 || percentage > MAX_PERCENTAGE) {
    errors.percentage = `Percentage must be between 0 and ${MAX_PERCENTAGE}.`;
  }
  return errors;
};

/** Convert a validated form model into the profile store's draft shape. */
export const formToDraft = (form: ProfileForm): ProfileDraft => ({
  ...form,
  name: form.name.trim(),
  level: form.level as NonNullable<ProfileDraft['level']>,
  field: form.field as NonNullable<ProfileDraft['field']>,
  state: form.state as NonNullable<ProfileDraft['state']>,
  category: form.category as NonNullable<ProfileDraft['category']>,
  gender: form.gender || null,
  incomeBand: form.incomeBand as NonNullable<ProfileDraft['incomeBand']>,
  percentage: Number(form.percentage),
});
