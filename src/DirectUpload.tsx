import React, { useState } from 'react';
import { uploadImageToFirebase } from './utils/firebaseUpload';

export default function DirectUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogMessages(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setUrl(null);
    setLogMessages([]);
    
    addLog(`Starting upload for file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    
    try {
      // Create a folder path for test uploads
      const path = 'test-uploads';
      
      addLog(`Using centralized upload function to upload to ${path}`);
      
      // Use the centralized utility function to upload
      const downloadUrl = await uploadImageToFirebase(file, path);
      
      addLog(`Upload completed successfully! URL: ${downloadUrl}`);
      
      setUrl(downloadUrl);
    } catch (err) {
      console.error("Upload error:", err);
      
      if (err instanceof Error) {
        setError(err.message);
        addLog(`ERROR: ${err.message}`);
        
        // Add more detailed error info
        if ('code' in err && typeof err.code === 'string') {
          addLog(`Error code: ${err.code}`);
        }
      } else {
        setError('Unknown error occurred');
        addLog('ERROR: Unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Direct Firebase Storage Upload</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          onChange={handleFileChange}
          style={{ marginBottom: '10px', display: 'block' }}
        />
        
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !file || loading ? 'not-allowed' : 'pointer',
            opacity: !file || loading ? 0.7 : 1
          }}
        >
          {loading ? 'Uploading...' : 'Upload to Firebase'}
        </button>
      </div>
      
      {/* Logs section */}
      <div style={{ marginTop: '20px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Logs</h2>
        <div
          style={{
            backgroundColor: '#f5f5f5',
            padding: '12px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '14px',
            height: '200px',
            overflowY: 'auto',
            border: '1px solid #ddd'
          }}
        >
          {logMessages.map((log, index) => (
            <div key={index} style={{ marginBottom: '4px' }}>
              {log}
            </div>
          ))}
          {logMessages.length === 0 && (
            <div style={{ color: '#999' }}>No logs yet. Upload a file to see logs.</div>
          )}
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div
          style={{
            marginTop: '20px',
            padding: '12px',
            backgroundColor: '#FFEBEE',
            color: '#D32F2F',
            borderRadius: '4px',
            border: '1px solid #FFCDD2'
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {/* Success message */}
      {url && (
        <div
          style={{
            marginTop: '20px',
            padding: '12px',
            backgroundColor: '#E8F5E9',
            color: '#2E7D32',
            borderRadius: '4px',
            border: '1px solid #C8E6C9'
          }}
        >
          <p><strong>Upload successful!</strong></p>
          <p style={{ marginTop: '8px', wordBreak: 'break-all' }}>{url}</p>
          {url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.gif') ? (
            <img 
              src={url} 
              alt="Uploaded file" 
              style={{ 
                maxWidth: '100%', 
                marginTop: '12px',
                borderRadius: '4px',
                border: '1px solid #C8E6C9'
              }} 
            />
          ) : (
            <p style={{ marginTop: '8px' }}>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#2E7D32' }}
              >
                View uploaded file
              </a>
            </p>
          )}
        </div>
      )}
      
      {/* Firebase Configuration Info */}
      <div style={{ marginTop: '30px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Firebase Storage Info</h2>
        <p style={{ fontSize: '14px', marginBottom: '8px' }}>
          Using Firebase Storage bucket: <code>gs://gentivo-7cd8d.firebasestorage.app</code>
        </p>
      </div>
    </div>
  );
} 