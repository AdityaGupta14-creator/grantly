import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';

export type RingTone = 'strong' | 'good' | 'partial' | 'neutral';

const TONE_STROKE: Record<RingTone, string> = {
  strong: '#15803D',
  good: '#0373FF',
  partial: '#B45309',
  neutral: '#1F299C',
};

interface ProgressRingProps {
  value: number;
  label: string;
  tone?: RingTone;
  size?: number;
  stroke?: number;
  className?: string;
}

export const ProgressRing = ({ value, label, tone = 'neutral', size = 56, stroke = 6, className }: ProgressRingProps) => {
  const reduceMotion = useReducedMotion();
  const clamped = Math.min(100, Math.max(0, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      role="img"
      aria-label={`${label}: ${clamped} out of 100`}
      className={cn('relative inline-flex shrink-0 items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-line" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={TONE_STROKE[tone]}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: reduceMotion ? offset : circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: reduceMotion ? 0 : 1, ease: 'easeOut' }}
        />
      </svg>
      <span className="absolute font-heading text-sm font-semibold text-fg" aria-hidden="true">
        {clamped}
      </span>
    </div>
  );
};
