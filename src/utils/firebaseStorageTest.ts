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
    
    // Create a reference to the test file
    const testRef = ref(storage, testPath);
    
    // Upload the test content
    await uploadString(testRef, testContent);
    
    // Get the download URL
    const url = await getDownloadURL(testRef);
    
    return { success: true, url };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
} 