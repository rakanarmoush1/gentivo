import { useState, useRef } from 'react';
import { Upload, ImageIcon, Loader2 } from 'lucide-react';
import Button from './Button';
import { uploadImageToFirebase } from '../../utils/firebaseUpload';

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  onError?: (error: string) => void;
  storageFolder: string;
  currentImageUrl?: string;
  label?: string;
  className?: string;
}

export default function ImageUploader({
  onImageUploaded,
  onError,
  storageFolder,
  currentImageUrl,
  label = 'Upload Image',
  className = '',
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      setProgress(0);
      
      // Show some progress to indicate the upload has started
      setProgress(10);
      
      // Use the centralized upload function
      const downloadUrl = await uploadImageToFirebase(file, storageFolder);
      
      // Upload complete
      setProgress(100);
      
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Invoke the callback
      onImageUploaded(downloadUrl);
      
    } catch (error) {
      console.error('Image upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
          {currentImageUrl ? (
            <img 
              src={currentImageUrl} 
              alt="Uploaded" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-gray-400" />
          )}
        </div>
        
        <div className="flex-grow">
          <Button
            type="button"
            variant="outline"
            onClick={handleUploadClick}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                {label}
              </>
            )}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {isUploading && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {progress < 100 ? 'Uploading...' : 'Processing...'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 