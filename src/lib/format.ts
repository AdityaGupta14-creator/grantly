import { AMOUNT_TYPE_LABELS } from '@/types/options';
import type { Scholarship } from '@/types/scholarship';

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** Format a numeric amount as Indian rupees. */
export const formatINR = (amount: number): string => inrFormatter.format(amount);

/** Format a rupee amount in lakhs when appropriate. */
export const formatLakh = (amount: number): string => {
  const lakhs = Number((amount / 100000).toFixed(1));
  return `₹${lakhs} lakh`;
};

/** Format a scholarship award with its one-time or annual frequency. */
export const formatAmount = (scholarship: Pick<Scholarship, 'amount' | 'amountType'>): string =>
  `${formatINR(scholarship.amount)} ${AMOUNT_TYPE_LABELS[scholarship.amountType]}`;
