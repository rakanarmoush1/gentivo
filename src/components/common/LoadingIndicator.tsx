import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  isLoading: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export default function LoadingIndicator({ 
  isLoading, 
  size = 'sm', 
  className = '', 
  text 
}: LoadingIndicatorProps) {
  if (!isLoading) return null;

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Loader2 className={`animate-spin text-gray-400 ${sizeClasses[size]}`} />
      {text && (
        <span className="text-xs text-gray-500">{text}</span>
      )}
    </div>
  );
} 