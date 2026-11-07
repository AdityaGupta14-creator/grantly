import type { Category, EducationLevel, FieldOfStudy, Gender, IncomeBandId, SpecialFlag, State } from '@/types/options';

export interface UserProfile {
  name: string;
  level: EducationLevel;
  field: FieldOfStudy;
  state: State;
  category: Category;
  gender?: Gender | null;
  incomeBand?: IncomeBandId | null;
  percentage?: number | null;
  flags?: SpecialFlag[];
  flagsKnown?: boolean;
  isDemo: boolean;
  updatedAt: string;
}
