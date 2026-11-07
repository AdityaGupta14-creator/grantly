import { scholarships } from '@/data/scholarships';
import type { Scholarship } from '@/types/scholarship';

const scholarshipById = new Map<string, Scholarship>(scholarships.map((item) => [item.id, item]));

export const findScholarship = (id: string): Scholarship | undefined => scholarshipById.get(id);

export const scholarshipMap = scholarshipById;
