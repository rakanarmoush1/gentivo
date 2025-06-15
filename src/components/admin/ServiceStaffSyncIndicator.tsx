import { useState, useEffect } from 'react';
import { RotateCw, CheckCircle } from 'lucide-react';

interface ServiceStaffSyncIndicatorProps {
  show: boolean;
  message?: string;
}

export default function ServiceStaffSyncIndicator({ 
  show, 
  message = "Syncing service assignments..." 
}: ServiceStaffSyncIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsSuccess(false);
      
      // Auto-hide after 3 seconds and show success
      const timer = setTimeout(() => {
        setIsSuccess(true);
        setTimeout(() => {
          setIsVisible(false);
          setIsSuccess(false);
        }, 1500);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`
        flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-300
        ${isSuccess 
          ? 'bg-green-100 border border-green-200 text-green-800' 
          : 'bg-blue-100 border border-blue-200 text-blue-800'
        }
      `}>
        {isSuccess ? (
          <>
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Service assignments synced!</span>
          </>
        ) : (
          <>
            <RotateCw className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">{message}</span>
          </>
        )}
      </div>
    </div>
  );
} 