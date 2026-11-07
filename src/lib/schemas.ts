import { z } from 'zod';
import { CATEGORIES, DOCUMENT_IDS, EDUCATION_LEVELS, FIELDS_OF_STUDY, GENDERS, INCOME_BANDS, SPECIAL_FLAGS, STATES, type IncomeBandId } from '@/types/options';
import { APPLICATION_STATUSES } from '@/types/tracker';
import { SCHOLARSHIP_IDS } from '@/data/scholarshipIds';

const boundedText = (max: number) => z.string().transform((value) => value.slice(0, max));
const safeId = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const knownScholarshipId = (id: string) => (SCHOLARSHIP_IDS as readonly string[]).includes(id);

export const profileSchema = z.object({
  name: z.string().trim().min(1).transform((value) => value.slice(0, 80)),
  level: z.enum(EDUCATION_LEVELS),
  field: z.enum(FIELDS_OF_STUDY),
  state: z.enum(STATES),
  category: z.enum(CATEGORIES),
  gender: z.enum(GENDERS).nullable().optional(),
  incomeBand: z.enum(INCOME_BANDS.map((band) => band.id) as [IncomeBandId, ...IncomeBandId[]]).nullable().optional(),
  percentage: z.number().finite().transform((value) => Math.min(100, Math.max(0, value))).nullable().optional(),
  flags: z.array(z.enum(SPECIAL_FLAGS)).max(SPECIAL_FLAGS.length).optional(),
  flagsKnown: z.boolean().optional(),
  isDemo: z.boolean(),
  updatedAt: z.string().datetime(),
}).strip();

export const trackedApplicationSchema = z.object({
  scholarshipId: boundedText(120),
  status: z.enum(APPLICATION_STATUSES),
  checklist: z.record(z.string().max(80), z.boolean()).transform((items) =>
    Object.fromEntries(Object.entries(items).filter(([key]) => (DOCUMENT_IDS as readonly string[]).includes(key))),
  ),
  notes: boundedText(2000),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strip();

export const trackerDataSchema = z.object({
  applications: z.record(z.string().max(120).regex(safeId), trackedApplicationSchema).refine(
    (items) => Object.keys(items).length <= 100,
    'Too many applications',
  ).transform((items) => Object.fromEntries(Object.entries(items).filter(([key, value]) => key === value.scholarshipId && knownScholarshipId(key)))),
  reminderIds: z.array(boundedText(120).refine((id) => safeId.test(id))).max(100).transform((ids) => ids.filter(knownScholarshipId)),
}).strip();

export const profilePersistSchema = z.object({ profile: profileSchema.nullable() }).strip();
export const trackerPersistSchema = trackerDataSchema.strip();
export const preferencesPersistSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  seenNotificationIds: z.array(boundedText(160)).max(1000),
}).strip();

export const workspaceExportSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string().datetime(),
  profile: profileSchema.nullable(),
  tracker: trackerDataSchema,
}).strip();

export type SanitizedWorkspaceExport = z.infer<typeof workspaceExportSchema>;
