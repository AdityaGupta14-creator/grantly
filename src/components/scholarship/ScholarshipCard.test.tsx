import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { DEMO_PROFILE } from '@/data/demoProfile';
import { scholarships } from '@/data/scholarships';
import { evaluateScholarship } from '@/lib/match';
import { ScholarshipCard } from '@/components/scholarship/ScholarshipCard';
import { useCompareStore } from '@/store/compareStore';
import { useToastStore } from '@/store/toastStore';
import { useTrackerStore } from '@/store/trackerStore';

describe('ScholarshipCard', () => {
  beforeEach(() => {
    useCompareStore.getState().clearCompare();
    useTrackerStore.getState().replaceTracker({ applications: {}, reminderIds: [] });
    useToastStore.setState({ toasts: [] });
  });

  it('renders plain-language match reasons and lets the student save an application', async () => {
    const user = userEvent.setup();
    const scholarship = scholarships[0];
    const match = evaluateScholarship(scholarship, DEMO_PROFILE);
    render(<MemoryRouter><ScholarshipCard entry={{ scholarship, match }} /></MemoryRouter>);
    expect(screen.getByRole('link', { name: scholarship.name })).toBeInTheDocument();
    expect(screen.getByRole('list')).toHaveTextContent(/Open to every field|Open to PhD/i);
    await user.click(screen.getByRole('button', { name: `Save ${scholarship.name}` }));
    expect(useTrackerStore.getState().applications[scholarship.id]?.status).toBe('saved');
  });

  it('limits comparison selection to three scholarships', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><div>{scholarships.slice(0, 4).map((scholarship) => (
      <ScholarshipCard key={scholarship.id} entry={{ scholarship, match: evaluateScholarship(scholarship, DEMO_PROFILE) }} />
    ))}</div></MemoryRouter>);
    for (const checkbox of screen.getAllByRole('checkbox')) await user.click(checkbox);
    expect(useCompareStore.getState().selectedIds).toHaveLength(3);
    const toasts = useToastStore.getState().toasts;
    expect(toasts[toasts.length - 1]?.title).toBe('Compare is full');
  });
});
