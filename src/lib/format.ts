import { AMOUNT_TYPE_LABELS } from '@/types/options';
import type { Scholarship } from '@/types/scholarship';

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export const formatINR = (amount: number): string => inrFormatter.format(amount);

export const formatLakh = (amount: number): string => {
  const lakhs = Number((amount / 100000).toFixed(1));
  return `₹${lakhs} lakh`;
};

export const formatAmount = (scholarship: Pick<Scholarship, 'amount' | 'amountType'>): string =>
  `${formatINR(scholarship.amount)} ${AMOUNT_TYPE_LABELS[scholarship.amountType]}`;
