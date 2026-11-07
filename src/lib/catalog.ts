import { scholarships } from '@/data/scholarships';
import type { Scholarship } from '@/types/scholarship';
import { z } from 'zod';

const scholarshipById = new Map<string, Scholarship>(scholarships.map((item) => [item.id, item]));

const scholarshipIdSchema = z.string().max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

/** Return only catalog items addressed by a well-formed route id. */
export const findScholarship = (id: string): Scholarship | undefined =>
  scholarshipIdSchema.safeParse(id).success ? scholarshipById.get(id) : undefined;

export const scholarshipMap = scholarshipById;
