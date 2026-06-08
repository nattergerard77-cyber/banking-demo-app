import { cn } from '@/lib/cn';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
}

export default function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-navy-main text-white hover:bg-navy-secondary focus:ring-navy-main",
    secondary: "bg-green-light text-navy-main hover:bg-green-accent focus:ring-green-accent",
    ghost: "bg-transparent text-secondary hover:bg-global focus:ring-gray-200",
    outline: "border border-border text-main hover:bg-global focus:ring-gray-200"
  };

  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
