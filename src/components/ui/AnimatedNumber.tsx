import { animate, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
}

const defaultFormat = (value: number): string => value.toLocaleString('en-IN');

export const AnimatedNumber = ({ value, format = defaultFormat }: AnimatedNumberProps) => {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value, reduceMotion]);

  return <span>{format(display)}</span>;
};
