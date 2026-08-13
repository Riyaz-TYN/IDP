import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses = {
  primary: 'bg-tyn-yellow text-tyn-navy font-bold hover:bg-tyn-yellow-dim',
  outline: 'border-2 border-tyn-yellow text-tyn-yellow hover:bg-tyn-yellow hover:text-tyn-navy',
  ghost:   'text-tyn-yellow hover:bg-tyn-navy-light',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      className={[
        'inline-flex items-center justify-center rounded-md font-semibold transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-tyn-yellow disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  ),
);

Button.displayName = 'Button';
