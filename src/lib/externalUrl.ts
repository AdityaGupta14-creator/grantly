import { z } from 'zod';

const httpsUrlSchema = z.string().url().refine((value) => {
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
});

/** Return an external HTTPS URL only; unsafe or malformed links are omitted. */
export const safeExternalUrl = (value: string): string | null => {
  const result = httpsUrlSchema.safeParse(value);
  return result.success ? result.data : null;
};
