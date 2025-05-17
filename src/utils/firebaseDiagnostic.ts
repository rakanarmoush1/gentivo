import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { storage, db } from '../firebase/firebase';
import { firebaseApp } from '../firebase/config';

/**
 * A diagnostic utility to test Firebase Storage connectivity
 * Can be used to debug storage issues
 */
export async function diagnoseFirebaseStorage(): Promise<{
  success: boolean;
  storageConnected: boolean;
  firestoreConnected: boolean;
  storageConfig: any;
  errors: string[];
  logs: string[];
}> {
  const logs: string[] = [];
  const errors: string[] = [];
  
  logs.push('Starting Firebase diagnostic...');
  
  let storageConnected = false;
  let firestoreConnected = false;
  
  // Get storage config information
  const storageConfig = {
    appName: firebaseApp.name,
    storageBucket: firebaseApp.options.storageBucket
  };
  logs.push(`Firebase config: ${JSON.stringify(storageConfig)}`);
  
  // Check Firestore connection
  try {
    logs.push('Testing Firestore connection...');
    
    // Create a test document in a diagnostic collection
    const testDoc = doc(db, 'diagnostics', 'test');
    const timestamp = new Date().toISOString();
    await setDoc(testDoc, { 
      timestamp,
      source: 'diagnostic-tool'
    });
    
    // Try to read it back
    const readResult = await getDoc(testDoc);
    if (readResult.exists()) {
      logs.push('Successfully wrote and read from Firestore');
      firestoreConnected = true;
    } else {
      errors.push('Could not read test document from Firestore');
    }
  } catch (error) {
    errors.push(`Firestore test failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // Check Storage connection
  try {
    logs.push('Testing Firebase Storage connection...');
    
    // Try to upload a small string file
    const testRef = ref(storage, 'diagnostics/test-file.txt');
    const content = `Test file created at ${new Date().toISOString()}`;
    await uploadString(testRef, content);
    
    // Try to get the download URL
    const url = await getDownloadURL(testRef);
    logs.push(`Successfully uploaded test file and got download URL: ${url}`);
    storageConnected = true;
  } catch (error) {
    errors.push(`Storage test failed: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  const success = storageConnected && firestoreConnected;
  
  return {
    success,
    storageConnected,
    firestoreConnected,
    storageConfig,
    errors,
    logs
  };
} 