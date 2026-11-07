import type { DocumentId } from '@/types/options';

export interface DocumentInfo {
  label: string;
  description: string;
}

export const DOCUMENT_CATALOG: Record<DocumentId, DocumentInfo> = {
  aadhaar: { label: 'Aadhaar card', description: 'Copy of your 12-digit Aadhaar card, both sides.' },
  income_certificate: {
    label: 'Income certificate',
    description: 'Issued by the tehsil or revenue office, dated within the last year.',
  },
  caste_certificate: {
    label: 'Caste certificate',
    description: 'SC, ST, OBC or EWS certificate from the competent authority.',
  },
  marksheet: { label: 'Previous marksheet', description: 'Latest marksheet or result card of the last exam.' },
  bank_passbook: {
    label: 'Bank passbook',
    description: 'First page with account number and IFSC, linked to Aadhaar.',
  },
  bonafide: {
    label: 'Bonafide certificate',
    description: 'Proof of enrolment from your current institution, signed by the principal.',
  },
  passport_photo: { label: 'Passport photo', description: 'Recent colour photo on a plain background.' },
  domicile: { label: 'Domicile certificate', description: 'Proof of residence in the state offering the scheme.' },
  disability_certificate: {
    label: 'Disability certificate',
    description: 'UDID or medical board certificate showing at least 40% disability.',
  },
  admission_letter: {
    label: 'Admission letter',
    description: 'Letter or fee receipt confirming admission to the course.',
  },
  sports_certificate: {
    label: 'Sports participation certificate',
    description: 'Certificate from a recognised sports body for state or national level play.',
  },
};
