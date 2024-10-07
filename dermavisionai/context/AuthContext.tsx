import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Alert } from 'react-native';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';

export interface AuthContextType {
  user: any | null;
  loading: boolean;
  role: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        setRole(userDoc.exists ? userDoc.data()?.role : null);
      }
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getErrorMessage = (code: string): string => {
    switch (code) {
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/user-not-found':
        return 'No user found with this email.';
      case 'auth/email-already-in-use':
        return 'Email already in use.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      Alert.alert('Login Error', getErrorMessage(error.code));
    }
  };

  const signup = async (email: string, password: string, name: string, role: string) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      if (userCredential.user) {
        await userCredential.user.updateProfile({ displayName: name });
        await firestore().collection('users').doc(userCredential.user.uid).set({
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
      await auth().signOut();
    } catch (error: any) {
      Alert.alert('Logout Error', getErrorMessage(error.code));
    }
  };

  const loginWithFacebook = async () => {
    try {
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
      if (result.isCancelled) {
        throw new Error('User cancelled the login process');
      }

      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        throw new Error('Something went wrong obtaining access token');
      }

      const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);

      const userCredential = await auth().signInWithCredential(facebookCredential);

      if (userCredential.additionalUserInfo?.isNewUser) {
        const { uid, displayName, email } = userCredential.user;
        await firestore().collection('users').doc(uid).set({
          name: displayName,
          email,
          role: 'user',
        });
      }
    } catch (error: any) {
      Alert.alert('Facebook Login Error', error.message);
    }
  };

  const resetPassword = async (email: string) => {
    if (!email) {
      throw new Error('Email is required for password reset');
    }
    await auth().sendPasswordResetEmail(email);
  };

  const value: AuthContextType = {
    user,
    loading,
    role,
    login,
    signup,
    logout,
    loginWithFacebook,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};