import React, { useState } from 'react';
import { uploadImageToFirebase } from '../../utils/firebaseUpload';

interface SimpleImageUploaderProps {
  onImageUploaded: (url: string) => void;
  folder: string;
  currentImageUrl?: string;
  buttonLabel?: string;
}

export default function SimpleImageUploader({
  onImageUploaded,
  folder,
  currentImageUrl,
  buttonLabel = 'Upload Image'
}: SimpleImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      console.log('Uploading file to folder:', folder);
      
      // Use the centralized upload function
      const downloadUrl = await uploadImageToFirebase(file, folder);
      
      // Call the callback with the URL
      onImageUploaded(downloadUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      
      // Clear the input
      e.target.value = '';
    }
  };
  
  return (
    <div>
      <div className="flex items-center mb-2">
        {currentImageUrl && (
          <div className="mr-4">
            <img 
              src={currentImageUrl} 
              alt="Current" 
              className="w-16 h-16 rounded-full object-cover border border-gray-200" 
            />
          </div>
        )}
        
        <div>
          <label className="block w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50">
            {isUploading ? 'Uploading...' : buttonLabel}
            <input
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
          
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
} 