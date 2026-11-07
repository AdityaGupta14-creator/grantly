import type { ProfileForm, ProfileFormErrors } from '@/lib/profileForm';
import { TextField, SelectField } from '@/components/ui/FormField';
import { Toggle } from '@/components/ui/Toggle';
import {
  CATEGORIES,
  CATEGORY_LABELS,
  EDUCATION_LABELS,
  EDUCATION_LEVELS,
  FIELD_LABELS,
  FIELDS_OF_STUDY,
  GENDERS,
  GENDER_LABELS,
  INCOME_BANDS,
  SPECIAL_FLAGS,
  SPECIAL_FLAG_LABELS,
  STATES,
  type Category,
  type EducationLevel,
  type FieldOfStudy,
  type Gender,
  type IncomeBandId,
  type SpecialFlag,
  type State,
} from '@/types/options';

export type ProfileStep = 'education' | 'home' | 'family';

interface ProfileFieldsProps {
  step?: ProfileStep;
  form: ProfileForm;
  errors: ProfileFormErrors;
  onChange: (patch: Partial<ProfileForm>) => void;
}

const SHOW: Record<ProfileStep, Array<keyof ProfileForm>> = {
  education: ['name', 'level', 'field', 'percentage'],
  home: ['state', 'category', 'gender'],
  family: ['incomeBand', 'flags'],
};

export const ProfileFields = ({ step, form, errors, onChange }: ProfileFieldsProps) => {
  const visible = (key: keyof ProfileForm) => !step || SHOW[step].includes(key);
  const toggleFlag = (flag: SpecialFlag) => {
    const flags = form.flags.includes(flag) ? form.flags.filter((item) => item !== flag) : [...form.flags, flag];
    onChange({ flags, flagsKnown: true });
  };

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {visible('name') && (
        <div className="sm:col-span-2">
          <TextField
            label="Your name"
            autoComplete="name"
            value={form.name}
            onChange={(event) => onChange({ name: event.target.value })}
            error={errors.name}
            placeholder="e.g. Priya Patil"
          />
        </div>
      )}
      {visible('level') && (
        <SelectField
          label="Current education"
          value={form.level}
          onChange={(event) => onChange({ level: event.target.value as EducationLevel })}
          error={errors.level}
        >
          <option value="">Choose an education level</option>
          {EDUCATION_LEVELS.map((level) => (
            <option key={level} value={level}>
              {EDUCATION_LABELS[level]}
            </option>
          ))}
        </SelectField>
      )}
      {visible('field') && (
        <SelectField
          label="Field of study"
          value={form.field}
          onChange={(event) => onChange({ field: event.target.value as FieldOfStudy })}
          error={errors.field}
        >
          <option value="">Choose a field</option>
          {FIELDS_OF_STUDY.map((field) => (
            <option key={field} value={field}>
              {FIELD_LABELS[field]}
            </option>
          ))}
        </SelectField>
      )}
      {visible('percentage') && (
        <div className="sm:col-span-2">
          <TextField
            label="Latest percentage or GPA (as %)"
            inputMode="decimal"
            value={form.percentage}
            onChange={(event) => onChange({ percentage: event.target.value })}
            error={errors.percentage}
            hint="Use your most recent result. A GPA of 8.2 is roughly 82%."
          />
        </div>
      )}
      {visible('state') && (
        <SelectField
          label="State of residence"
          value={form.state}
          onChange={(event) => onChange({ state: event.target.value as State })}
          error={errors.state}
        >
          <option value="">Choose a state</option>
          {STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </SelectField>
      )}
      {visible('category') && (
        <SelectField
          label="Category"
          value={form.category}
          onChange={(event) => onChange({ category: event.target.value as Category })}
          error={errors.category}
        >
          <option value="">Choose a category</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </SelectField>
      )}
      {visible('gender') && (
        <SelectField
          label="Gender"
          value={form.gender}
          onChange={(event) => onChange({ gender: event.target.value as Gender })}
          error={errors.gender}
        >
          <option value="">Prefer not to say</option>
          {GENDERS.map((gender) => (
            <option key={gender} value={gender}>
              {GENDER_LABELS[gender]}
            </option>
          ))}
        </SelectField>
      )}
      {visible('incomeBand') && (
        <div className="sm:col-span-2">
          <SelectField
            label="Annual family income"
            value={form.incomeBand}
            onChange={(event) => onChange({ incomeBand: event.target.value as IncomeBandId })}
            error={errors.incomeBand}
          >
            <option value="">Choose an income band</option>
            {INCOME_BANDS.map((band) => (
              <option key={band.id} value={band.id}>
                {band.label}
              </option>
            ))}
          </SelectField>
        </div>
      )}
      {visible('flags') && (
        <fieldset className="space-y-3 sm:col-span-2">
          <legend className="text-sm font-semibold text-fg">Special eligibility (select all that apply)</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {SPECIAL_FLAGS.map((flag) => (
              <Toggle
                key={flag}
                checked={form.flags.includes(flag)}
                onChange={() => toggleFlag(flag)}
                label={SPECIAL_FLAG_LABELS[flag]}
              />
            ))}
          </div>
          <Toggle
            checked={form.flagsKnown && form.flags.length === 0}
            onChange={(checked) => onChange({ flags: checked ? [] : form.flags, flagsKnown: checked })}
            label="None of these apply to me"
            description="Leave unchecked if you are unsure; we will mark these scholarships as needing more information."
          />
        </fieldset>
      )}
    </div>
  );
};
