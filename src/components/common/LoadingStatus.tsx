import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStatusProps {
  message?: string;
  showDetails?: boolean;
}

/**
 * A component that displays a loading indicator with an optional message
 */
export default function LoadingStatus({ 
  message = 'Loading...', 
  showDetails = false 
}: LoadingStatusProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div className="flex items-center mb-4">
        <Loader2 className="h-5 w-5 text-primary animate-spin mr-2" />
        <span className="text-gray-700 font-medium">{message}</span>
      </div>
      
      {showDetails && (
        <div className="bg-gray-50 border border-gray-100 rounded-md p-4 w-full max-w-md mt-4">
          <p className="text-xs text-gray-500 mb-2">Loading process:</p>
          <ol className="list-decimal list-inside text-xs text-gray-500 space-y-1">
            <li>Establishing connection to database</li>
            <li>Loading salon configuration</li>
            <li>Preparing user interface</li>
            <li>Checking storage connection</li>
          </ol>
          <p className="text-xs text-gray-500 mt-2">
            This may take a moment. Please wait...
          </p>
        </div>
      )}
    </div>
  );
} 