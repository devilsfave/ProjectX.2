import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, FlatList,
  TouchableOpacity, Alert, ActivityIndicator, Button
} from 'react-native';
import { colors } from '../styles/colors';
import { responsive } from '../styles/responsive';
import { useAuth } from '../context/AuthContext';  // Ensure the hook path is correct
import { loadAnalysisHistoryFromFirestore, deleteAnalysisFromFirestore, deleteAllAnalysesFromFirestore } from '../services/FirestoreService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthContextType } from '../context/AuthContext'; // Ensure the import is correct

// Declare the wrapAuth helper function
const wrapAuth = (user: any): AuthContextType => ({
  user,
  loading: false,
  role: null,
  expoPushToken: null, // Set this to the appropriate value or keep it null
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  loginWithFacebook: async () => {},
  resetPassword: async () => {},
  updateExpoPushToken: (token: string) => {}, // Provide an empty function or actual implementation
});

type RootStackParamList = {
  Login: undefined;
  Results: { prediction: Prediction; imageUri: string };
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
};

type HistoryScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Prediction {
  className: string;
  probability: number;
}

interface HistoryItem {
  id: string;
  date: string;
  prediction: Prediction;
  imageUri: string;
}

const HistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user, expoPushToken, updateExpoPushToken } = useAuth();  // Ensure the user is retrieved from AuthContext
  const navigation = useNavigation<HistoryScreenNavigationProp>();

  useEffect(() => {
    if (!user) {
      navigation.navigate('Login');
    } else {
      loadHistory();
    }
  }, [user, navigation]);

  const loadHistory = async () => {
    try {
      const historyData = await loadAnalysisHistoryFromFirestore(() => wrapAuth(user));
      setHistory(historyData.map(item => ({
        id: item.id,
        date: item.date,
        prediction: {
          className: String(item.prediction.className),  // Ensure className is a string
          probability: item.prediction.probability,
        },
        imageUri: item.imageUri,
      })));
    } catch (err) {
      setError('Error loading analysis history from Firestore.');
      console.error('Error loading history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await deleteAnalysisFromFirestore(itemId, () => wrapAuth(user));
      setHistory(history.filter(historyItem => historyItem.id !== itemId));
      Alert.alert('Success', 'Analysis deleted from history.');
    } catch (err) {
      console.error('Error deleting analysis:', err);
      Alert.alert('Error', 'Failed to delete analysis from history.');
    }
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Clear All History',
      'Are you sure you want to delete all your analysis history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'OK',
          onPress: async () => {
            try {
              await deleteAllAnalysesFromFirestore(() => wrapAuth(user));
              setHistory([]);
              Alert.alert('Success', 'All analyses deleted from history.');
            } catch (err) {
              console.error('Error clearing history:', err);
              Alert.alert('Error', 'Failed to clear analysis history.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const topPredictions = `${item.prediction.className}: ${(item.prediction.probability * 100).toFixed(2)}%`;

    return (
      <View style={styles.historyItem}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Results', { prediction: item.prediction, imageUri: item.imageUri })}
          style={styles.historyItemContent}
        >
          <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
          <View style={styles.itemDetails}>
            <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
            <Text style={styles.topPrediction}>{topPredictions}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
          <Icon name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No past analyses found. Start scanning your skin today!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analysis History</Text>
      {history.length > 0 && (
        <Button title="Clear All History" onPress={handleClearAll} color={colors.secondary} />
      )}
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: responsive(16),
  },
  title: {
    fontSize: responsive(24),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: responsive(16),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: responsive(16),
    textAlign: 'center',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: colors.text,
    fontSize: responsive(16),
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: responsive(16),
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: responsive(8),
    marginBottom: responsive(16),
    overflow: 'hidden',
  },
  historyItemContent: {
    flex: 1,
    flexDirection: 'row',
    padding: responsive(12),
  },
  thumbnail: {
    width: responsive(80),
    height: responsive(80),
    borderRadius: responsive(4),
  },
  itemDetails: {
    flex: 1,
    marginLeft: responsive(12),
  },
  date: {
    fontSize: responsive(14),
    color: colors.text,
    marginBottom: responsive(4),
  },
  topPrediction: {
    fontSize: responsive(14),
    color: colors.text,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsive(12),
  },
});

export default HistoryScreen;
