// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOwYzehhea2yuJDMTKfRL8IR34SSX0FFk",
  authDomain: "sa-crm-a79ce.firebaseapp.com",
  projectId: "sa-crm-a79ce",
  storageBucket: "sa-crm-a79ce.firebasestorage.app",
  messagingSenderId: "128393997836",
  appId: "1:128393997836:web:ead7140a94070cab764829"
};

// Initialize Firebase (singleton pattern for Next.js)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };