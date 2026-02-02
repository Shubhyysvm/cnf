'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'destructive' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
      default: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5',
      outline: 'border-2 border-gray-300 hover:border-gray-400 text-gray-700 bg-white',
      destructive: 'bg-red-600 hover:bg-red-700 text-white',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    };

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm gap-1',
      md: 'px-4 py-2 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => (
    <input
      ref={ref}
      className={`rounded-lg border-2 border-gray-300 px-4 py-2 text-base focus:outline-none focus:border-blue-600 transition-colors ${className}`}
      {...props}
    />
  ),
);

Input.displayName = 'Input';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline';
}

export const Badge = ({ children, className = '', variant = 'default' }: BadgeProps) => {
  const variantStyles = {
    default: 'bg-gray-200 text-gray-800',
    secondary: 'bg-blue-200 text-blue-800',
    outline: 'border-2 border-gray-300 text-gray-700',
  };

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
