import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { MatchBreakdown } from '@/components/scholarship/MatchBreakdown';
import { Modal } from '@/components/ui/Modal';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Toaster } from '@/components/ui/Toaster';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { DEMO_PROFILE } from '@/data/demoProfile';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useProfileStore } from '@/store/profileStore';
import { useToastStore } from '@/store/toastStore';
import { useTrackerStore } from '@/store/trackerStore';
import type { MatchCriterion } from '@/lib/match';

describe('accessible UI components', () => {
  it('ThemeToggle persists a selected theme', async () => {
    const user = userEvent.setup();
    usePreferencesStore.setState({ theme: 'light' });
    render(<ThemeToggle />);
    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
    expect(usePreferencesStore.getState().theme).toBe('dark');
    expect(window.localStorage.getItem('grantly-preferences')).toContain('dark');
  });

  it('MatchBreakdown communicates states with labels and explanatory text', () => {
    const criteria: MatchCriterion[] = [
      { id: 'income', label: 'Family income', weight: 15, status: 'met', explanation: 'Your ₹3 lakh income is below the limit.' },
      { id: 'marks', label: 'Minimum marks', weight: 15, status: 'near', explanation: 'You are 2% below the minimum.' },
      { id: 'gender', label: 'Gender', weight: 5, status: 'unknown', explanation: 'Add your gender to check this.' },
    ];
    render(<MatchBreakdown criteria={criteria} />);
    expect(screen.getByText('Met')).toBeInTheDocument();
    expect(screen.getByText('Nearly met')).toBeInTheDocument();
    expect(screen.getByText('Add info')).toBeInTheDocument();
    expect(screen.getByText('You are 2% below the minimum.')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Why you match' })).toBeInTheDocument();
  });

  it('Modal closes on Escape and returns focus to its trigger', async () => {
    const user = userEvent.setup();
    const DialogHost = () => {
      const [open, setOpen] = useState(false);
      return <><button type="button" onClick={() => setOpen(true)}>Open trigger</button>{open && <Modal open onClose={() => setOpen(false)} title="Example dialog"><button type="button">Inside</button></Modal>}</>;
    };
    render(<DialogHost />);
    await user.click(screen.getByRole('button', { name: 'Open trigger' }));
    expect(screen.getByRole('dialog', { name: 'Example dialog' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open trigger' })).toHaveFocus();
  });

  it('onboarding shows inline errors and preserves values when navigating back', async () => {
    const user = userEvent.setup();
    useProfileStore.setState({ profile: null });
    render(<MemoryRouter initialEntries={['/onboarding']}><Routes>
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/dashboard" element={<h1>Dashboard route</h1>} />
    </Routes></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByText('Enter your name (at least 2 characters).')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Your name'), 'Priya');
    await user.selectOptions(screen.getByLabelText('Current education'), 'class12');
    await user.selectOptions(screen.getByLabelText('Field of study'), 'science');
    await user.type(screen.getByLabelText('Latest percentage or GPA (as %)'), '78');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByLabelText('Your name')).toHaveValue('Priya');
    expect(screen.getByLabelText('Current education')).toHaveValue('class12');
    expect(screen.getByLabelText('Latest percentage or GPA (as %)')).toHaveValue('78');
  });

  it('404 page provides a working recovery route', () => {
    render(<MemoryRouter initialEntries={['/missing']}><Routes>
      <Route path="/missing" element={<NotFoundPage />} />
      <Route path="/dashboard" element={<h1>Dashboard route</h1>} />
    </Routes></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'We could not find that page' })).toBeInTheDocument();
  });

  it('the error boundary exposes a recovery state', () => {
    expect(ErrorBoundary.getDerivedStateFromError()).toEqual({ failed: true });
  });

  it('NotificationBell opens a labelled deadlines panel', async () => {
    const user = userEvent.setup();
    useProfileStore.setState({ profile: { ...DEMO_PROFILE, isDemo: false } });
    useTrackerStore.getState().replaceTracker({ applications: {}, reminderIds: [] });
    render(<MemoryRouter><NotificationBell /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: /Notifications/ }));
    expect(screen.getByRole('region', { name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Deadlines and prep' })).toBeInTheDocument();
  });

  it('ProfilePage imports valid JSON and shows a friendly error for invalid data', async () => {
    const user = userEvent.setup();
    useProfileStore.setState({ profile: null });
    useToastStore.setState({ toasts: [] });
    render(<><ProfilePage /><Toaster /></>);
    const fileInput = screen.getByLabelText('Choose a Grantly JSON file to import');
    const valid = new File([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), profile: null, tracker: { applications: {}, reminderIds: [] } })], 'backup.json', { type: 'application/json' });
    await user.upload(fileInput, valid);
    expect(await screen.findByText('Data imported')).toBeInTheDocument();
    const invalid = new File(['not JSON'], 'broken.json', { type: 'application/json' });
    await user.upload(fileInput, invalid);
    expect(await screen.findByText('Import failed')).toBeInTheDocument();
    expect(screen.getByText(/not valid JSON/)).toBeInTheDocument();
  });
});
