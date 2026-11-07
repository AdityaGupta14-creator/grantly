import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, List, Search, SlidersHorizontal, UserRound, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FilterPanel } from '@/components/scholarship/FilterPanel';
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard';
import { Button } from '@/components/ui/Button';
import { buttonClass } from '@/components/ui/buttonStyles';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { ScholarshipCardSkeleton } from '@/components/ui/Skeleton';
import { SelectField } from '@/components/ui/FormField';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useMatches } from '@/hooks/useMatches';
import {
  AMOUNT_STEPS,
  applyDiscoverFilters,
  countActiveFilters,
  DEADLINE_WINDOWS,
  DEFAULT_FILTERS,
  SORT_OPTIONS,
  sortEntries,
  type DiscoverFilters,
  type SortKey,
} from '@/lib/discover';
import { formatLakh } from '@/lib/format';
import { cn } from '@/lib/cn';
import { useProfileStore } from '@/store/profileStore';
import { ROUTES } from '@/lib/routes';
import { EDUCATION_LABELS, CATEGORY_LABELS, FIELD_LABELS, PROVIDER_LABELS } from '@/types/options';

const PAGE_SIZE = 9;
const SKELETON_MS = 450;

type ViewMode = 'grid' | 'list';

interface FilterChip {
  key: string;
  label: string;
  clear: () => void;
}

const buildChips = (filters: DiscoverFilters, update: (patch: Partial<DiscoverFilters>) => void): FilterChip[] => {
  const chips: FilterChip[] = [];
  if (filters.query.trim()) chips.push({ key: 'query', label: `"${filters.query.trim()}"`, clear: () => update({ query: '' }) });
  if (filters.level) chips.push({ key: 'level', label: EDUCATION_LABELS[filters.level], clear: () => update({ level: null }) });
  if (filters.field) chips.push({ key: 'field', label: FIELD_LABELS[filters.field], clear: () => update({ field: null }) });
  if (filters.category) chips.push({ key: 'category', label: CATEGORY_LABELS[filters.category], clear: () => update({ category: null }) });
  if (filters.state) chips.push({ key: 'state', label: filters.state, clear: () => update({ state: null }) });
  for (const provider of filters.providerTypes) {
    chips.push({
      key: `provider-${provider}`,
      label: PROVIDER_LABELS[provider],
      clear: () => update({ providerTypes: filters.providerTypes.filter((item) => item !== provider) }),
    });
  }
  if (filters.minAmountIndex > 0) {
    chips.push({
      key: 'amount',
      label: `Min ${formatLakh(AMOUNT_STEPS[filters.minAmountIndex])}`,
      clear: () => update({ minAmountIndex: 0 }),
    });
  }
  if (filters.deadlineWithinDays !== null) {
    const window = DEADLINE_WINDOWS.find((item) => item.days === filters.deadlineWithinDays);
    chips.push({ key: 'deadline', label: window?.label ?? 'Deadline', clear: () => update({ deadlineWithinDays: null }) });
  }
  if (filters.eligibleOnly) {
    chips.push({ key: 'eligible', label: 'Only eligible', clear: () => update({ eligibleOnly: false }) });
  }
  return chips;
};

