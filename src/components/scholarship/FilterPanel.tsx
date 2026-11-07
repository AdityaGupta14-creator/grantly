import { SelectField } from '@/components/ui/FormField';
import { Toggle } from '@/components/ui/Toggle';
import { AMOUNT_STEPS, DEADLINE_WINDOWS, type DiscoverFilters } from '@/lib/discover';
import { formatLakh } from '@/lib/format';
import { cn } from '@/lib/cn';
import {
  ALL_INDIA,
  CATEGORIES,
  CATEGORY_LABELS,
  EDUCATION_LABELS,
  EDUCATION_LEVELS,
  FIELD_LABELS,
  FIELDS_OF_STUDY,
  PROVIDER_LABELS,
  PROVIDER_TYPES,
  STATES,
  type Category,
  type EducationLevel,
  type FieldOfStudy,
  type ProviderType,
  type Region,
} from '@/types/options';

interface FilterPanelProps {
  filters: DiscoverFilters;
  onChange: (patch: Partial<DiscoverFilters>) => void;
  className?: string;
}

const toNullable = <T extends string>(value: string, options: readonly T[]): T | null =>
  options.find((option) => option === value) ?? null;

const amountLabel = (index: number): string => {
  const step = AMOUNT_STEPS[index] ?? 0;
  return step === 0 ? 'Any amount' : `Min ${formatLakh(step)}`;
};

export const FilterPanel = ({ filters, onChange, className }: FilterPanelProps) => {
  const toggleProvider = (provider: ProviderType) => {
    const providerTypes = filters.providerTypes.includes(provider)
      ? filters.providerTypes.filter((item) => item !== provider)
      : [...filters.providerTypes, provider];
    onChange({ providerTypes });
  };

  return (
    <div className={cn('space-y-5', className)}>
      <SelectField
        label="Education level"
        value={filters.level ?? ''}
        onChange={(event) => onChange({ level: toNullable<EducationLevel>(event.target.value, EDUCATION_LEVELS) })}
      >
        <option value="">Any level</option>
        {EDUCATION_LEVELS.map((level) => (
          <option key={level} value={level}>
            {EDUCATION_LABELS[level]}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Field of study"
        value={filters.field ?? ''}
        onChange={(event) => onChange({ field: toNullable<FieldOfStudy>(event.target.value, FIELDS_OF_STUDY) })}
      >
        <option value="">Any field</option>
        {FIELDS_OF_STUDY.map((field) => (
          <option key={field} value={field}>
            {FIELD_LABELS[field]}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Category"
        value={filters.category ?? ''}
        onChange={(event) => onChange({ category: toNullable<Category>(event.target.value, CATEGORIES) })}
      >
        <option value="">Any category</option>
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {CATEGORY_LABELS[category]}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="State"
        value={filters.state ?? ''}
        onChange={(event) => onChange({ state: toNullable<Region>(event.target.value, [ALL_INDIA, ...STATES]) })}
      >
        <option value="">Any state</option>
        {STATES.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Deadline"
        value={filters.deadlineWithinDays === null ? '' : String(filters.deadlineWithinDays)}
        onChange={(event) =>
          onChange({ deadlineWithinDays: event.target.value === '' ? null : Number(event.target.value) })
        }
      >
        {DEADLINE_WINDOWS.map((window) => (
          <option key={window.label} value={window.days === null ? '' : window.days}>
            {window.label}
          </option>
        ))}
      </SelectField>

      <div className="space-y-2">
        <label htmlFor="amount-range" className="flex items-center justify-between text-sm font-semibold text-fg">
          Amount
          <span className="font-normal text-muted">{amountLabel(filters.minAmountIndex)}</span>
        </label>
        <input
          id="amount-range"
          type="range"
          min={0}
          max={AMOUNT_STEPS.length - 1}
          step={1}
          value={filters.minAmountIndex}
          aria-valuetext={amountLabel(filters.minAmountIndex)}
          onChange={(event) => onChange({ minAmountIndex: Number(event.target.value) })}
          className="w-full cursor-pointer accent-primary"
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold text-fg">Provider type</legend>
        <div className="flex flex-wrap gap-2">
          {PROVIDER_TYPES.map((provider) => {
            const active = filters.providerTypes.includes(provider);
            return (
              <button
                key={provider}
                type="button"
                aria-pressed={active}
                onClick={() => toggleProvider(provider)}
                className={cn(
                  'min-h-9 rounded-full border px-3 text-sm font-semibold transition',
                  active ? 'border-primary bg-primary text-white' : 'border-line bg-surface text-fg hover:bg-raised',
                )}
              >
                {PROVIDER_LABELS[provider]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Toggle
        checked={filters.eligibleOnly}
        onChange={(checked) => onChange({ eligibleOnly: checked })}
        label="Show only eligible scholarships"
        description="Off by default so all scholarships and their match reasons stay visible."
      />
    </div>
  );
};
