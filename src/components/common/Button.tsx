import { ButtonHTMLAttributes } from 'react';
import { DivideIcon, LucideIcon } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: typeof DivideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyle = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-stone-900 hover:bg-stone-800 text-white focus:ring-stone-300',
    secondary: 'bg-stone-100 hover:bg-stone-200 text-stone-900 focus:ring-stone-300',
    outline: 'border border-stone-300 text-stone-700 hover:bg-stone-50 focus:ring-stone-300',
    ghost: 'text-stone-700 hover:bg-stone-100 focus:ring-stone-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-300',
  };
  
  const sizes = {
    sm: 'py-2 px-3 text-sm font-light',
    md: 'py-2.5 px-4 text-base font-medium',
    lg: 'py-3 px-6 text-lg font-medium',
  };
  
  const buttonStyle = `${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <button 
      className={buttonStyle}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="mr-2 -ml-1 h-4 w-4" />
      ) : null}
      
      {children}
      
      {!loading && Icon && iconPosition === 'right' ? (
        <Icon className="ml-2 -mr-1 h-4 w-4" />
      ) : null}
    </button>
  );
}