export const DiscoverPage = () => {
  useDocumentTitle('Discover scholarships');
  const profile = useProfileStore((state) => state.profile);
  const entries = useMatches();
  const [filters, setFilters] = useState<DiscoverFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>('match');
  const [view, setView] = useState<ViewMode>('grid');
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [ready, setReady] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(filters.query, 250);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), SKELETON_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [debouncedQuery, filters.level, filters.field, filters.category, filters.state, filters.providerTypes, filters.minAmountIndex, filters.deadlineWithinDays, filters.eligibleOnly, sort]);

  const update = (patch: Partial<DiscoverFilters>) => setFilters((current) => ({ ...current, ...patch }));

  const results = useMemo(
    () => sortEntries(applyDiscoverFilters(entries, { ...filters, query: debouncedQuery }), sort),
    [entries, filters, debouncedQuery, sort],
  );
  const chips = buildChips(filters, update);
  const activeCount = countActiveFilters(filters);
  const shown = results.slice(0, visible);

  if (!profile) {
    return (
      <>
        <PageHeader title="Discover scholarships" />
        <EmptyState
          icon={<UserRound size={32} aria-hidden="true" />}
          title="Build your profile to see matches"
          description="Discover scores every scholarship against your profile so you only see what fits."
          action={
            <Link to={ROUTES.onboarding} className={buttonClass('primary', 'lg')}>
              Build my profile
            </Link>
          }
        />
      </>
    );
  }

  const filterControls = <FilterPanel filters={filters} onChange={update} />;

  return (
    <>
      <PageHeader
        eyebrow="Discover"
        title="Scholarships picked for you"
        description="Matches are scored from your profile. Open any card to see exactly why it fits."
      />

      <div className="mb-6 flex min-w-0 flex-wrap items-center gap-3">
        <label className="relative min-w-0 flex-1 basis-64">
          <span className="sr-only">Search scholarships by name, provider or keyword</span>
          <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={filters.query}
            onChange={(event) => update({ query: event.target.value })}
            placeholder="Search by name, provider or keyword"
            className="min-h-12 w-full rounded-xl border border-line bg-surface py-3 pl-11 pr-4 text-base text-fg shadow-sm placeholder:text-muted focus:border-action focus:outline-none focus:ring-2 focus:ring-action/40"
          />
        </label>
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <Button variant="secondary" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
            <SlidersHorizontal size={18} aria-hidden="true" />
            Filters
            {activeCount > 0 && <span className="rounded-full bg-primary px-2 text-xs text-white">{activeCount}</span>}
          </Button>
          <div className="flex shrink-0 rounded-xl border border-line bg-surface p-1" role="group" aria-label="Result layout">
            <button
              type="button"
              aria-pressed={view === 'grid'}
              aria-label="Grid view"
              onClick={() => setView('grid')}
              className={cn('rounded-lg p-2.5 transition', view === 'grid' ? 'bg-primary text-white' : 'text-muted hover:text-fg')}
            >
              <LayoutGrid size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-pressed={view === 'list'}
              aria-label="List view"
              onClick={() => setView('list')}
              className={cn('rounded-lg p-2.5 transition', view === 'list' ? 'bg-primary text-white' : 'text-muted hover:text-fg')}
            >
              <List size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
        <aside aria-label="Filters" className="hidden lg:block">
          <Card className="sticky top-24 p-5">
            <h2 className="mb-5 font-heading text-lg font-semibold text-fg">Filters</h2>
            {filterControls}
          </Card>
        </aside>

        <section aria-labelledby="results-title" className="min-w-0 space-y-5">
          <h2 id="results-title" className="sr-only">
            Results
          </h2>
          <div className="flex min-w-0 flex-wrap items-end justify-between gap-3">
            <p aria-live="polite" className="text-sm font-semibold text-fg">
              {ready ? `${results.length} scholarship${results.length === 1 ? '' : 's'} found` : 'Finding matches...'}
            </p>
            <SelectField
              label="Sort by"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </div>

          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.clear}
                  aria-label={`Remove filter ${chip.label}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-pale py-1.5 pl-3 pr-2 text-sm font-semibold text-ink transition hover:bg-lavender"
                >
                  {chip.label}
                  <X size={14} aria-hidden="true" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="text-sm font-semibold text-link underline-offset-4 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {!ready && (
            <div className="grid gap-4 grid-cols-1 min-[640px]:grid-cols-2 min-[1440px]:grid-cols-3" aria-hidden="true">
              {Array.from({ length: 6 }, (_, index) => (
                <ScholarshipCardSkeleton key={index} />
              ))}
            </div>
          )}

          {ready && results.length === 0 && (
            <EmptyState
              icon={<Search size={32} aria-hidden="true" />}
              title="No scholarships match these filters"
              description="Try removing a filter or widening the deadline window to see more options."
              action={
                <Button variant="primary" onClick={() => setFilters(DEFAULT_FILTERS)}>
                  Reset filters
                </Button>
              }
            />
          )}

          {ready && results.length > 0 && (
            <>
              <ul className={cn('grid gap-4', view === 'grid' ? 'grid-cols-1 min-[640px]:grid-cols-2 min-[1440px]:grid-cols-3' : 'grid-cols-1')}>
                {shown.map((entry) => (
                  <li key={entry.scholarship.id} className="min-w-0">
                    <ScholarshipCard entry={entry} viewMode={view} />
                  </li>
                ))}
              </ul>
              {visible < results.length && (
                <div className="flex justify-center pt-2">
                  <Button variant="secondary" size="lg" onClick={() => setVisible((count) => count + PAGE_SIZE)}>
                    Load more ({results.length - visible} left)
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <Modal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        description="Narrow the list to what matters to you."
        footer={
          <Button variant="primary" onClick={() => setFiltersOpen(false)}>
            Show {results.length} results
          </Button>
        }
      >
        {filterControls}
      </Modal>
    </>
  );
};
