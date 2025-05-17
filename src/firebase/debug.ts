import { ref, listAll } from 'firebase/storage';
import { getDocs, collection } from 'firebase/firestore';
import { storage, db } from './firebase';

/**
 * Utility to check Firestore connection
 */
export async function checkFirestoreConnection(timeoutMs = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    // Create a timeout that will resolve to false
    const timeoutId = setTimeout(() => {
      console.error('Firestore connection check timed out after', timeoutMs, 'ms');
      resolve(false);
    }, timeoutMs);
    
    // Try to get a small collection
    console.log('Debug: Checking Firestore connection...');
    
    (async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'diagnostics'));
        console.log('Debug: Firestore connection successful', {
          docs: querySnapshot.size
        });
        
        clearTimeout(timeoutId);
        resolve(true);
      } catch (error) {
        console.error('Debug: Firestore connection failed:', error);
        clearTimeout(timeoutId);
        resolve(false);
      }
    })();
  });
}

/**
 * Utility to check Firebase Storage connectivity
 */
export async function checkStorageConnection(timeoutMs = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    // Create a timeout that will resolve to false
    const timeoutId = setTimeout(() => {
      console.error('Storage connection check timed out after', timeoutMs, 'ms');
      resolve(false);
    }, timeoutMs);
    
    // Try to list the root contents with a limit of 1
    console.log('Debug: Checking Storage connection...');
    
    (async () => {
      try {
        const storageRef = ref(storage);
        const result = await listAll(storageRef);
        
        console.log('Debug: Storage connection successful', {
          prefixes: result.prefixes.length,
          items: result.items.length
        });
        
        clearTimeout(timeoutId);
        resolve(true);
      } catch (error) {
        console.error('Debug: Storage connection failed:', error);
        clearTimeout(timeoutId);
        resolve(false);
      }
    })();
  });
} 