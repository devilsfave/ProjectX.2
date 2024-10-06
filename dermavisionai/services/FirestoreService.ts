import firestore from '@react-native-firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const db = firestore();

interface Prediction {
  predictedClass: string;
  probabilities: { [key: string]: number };
}

interface HistoryItem {
  date: string;
  prediction: Prediction;
  imageUri: string;
}

// Function to save analysis history to Firestore
export const saveAnalysisToFirestore = async (prediction: Prediction, imageUri: string) => {
  try {
    const { user } = useAuth();
    
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
export const loadAnalysisHistoryFromFirestore = async () => {
    try {
      const { user } = useAuth();
      if (!user) {
        throw new Error('User not authenticated. Cannot load analysis history.');
      }
  
      const userHistoryRef = db.collection('users').doc(user.uid).collection('analysisHistory');
      const snapshot = await userHistoryRef.orderBy('date', 'desc').get();
  
      // Extract the data from the snapshot, including the document ID
      const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      return history; 
    } catch (error) {
      console.error('Error loading analysis history from Firestore:', error);
      throw error;
    }
  };
  
  // Function to delete a specific analysis from Firestore
  export const deleteAnalysisFromFirestore = async (documentId) => {
    try {
      const { user } = useAuth();
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
  export const deleteAllAnalysesFromFirestore = async () => {
    try {
      const { user } = useAuth();
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
  export const fetchUnverifiedDoctors = async (filter = {}) => {
    try {
      let query = db.collection('doctors').where('verified', '==', false);
  
      // Add filtering by specialization or location if provided
      if (filter.specialization) {
        query = query.where('specialization', '==', filter.specialization);
      }
      if (filter.location) {
        query = query.where('location', '==', filter.location);
      }
  
      const snapshot = await query.get();
      const unverifiedDoctors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      return unverifiedDoctors;
    } catch (error) {
      console.error('Error fetching unverified doctors:', error);
      throw error;
    }
  };
  
  // Function to verify a doctor in Firestore
  export const verifyDoctorInFirestore = async (doctorId) => {
    try {
      await db.collection('doctors').doc(doctorId).update({
        verified: true,
      });
      console.log('Doctor verified successfully');
    } catch (error) {
      console.error('Error verifying doctor:', error);
      throw error;
    }
  };
  
  // Function to reject and delete a doctor from Firestore
  export const rejectDoctorInFirestore = async (doctorId) => {
    try {
      await db.collection('doctors').doc(doctorId).delete();
      console.log('Doctor rejected and deleted successfully');
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      throw error;
    }
  };
  
  // Function to get approved doctors from Firestore
  export const getApprovedDoctors = async () => {
    try {
      const snapshot = await db.collection('doctors').where('verified', '==', true).get();
      const approvedDoctors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return approvedDoctors;
    } catch (error) {
      console.error('Error getting approved doctors:', error);
      throw error;
    }
  };
  