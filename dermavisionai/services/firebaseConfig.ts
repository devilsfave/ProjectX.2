import  firebase  from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA31h_KyFq8MbwzJt5NKZWZMTkFcqrI6nQ",
  authDomain: "dermaviosion-ai.firebaseapp.com",
  projectId: "dermaviosion-ai",
  storageBucket: "dermaviosion-ai.appspot.com",
  messagingSenderId: "537710907865",
  appId: "1:537710907865:android:a3fb336ef1826ecdd789c8",
  measurementId: "G-XXXXXXX" // Replace with your actual measurement ID if you're using Analytics
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export { firebase, auth, firestore, storage };