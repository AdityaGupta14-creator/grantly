import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface FieldWrapperProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

const FieldWrapper = ({ id, label, error, hint, children }: FieldWrapperProps) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-sm font-semibold text-fg">
      {label}
    </label>
    {children}
    {hint && !error && (
      <p id={`${id}-hint`} className="text-sm text-muted">
        {hint}
      </p>
    )}
    {error && (
      <p id={`${id}-error`} role="alert" className="text-sm font-medium text-danger-700 dark:text-danger-300">
        {error}
      </p>
    )}
  </div>
);

const fieldClass = (hasError: boolean): string =>
  cn(
    'w-full rounded-xl border bg-surface px-4 py-3 text-base text-fg shadow-sm transition',
    'placeholder:text-muted focus:border-action focus:outline-none focus:ring-2 focus:ring-action/40',
    hasError ? 'border-danger' : 'border-line',
  );

const describedBy = (id: string, error?: string, hint?: string): string | undefined => {
  const ids = [error ? `${id}-error` : null, !error && hint ? `${id}-hint` : null].filter(Boolean);
  return ids.length > 0 ? ids.join(' ') : undefined;
};

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const TextField = ({ label, error, hint, id, ...props }: TextFieldProps) => {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <FieldWrapper id={fieldId} label={label} error={error} hint={hint}>
      <input
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(fieldId, error, hint)}
        className={fieldClass(Boolean(error))}
        {...props}
      />
    </FieldWrapper>
  );
};

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const SelectField = ({ label, error, hint, id, children, ...props }: SelectFieldProps) => {
  const generated = useId();
  const fieldId = id ?? generated;
  return (
    <FieldWrapper id={fieldId} label={label} error={error} hint={hint}>
      <select
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(fieldId, error, hint)}
        className={fieldClass(Boolean(error))}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  );
};
