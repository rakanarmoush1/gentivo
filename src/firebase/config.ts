import { initializeApp } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAR3Hn58ljaoj8on8ZaJebBTs2s625t4Vc",
  authDomain: "gentivo-7cd8d.firebaseapp.com",
  projectId: "gentivo-7cd8d",
  storageBucket: "gentivo-7cd8d.appspot.com", // This should match the bucket name in firebase.ts
  messagingSenderId: "324790254931",
  appId: "1:324790254931:web:313b440ad3471519ee35a6",
  measurementId: "G-YFHZL3FQWJ"
};

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// Note: For Firebase Storage, we use the explicit bucket URL in firebase.ts:
// gs://gentivo-7cd8d.firebasestorage.app 