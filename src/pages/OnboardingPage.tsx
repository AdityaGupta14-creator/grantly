import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileFields, type ProfileStep } from '@/components/profile/ProfileFields';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { cn } from '@/lib/cn';
import { formToDraft, profileToForm, validateProfileForm, type ProfileForm } from '@/lib/profileForm';
import { ROUTES } from '@/lib/routes';
import { toast } from '@/store/toastStore';
import { useProfileStore } from '@/store/profileStore';

const STEPS: Array<{ id: ProfileStep; title: string; description: string }> = [
  { id: 'education', title: 'Your education', description: 'Tell us what you are studying and how you have done so far.' },
  { id: 'home', title: 'Where you live', description: 'Location and category decide many scholarships.' },
  { id: 'family', title: 'Family and special status', description: 'Income and special circumstances unlock more options.' },
];

const STEP_FIELDS: Record<ProfileStep, Array<keyof ProfileForm>> = {
  education: ['name', 'level', 'field', 'percentage'],
  home: ['state', 'category', 'gender'],
  family: ['incomeBand', 'flags'],
};

export const OnboardingPage = () => {
  useDocumentTitle('Build your profile');
  const navigate = useNavigate();
  const savedProfile = useProfileStore((state) => state.profile);
  const saveProfile = useProfileStore((state) => state.saveProfile);
  const [form, setForm] = useState<ProfileForm>(() => profileToForm(savedProfile));
  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validateProfileForm(form), [form]);
  const step = STEPS[stepIndex];
  const stepErrors = Object.fromEntries(
    Object.entries(errors).filter(([key]) => STEP_FIELDS[step.id].includes(key as keyof ProfileForm)),
  );
  const stepValid = Object.keys(stepErrors).length === 0;
  const isLast = stepIndex === STEPS.length - 1;
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const handleNext = () => {
    setSubmitted(true);
    if (!stepValid) return;
    if (isLast) {
      saveProfile(formToDraft(form));
      toast.success('Profile saved', 'Here are the scholarships you match.');
      navigate(ROUTES.dashboard);
      return;
    }
    setSubmitted(false);
    setStepIndex((index) => index + 1);
  };

  const handleBack = () => {
    setSubmitted(false);
    setStepIndex((index) => Math.max(0, index - 1));
  };

  return (
    <>
      <PageHeader
        eyebrow="About 60 seconds"
        title="Build your profile"
        description="We use these answers to check every scholarship against your situation. You can change them later in your profile."
      />

      <div className="mx-auto max-w-2xl">
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between text-sm font-semibold text-fg">
            <span>
              Step {stepIndex + 1} of {STEPS.length}: {step.title}
            </span>
            <span className="text-muted">{Math.round(progress)}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Profile progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            className="h-2.5 overflow-hidden rounded-full bg-surface"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-action transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <ol className="flex justify-between gap-2" aria-label="Steps">
            {STEPS.map((item, index) => (
              <li
                key={item.id}
                aria-current={index === stepIndex ? 'step' : undefined}
                className={cn(
                  'flex flex-1 items-center gap-2 text-xs font-semibold sm:text-sm',
                  index <= stepIndex ? 'text-fg' : 'text-muted',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs',
                    index < stepIndex && 'border-success bg-success text-white',
                    index === stepIndex && 'border-primary bg-primary text-white',
                    index > stepIndex && 'border-line bg-surface',
                  )}
                >
                  {index < stepIndex ? <Check size={14} aria-hidden="true" /> : index + 1}
                </span>
                <span className="hidden truncate sm:inline">{item.title}</span>
              </li>
            ))}
          </ol>
        </div>

        <Card className="p-6 sm:p-8">
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              handleNext();
            }}
          >
            <h2 className="font-heading text-2xl font-semibold text-fg">{step.title}</h2>
            <p className="mb-6 mt-1 text-sm text-muted">{step.description}</p>

            <ProfileFields
              step={step.id}
              form={form}
              errors={submitted ? stepErrors : {}}
              onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
            />

            <div className="mt-8 flex items-center justify-between gap-3">
              <Button variant="ghost" onClick={handleBack} disabled={stepIndex === 0}>
                <ArrowLeft size={18} aria-hidden="true" />
                Back
              </Button>
              <Button type="submit" variant={isLast ? 'cta' : 'primary'} size="lg">
                {isLast ? 'See my matches' : 'Continue'}
                {isLast ? <Check size={18} aria-hidden="true" /> : <ArrowRight size={18} aria-hidden="true" />}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
};
