import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
    Auth,
    User,
    UserCredential,
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    onAuthStateChanged,
    signOut,
    updateProfile
} from 'firebase/auth';
import { getFirestore, Firestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Firebase configuration details
const firebaseConfig = {
    apiKey: "AIzaSyA31h_KyFq8MbwzJt5NKZWZMTkFcqrI6nQ",
    authDomain: "dermaviosion-ai.firebaseapp.com",
    projectId: "dermaviosion-ai",
    storageBucket: "dermaviosion-ai.appspot.com",
    messagingSenderId: "537710907865",
    appId: "1:537710907865:android:a3fb336ef1826ecdd789c8",
    measurementId: "G-XXXXXXX"
};

// Initialize Firebase app
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    role: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string, role: string) => Promise<void>;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    loginWithFacebook: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                setRole(userDoc.exists() ? userDoc.data()?.role : null);
            }
            setUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Error message helper function
    const getErrorMessage = (code: string): string => {
        switch (code) {
            case 'auth/wrong-password':
                return 'Incorrect password.';
            case 'auth/user-not-found':
                return 'No user found with this email.';
            default:
                return 'An unexpected error occurred. Please try again.';
        }
    };

    // Function to set user role to admin
    const setAdminRole = async (email: string) => {
        try {
            const usersRef = collection(db, 'users');
            const querySnapshot = await getDocs(query(usersRef, where('email', '==', email)));
    
            querySnapshot.forEach(async (document) => {
                // Update the user's role to 'admin'
                await updateDoc(doc(db, 'users', document.id), { role: 'admin' });
            });
        } catch (error) {
            console.error('Error setting admin role:', error);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            Alert.alert('Login Error', getErrorMessage(error.code));
        }
    };

    const signup = async (email: string, password: string, name: string, role: string) => {
        try {
            const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (userCredential.user) {
                await updateProfile(userCredential.user, { displayName: name });
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    name,
                    email,
                    role,
                });
            }
        } catch (error: any) {
            Alert.alert('Signup Error', getErrorMessage(error.code));
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error: any) {
            Alert.alert('Logout Error', getErrorMessage(error.code));
        }
    };

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            Alert.alert('Google Login Error', getErrorMessage(error.code));
        }
    };

    const loginWithFacebook = async () => {
        try {
            const provider = new FacebookAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            Alert.alert('Facebook Login Error', getErrorMessage(error.code));
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        role,
        login,
        signup,
        logout,
        loginWithGoogle,
        loginWithFacebook,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};