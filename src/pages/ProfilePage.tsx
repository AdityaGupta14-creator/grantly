import { Download, RotateCcw, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { ProfileFields } from '@/components/profile/ProfileFields';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageHeader } from '@/components/ui/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formToDraft, profileToForm, validateProfileForm, type ProfileForm } from '@/lib/profileForm';
import { exportWorkspace, importWorkspace, resetWorkspace } from '@/lib/workspace';
import { toast } from '@/store/toastStore';
import { useProfileStore } from '@/store/profileStore';

const EXPORT_FILENAME = 'grantly-workspace.json';

const readFileText = (file: File): Promise<string> => {
  if (typeof file.text === 'function') return file.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('The file could not be read.'));
    reader.onerror = () => reject(new Error('The file could not be read.'));
    reader.readAsText(file);
  });
};

export const ProfilePage = () => {
  useDocumentTitle('Your profile');
  const profile = useProfileStore((state) => state.profile);
  const saveProfile = useProfileStore((state) => state.saveProfile);
  const [form, setForm] = useState<ProfileForm>(() => profileToForm(profile));
  const [submitted, setSubmitted] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const errors = validateProfileForm(form);
  const hasErrors = Object.keys(errors).length > 0;

  const handleSave = () => {
    setSubmitted(true);
    if (hasErrors) return;
    saveProfile(formToDraft(form));
    toast.success('Profile updated', 'Your matches have been recalculated.');
  };

  const handleExport = () => {
    const blob = new Blob([exportWorkspace()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = EXPORT_FILENAME;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Export ready', 'Your data was downloaded as a JSON file.');
  };

  const handleImport = async (file: File) => {
    try {
      if (!file.name.toLowerCase().endsWith('.json') || file.size > 1_048_576) {
        throw new Error(file.size > 1_048_576 ? 'Choose a JSON file smaller than 1 MB.' : 'Choose a .json Grantly backup file.');
      }
      importWorkspace(await readFileText(file));
      setForm(profileToForm(useProfileStore.getState().profile));
      toast.success('Data imported', 'Your profile and tracker were restored.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The file could not be read.';
      toast.danger('Import failed', message);
    }
  };

  const handleReset = () => {
    resetWorkspace();
    setForm(profileToForm(null));
    setSubmitted(false);
    setResetOpen(false);
    toast.info('Data reset', 'Your profile, tracker and compare list were cleared.');
  };

  return (
    <>
      <PageHeader
        eyebrow="Your details"
        title="Profile and data"
        description="Changes here update every match. Export a backup or move your data to another browser."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-6 p-6 lg:col-span-2">
          <h2 className="font-heading text-xl font-semibold text-fg">Edit profile</h2>
          {!profile && (
            <p className="rounded-xl bg-raised p-4 text-sm text-muted">
              You have not set up a profile yet. Fill in the details below to start matching.
            </p>
          )}
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              handleSave();
            }}
            className="space-y-6"
          >
            <ProfileFields form={form} errors={submitted ? errors : {}} onChange={(patch) => setForm((current) => ({ ...current, ...patch }))} />
            <div className="flex justify-end">
              <Button type="submit" variant="primary" size="lg">
                Save profile
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4 p-6">
            <h2 className="font-heading text-lg font-semibold text-fg">Backup and move</h2>
            <p className="text-sm text-muted">Download everything as a file, or restore from one you saved earlier.</p>
            <Button variant="secondary" className="w-full" onClick={handleExport}>
              <Download size={18} aria-hidden="true" />
              Export data
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => fileInput.current?.click()}>
              <Upload size={18} aria-hidden="true" />
              Import data
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              aria-label="Choose a Grantly JSON file to import"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = '';
                if (file) void handleImport(file);
              }}
            />
          </Card>

          <Card className="space-y-4 border-danger/40 p-6">
            <h2 className="font-heading text-lg font-semibold text-danger-700 dark:text-danger-300">Reset everything</h2>
            <p className="text-sm text-muted">Clears your profile, tracker, notes and compare list from this browser.</p>
            <Button variant="danger" className="w-full" onClick={() => setResetOpen(true)}>
              <RotateCcw size={18} aria-hidden="true" />
              Reset all data
            </Button>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={resetOpen}
        title="Reset all data?"
        description="This removes your profile, tracker and notes from this browser. Export first if you want a backup."
        confirmLabel="Reset data"
        onConfirm={handleReset}
        onClose={() => setResetOpen(false)}
      />
    </>
  );
};
