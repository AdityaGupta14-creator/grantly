import type { ButtonHTMLAttributes } from 'react';
import { buttonClass, type ButtonSize, type ButtonVariant } from '@/components/ui/buttonStyles';
export type { ButtonSize, ButtonVariant } from '@/components/ui/buttonStyles';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = ({ variant, size, className, type = 'button', ...props }: ButtonProps) => (
  <button type={type} className={buttonClass(variant, size, className)} {...props} />
);
