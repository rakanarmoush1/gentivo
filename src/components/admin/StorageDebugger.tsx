import { useState, useEffect } from 'react';
import { diagnoseFirebaseStorage } from '../../utils/firebaseDiagnostic';
import { AlertTriangle, HelpCircle, CheckCircle } from 'lucide-react';
import Button from '../common/Button';

/**
 * Component for debugging Firebase Storage connection issues
 */
export default function StorageDebugger() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const runDiagnostic = async () => {
    try {
      setIsRunning(true);
      setLogs([]);
      addLog('Starting Firebase Storage diagnostics...');

      const diagnosticResults = await diagnoseFirebaseStorage();
      addLog(`Diagnostics complete. Success: ${diagnosticResults.success}`);
      
      setResults(diagnosticResults);
    } catch (error) {
      addLog(`Error running diagnostics: ${error instanceof Error ? error.message : String(error)}`);
      setResults({ success: false, errors: ['Diagnostic tool crashed'] });
    } finally {
      setIsRunning(false);
    }
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    // Run diagnostics on mount
    runDiagnostic();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Firebase Storage Debugger</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={runDiagnostic} 
          loading={isRunning}
        >
          {isRunning ? 'Running...' : 'Run Diagnostic'}
        </Button>
      </div>
      
      {results && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            {results.success ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">
              {results.success ? 'All systems operational' : 'Issues detected'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm font-medium mb-1">Firebase Storage:</p>
              <div className="flex items-center">
                {results.storageConnected ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className="text-sm">
                  {results.storageConnected ? 'Connected' : 'Connection issues'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Firestore:</p>
              <div className="flex items-center">
                {results.firestoreConnected ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className="text-sm">
                  {results.firestoreConnected ? 'Connected' : 'Connection issues'}
                </span>
              </div>
            </div>
          </div>
          
          {results.errors && results.errors.length > 0 && (
            <div className="bg-red-50 border border-red-100 rounded p-3 mb-4">
              <p className="text-sm font-medium text-red-800 mb-2">Errors detected:</p>
              <ul className="text-sm text-red-700 list-disc pl-5 space-y-1">
                {results.errors.map((error: string, index: number) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div>
            <p className="text-sm font-medium mb-1">Storage Configuration:</p>
            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
              {JSON.stringify(results.storageConfig, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      <div>
        <p className="text-sm font-medium mb-1">Diagnostic Logs:</p>
        <div className="bg-gray-800 text-gray-200 rounded p-2 h-32 overflow-auto font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-gray-500 p-2">No logs yet. Run diagnostic to see logs.</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="pb-1">{log}</div>
            ))
          )}
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 flex items-center">
        <HelpCircle className="h-3 w-3 mr-1" />
        <span>
          This tool helps diagnose Firebase Storage connection issues. The information shown here 
          may help the development team troubleshoot any problems.
        </span>
      </div>
    </div>
  );
} 