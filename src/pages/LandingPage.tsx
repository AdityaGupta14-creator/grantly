import { motion, useReducedMotion } from 'framer-motion';
import { BadgeCheck, Compass, Kanban, Scale, Sparkles, Target, Wallet, Bell, ArrowRight, GraduationCap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { buttonClass } from '@/components/ui/buttonStyles';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Card } from '@/components/ui/Card';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { scholarships } from '@/data/scholarships';
import { formatINR } from '@/lib/format';
import { APP_NAME, ROUTES } from '@/lib/routes';
import { loadDemoWorkspace } from '@/lib/workspace';
import { toast } from '@/store/toastStore';
import { useProfileStore } from '@/store/profileStore';
import { useState } from 'react';

const JOURNEY = [
  { icon: Compass, title: 'Discover', text: 'Search scholarships across central, state, private and NGO schemes.' },
  { icon: Target, title: 'Match', text: 'See a transparent score and exactly why you qualify or fall short.' },
  { icon: BadgeCheck, title: 'Prepare', text: 'Get a document checklist shared across every application.' },
  { icon: Kanban, title: 'Track', text: 'Move applications across a board and never miss a deadline.' },
];

const FEATURES = [
  { icon: Scale, title: 'Side-by-side compare', text: 'Line up up to three scholarships on amount, deadline and documents.' },
  { icon: Wallet, title: 'Document vault', text: 'See which certificates you need once, for every scholarship at the same time.' },
  { icon: Bell, title: 'Deadline alerts', text: 'A calendar and notification bell flag closing dates within a week.' },
  { icon: Sparkles, title: 'Plain-language mode', text: 'Switch any eligibility rule into everyday words before you apply.' },
];

const totalFunding = scholarships.reduce((sum, item) => sum + item.amount, 0);

const fadeUp = (delay: number, reduce: boolean | null) => ({
  initial: reduce ? false : { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: 'easeOut' as const },
});

export const LandingPage = () => {
  useDocumentTitle('Find it. Match it. Win it.');
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const profile = useProfileStore((state) => state.profile);
  const [confirmDemoOpen, setConfirmDemoOpen] = useState(false);

  const startDemo = () => {
    setConfirmDemoOpen(false);
    loadDemoWorkspace();
    toast.success('Demo profile loaded');
    navigate(ROUTES.dashboard);
  };

  const handleDemo = () => {
    if (profile && !profile.isDemo) {
      setConfirmDemoOpen(true);
      return;
    }
    startDemo();
  };

  return (
    <div className="space-y-24">
      <section aria-labelledby="hero-title" className="relative overflow-hidden rounded-[2rem] bg-transparent px-2 py-14 text-fg sm:px-0 sm:py-20">
        <div aria-hidden="true" className="pointer-events-none absolute -left-40 -top-24 h-[28rem] w-[28rem] rounded-full bg-lavender/35 blur-2xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-36 top-8 h-72 w-72 rounded-full bg-cyan/10 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute right-[12%] top-8 hidden h-16 w-16 rotate-12 text-cyan-600 sm:block">
          <span className="absolute left-7 top-0 h-5 w-1.5 rounded-full bg-cyan-600" />
          <span className="absolute left-1 top-9 h-1.5 w-5 rotate-[-35deg] rounded-full bg-cyan-600" />
          <span className="absolute right-0 top-9 h-1.5 w-5 rotate-[-35deg] rounded-full bg-cyan-600" />
        </div>
        <motion.div {...fadeUp(0, reduceMotion)} className="relative max-w-3xl space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-ink shadow-sm ring-1 ring-white/80">
            <GraduationCap size={16} aria-hidden="true" />
            Scholarships for Indian students
          </p>
          <h1 id="hero-title" className="font-heading text-5xl font-bold leading-[1.03] tracking-tight text-fg sm:text-7xl">
            Find it.<br />Match it. <span className="text-urgent">Win it.</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted sm:text-xl">
            {APP_NAME} turns a confusing maze of government, private and NGO scholarships into one clear plan: what you
            qualify for, what to prepare and when each deadline closes.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to={ROUTES.onboarding} className={buttonClass('cta', 'lg')}>
              Build my profile
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={handleDemo}
              className={buttonClass('secondary', 'lg', 'border-transparent bg-white/80 text-ink-900 hover:bg-white')}
            >
              Try demo profile
            </button>
          </div>
          <p className="text-sm text-muted">Sample data for demonstration. Nothing leaves your browser.</p>
        </motion.div>
      </section>

      <section aria-labelledby="stats-title" className="space-y-8">
        <h2 id="stats-title" className="sr-only">Platform at a glance</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { value: scholarships.length, label: 'scholarships tracked' },
            { value: totalFunding, label: 'in listed funding', format: (n: number) => formatINR(n) },
            { value: 4, label: 'steps from search to win' },
          ].map((stat) => (
            <Card key={stat.label} className="p-6 text-center">
              <p className="font-heading text-4xl font-bold text-primary">
                <AnimatedNumber value={stat.value} format={stat.format} />
              </p>
              <p className="mt-2 text-sm font-medium text-muted">{stat.label}</p>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="journey-title" className="space-y-8">
        <div className="max-w-2xl space-y-3">
          <h2 id="journey-title" className="font-heading text-3xl font-bold text-fg">
            One journey, four steps
          </h2>
          <p className="text-muted">Every feature in Grantly maps to one of these steps.</p>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {JOURNEY.map((step, index) => (
            <motion.li
              key={step.title}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : index * 0.08 }}
            >
              <Card interactive className="h-full p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-pale text-primary">
                  <step.icon size={22} aria-hidden="true" />
                </span>
                <p className="mt-5 text-xs font-bold uppercase tracking-wider text-link">Step {index + 1}</p>
                <h3 className="mt-1 font-heading text-xl font-semibold text-fg">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.text}</p>
              </Card>
            </motion.li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="features-title" className="space-y-8">
        <h2 id="features-title" className="font-heading text-3xl font-bold text-fg">
          Everything in one place
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="flex gap-4 p-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                <feature.icon size={20} aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-heading text-lg font-semibold text-fg">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted">{feature.text}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="cta-title" className="rounded-3xl bg-surface p-8 text-center shadow-card sm:p-12">
        <h2 id="cta-title" className="font-heading text-3xl font-bold text-fg">
          Ready to see where you stand?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">Two minutes of answers, and every scholarship is scored for you.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button variant="primary" size="lg" onClick={() => navigate(ROUTES.onboarding)}>
            Build my profile
          </Button>
          <Button variant="secondary" size="lg" onClick={handleDemo}>
            Try demo profile
          </Button>
        </div>
      </section>

      <footer className="border-t border-line/70 py-8 text-sm text-muted">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {APP_NAME} is a demonstration app. Scholarship details are sample data. Always confirm eligibility on the official portal.
          </p>
          <p className="flex items-center gap-2">
            <Sparkles size={16} aria-hidden="true" />
            Built for students across India
          </p>
        </div>
      </footer>
      <ConfirmDialog
        open={confirmDemoOpen}
        title="Load the demo profile?"
        description="This replaces your profile, tracked applications, reminders and compare list with sample data."
        confirmLabel="Load demo profile"
        onConfirm={startDemo}
        onClose={() => setConfirmDemoOpen(false)}
      />
    </div>
  );
};
