import firestore from '@react-native-firebase/firestore';
import { AuthContextType } from '../context/AuthContext';

const db = firestore();

interface Prediction {
  [key: string]: number;
}

interface HistoryItem {
  date: string;
  prediction: Prediction;
  imageUri: string;
}

interface FilterOptions {
  specialization?: string;
  location?: string;
}

// Function to save analysis history to Firestore
export const saveAnalysisToFirestore = async (prediction: Prediction, imageUri: string, getAuth: () => AuthContextType) => {
  try {
    const { user } = getAuth();
    
    if (!user) {
      throw new Error('User not authenticated. Cannot save analysis history.');
    }

    const historyItem: HistoryItem = {
      date: new Date().toISOString(),
      prediction,
      imageUri,
    };

    const userHistoryRef = db.collection('users').doc(user.uid).collection('analysisHistory');
    await userHistoryRef.add(historyItem);
  } catch (error) {
    console.error('Error saving analysis to Firestore:', error);
    throw error;
  }
};

// Function to load analysis history from Firestore
export const loadAnalysisHistoryFromFirestore = async (getAuth: () => AuthContextType) => {
  try {
    const { user } = getAuth();
    if (!user) {
      throw new Error('User not authenticated. Cannot load analysis history.');
    }

    const userHistoryRef = db.collection('users').doc(user.uid).collection('analysisHistory');
    const snapshot = await userHistoryRef.orderBy('date', 'desc').get();

    const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as HistoryItem }));

    return history;
  } catch (error) {
    console.error('Error loading analysis history from Firestore:', error);
    throw error;
  }
};

// Function to delete a specific analysis from Firestore
export const deleteAnalysisFromFirestore = async (documentId: string, getAuth: () => AuthContextType) => {
  try {
    const { user } = getAuth();
    if (!user) {
      throw new Error('User not authenticated. Cannot delete analysis history.');
    }

    const docRef = db
      .collection('users')
      .doc(user.uid)
      .collection('analysisHistory')
      .doc(documentId);

    await docRef.delete();
  } catch (error) {
    console.error('Error deleting analysis from Firestore:', error);
    throw error;
  }
};

// Function to delete all analyses from Firestore
export const deleteAllAnalysesFromFirestore = async (getAuth: () => AuthContextType) => {
  try {
    const { user } = getAuth();
    if (!user) {
      throw new Error('User not authenticated. Cannot clear analysis history.');
    }

    const userHistoryRef = db.collection('users').doc(user.uid).collection('analysisHistory');

    const snapshot = await userHistoryRef.get();

    const batch = db.batch();

    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error('Error clearing analysis history from Firestore:', error);
    throw error;
  }
};

// Function to fetch unverified doctors from Firestore
export const fetchUnverifiedDoctors = async (filter: FilterOptions = {}) => {
  try {
    let query = db.collection('users').where('role', '==', 'doctor').where('verificationStatus', '==', 'pending');

    if (filter.specialization) {
      query = query.where('specialization', '==', filter.specialization);
    }

    if (filter.location) {
      query = query.where('location', '==', filter.location);
    }

    const snapshot = await query.get();

    // Ensure to return the complete doctor object
    return snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,           // Make sure these fields exist in your Firestore
      specialization: doc.data().specialization,
      location: doc.data().location,
      rating: doc.data().rating || 0,  // Default to 0 if rating does not exist
    }));
  } catch (error) {
    console.error('Error fetching unverified doctors:', error);
    throw error;
  }
};

// Function to verify a doctor in Firestore
export const verifyDoctorInFirestore = async (doctorId: string) => {
  try {
    const docRef = db.collection('users').doc(doctorId);
    await docRef.update({ verificationStatus: 'approved' });
  } catch (error) {
    console.error('Error verifying doctor:', error);
    throw error;
  }
};
