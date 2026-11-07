import { useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
}

const defaultFormat = (value: number): string => value.toLocaleString('en-IN');

export const AnimatedNumber = ({ value, format = defaultFormat }: AnimatedNumberProps) => {
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / 1200);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span>{format(display)}</span>;
};
