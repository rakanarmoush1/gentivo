import React, { useState } from 'react';
import { uploadImageToFirebase } from './utils/firebaseUpload';

export default function TestFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Use our centralized upload utility
      console.log('Starting upload using the centralized utility...');
      const downloadUrl = await uploadImageToFirebase(file, 'test-uploads');
      console.log('Upload successful! Download URL:', downloadUrl);
      
      // Update state
      setUrl(downloadUrl);
      setSuccess(true);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2 style={{ marginBottom: '20px' }}>Firebase Storage Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <input type="file" onChange={handleFileChange} />
      </div>
      
      <button 
        onClick={handleUpload} 
        disabled={!file || loading}
        style={{ 
          padding: '8px 16px', 
          backgroundColor: '#4f46e5', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: file && !loading ? 'pointer' : 'not-allowed',
          opacity: file && !loading ? 1 : 0.7
        }}
      >
        {loading ? 'Uploading...' : 'Upload to Firebase'}
      </button>
      
      {error && (
        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {success && (
        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '4px' }}>
          <p><strong>Upload successful!</strong></p>
          <p style={{ marginTop: '8px', wordBreak: 'break-all' }}>{url}</p>
          {url && <img src={url} alt="Uploaded file" style={{ maxWidth: '100%', marginTop: '12px' }} />}
        </div>
      )}
    </div>
  );
} 