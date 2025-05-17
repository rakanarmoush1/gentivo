import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * A utility function to test Firebase Storage by uploading a small text file.
 * This helps verify the storage bucket is correctly configured.
 */
export async function testStorageConnection(timeoutMs = 5000): Promise<boolean> {
  let timeoutId: NodeJS.Timeout | null = null;
  
  try {
    console.log('Storage Test: Starting Firebase Storage connection test...');
    
    // Create a promise that will reject after the timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Storage connection test timed out after ' + timeoutMs + 'ms'));
      }, timeoutMs);
    });
    
    // Create the actual test promise
    const testPromise = (async () => {
      // Create a reference to the test file location
      console.log('Storage Test: Creating storage reference...');
      const testRef = ref(storage, 'test/connection-test.txt');
      console.log('Storage Test: Reference created:', testRef.fullPath);
      
      // Upload a small string
      const testData = `Test connection ${new Date().toISOString()}`;
      console.log('Storage Test: Uploading test data...');
      await uploadString(testRef, testData);
      console.log('Storage Test: Upload successful');
      
      // Try to get the download URL
      console.log('Storage Test: Getting download URL...');
      const url = await getDownloadURL(testRef);
      console.log('Storage Test: Download URL retrieved:', url);
      
      return true;
    })();
    
    // Race between the timeout and the test
    const result = await Promise.race([testPromise, timeoutPromise]);
    
    // Clear the timeout if the test completed before the timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    console.log('Storage Test: Firebase Storage test successful');
    return result;
  } catch (error) {
    // Clear the timeout if it exists
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    console.error('Storage Test: Firebase Storage test failed:', error);
    return false;
  }
} 