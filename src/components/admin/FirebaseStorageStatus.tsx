import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { testFirebaseStorage } from '../../utils/firebaseStorageTest';

/**
 * Component to display Firebase Storage connection status
 * Used for diagnostics when troubleshooting upload issues
 */
export default function FirebaseStorageStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [message, setMessage] = useState('Checking Firebase Storage connection...');
  const [testUrl, setTestUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkConnection = async () => {
      try {
        const result = await testFirebaseStorage();
        
        if (!isMounted) return;
        
        if (result.success) {
          setStatus('connected');
          setMessage('Firebase Storage is connected and working properly.');
          setTestUrl(result.url || null);
        } else {
          setStatus('error');
          setMessage(`Firebase Storage connection error: ${result.error || 'Unknown error'}`);
        }
      } catch (error) {
        if (!isMounted) return;
        
        setStatus('error');
        setMessage(`Failed to test Firebase Storage: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    checkConnection();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <h3 className="text-lg font-medium mb-2 flex items-center">
        {status === 'checking' && (
          <Info className="w-5 h-5 text-blue-500 mr-2" />
        )}
        {status === 'connected' && (
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
        )}
        {status === 'error' && (
          <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
        )}
        Firebase Storage Status
      </h3>
      
      <div className="text-sm text-gray-600 mb-2">
        {message}
      </div>
      
      {status === 'connected' && testUrl && (
        <div className="text-xs text-gray-500 mt-2">
          <div>Test file uploaded successfully to:</div>
          <a 
            href={testUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 break-all"
          >
            {testUrl}
          </a>
        </div>
      )}
      
      <div className="text-xs text-gray-500 mt-3">
        <div>Storage Bucket: <code>gs://gentivo-7cd8d.firebasestorage.app</code></div>
      </div>
    </div>
  );
} 