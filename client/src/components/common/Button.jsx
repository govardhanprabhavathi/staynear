import React from 'react';
import { Loader2, ArrowRight } from 'lucide-react';

const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'accent' | 'text' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconRight,
  withArrow = false,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-200 select-none focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 rounded-full',
    md: 'text-[13px] px-5 py-2.5 gap-2 rounded-full',
    lg: 'text-sm px-7 py-3.5 gap-2.5 rounded-full font-semibold',
  };

  const variantStyles = {
    primary:
      'bg-nearBlack text-pureWhite hover:bg-black border border-nearBlack hover:shadow-subtle',
    secondary:
      'bg-pureWhite text-nearBlack border border-hairline hover:border-nearBlack hover:bg-surfaceMuted/60',
    accent:
      'bg-mutedSage text-pureWhite hover:bg-mutedSage/90 border border-mutedSage hover:shadow-subtle',
    text:
      'bg-transparent text-nearBlack hover:text-mutedSage p-0 active:scale-100 justify-start',
    danger:
      'bg-softRed text-pureWhite hover:bg-softRed/90 border border-softRed',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-current" />
      ) : (
        Icon && <Icon className="w-3.5 h-3.5 shrink-0" />
      )}
      <span>{children}</span>
      {withArrow && !isLoading && (
        <ArrowRight className="w-3.5 h-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
      )}
      {iconRight && !isLoading && iconRight}
    </button>
  );
};

export default Button;
