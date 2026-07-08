import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'cart';
  size?: 'sm' | 'md';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-semibold transition-colors rounded-sm cursor-pointer',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-5 py-2.5 text-sm',
        variant === 'primary' &&
          'bg-brand-red text-white hover:bg-brand-red-hover border border-brand-red',
        variant === 'cart' &&
          'bg-cart text-white hover:bg-cart-hover border border-cart',
        variant === 'secondary' &&
          'bg-surface text-brand-red border border-brand-red hover:bg-accent-subtle',
        variant === 'ghost' && 'bg-transparent text-brand-red hover:underline',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
