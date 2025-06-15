import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseApp } from "./config";

// Initialize Firebase services
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

// Initialize Firebase Storage with the explicit bucket URL
// This ensures we're connecting to the right storage bucket
export const storage = getStorage(
  firebaseApp, 
  "gs://gentivo-7cd8d.firebasestorage.app"
); 