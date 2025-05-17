import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/firebase';

/**
 * Validates and uploads an image to Firebase Storage
 * 
 * @param file - The file to upload
 * @param folder - Optional folder path within storage (default: 'uploads')
 * @returns A promise that resolves to the download URL
 */
export async function uploadImageToFirebase(
  file: File, 
  folder: string = 'uploads'
): Promise<string> {
  // Validate file is an image
  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload an image file (JPEG, PNG, etc)');
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size must be less than 5MB');
  }
  
  try {
    // Generate a unique filename
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    const fullPath = `${folder}/${uniqueFileName}`;
    
    // Create storage reference
    const storageRef = ref(storage, fullPath);
    
    // Log the upload attempt
    console.log('Starting upload to Firebase Storage:', {
      path: fullPath,
      size: file.size,
      type: file.type
    });
    
    // Upload the file directly
    const uploadResult = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadUrl = await getDownloadURL(uploadResult.ref);
    
    console.log('Upload successful:', {
      path: fullPath,
      downloadUrl
    });
    
    return downloadUrl;
  } catch (error) {
    console.error('Firebase Storage upload failed:', error);
    throw error;
  }
} 