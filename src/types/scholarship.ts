import type {
  AmountType,
  Category,
  DocumentId,
  EducationLevel,
  FieldOfStudy,
  Gender,
  ProviderType,
  Region,
  SpecialFlag,
} from '@/types/options';

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  providerType: ProviderType;
  amount: number;
  amountType: AmountType;
  deadline: string;
  levels: EducationLevel[];
  fields: FieldOfStudy[];
  categories: Category[];
  states: Region[];
  genders: Gender[];
  maxIncome: number | null;
  minMarks: number | null;
  flags: SpecialFlag[];
  documents: DocumentId[];
  steps: string[];
  description: string;
  plainDescription: string;
  eligibilityText: string;
  plainEligibilityText: string;
  officialUrl: string;
  tags: string[];
}
