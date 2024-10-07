import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA31h_KyFq8MbwzJt5NKZWZMTkFcqrI6nQ",
  authDomain: "dermaviosion-ai.firebaseapp.com",
  projectId: "dermaviosion-ai",
  storageBucket: "dermaviosion-ai.appspot.com",
  messagingSenderId: "537710907865",
  appId: "1:537710907865:android:a3fb336ef1826ecdd789c8",
  measurementId: "G-XXXXXXX" // Replace with your actual measurement ID if you're using Analytics
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };