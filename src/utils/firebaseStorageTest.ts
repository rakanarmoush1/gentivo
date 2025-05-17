import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/firebase';

/**
 * A simple test to check if Firebase Storage is working correctly
 * 
 * @returns Promise with test result and URL if successful
 */
export async function testFirebaseStorage(): Promise<{success: boolean; url?: string; error?: string}> {
  try {
    // Create a test file with timestamp to ensure uniqueness
    const testContent = `Test file ${new Date().toISOString()}`;
    const testPath = `test/storage-test-${Date.now()}.txt`;
    
    console.log(`Testing Firebase Storage with path: ${testPath}`);
    
    // Create a reference to the test file
    const testRef = ref(storage, testPath);
    
    // Upload the test content
    console.log('Uploading test content...');
    await uploadString(testRef, testContent);
    
    // Get the download URL
    console.log('Getting download URL...');
    const url = await getDownloadURL(testRef);
    
    console.log('Firebase Storage test successful!', { url });
    return { success: true, url };
  } catch (error) {
    console.error('Firebase Storage test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 