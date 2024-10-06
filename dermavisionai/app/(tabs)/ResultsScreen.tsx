import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Linking } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ProgressBar } from 'react-native-paper';
import { colors } from '../../styles/colors';
import { responsive } from '../../styles/responsive';
import { saveAnalysisToFirestore } from '../../services/FirestoreService';

type RootStackParamList = {
  Results: { prediction: Prediction; imageUri: string };
  Education: undefined;
};

type ResultsScreenRouteProp = RouteProp<RootStackParamList, 'Results'>;
type ResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Results'>;

type Props = {
  route: ResultsScreenRouteProp;
  navigation: ResultsScreenNavigationProp;
};

interface Prediction {
  predictedClass: string;
  probabilities: { [key: string]: number };
}

interface ConditionInfo {
  explanation: string;
  link: string;
  recommendations: string[];
}

const ResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { prediction, imageUri } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const getSeverityLevel = (className: string): string => {
    switch (className) {
      case 'Melanoma':
        return 'High';
      case 'Blister':
      case 'Eczema':
        return 'Medium';
      default:
        return 'Low';
    }
  };

  const conditionExplanations: { [key: string]: ConditionInfo } = {
    'Acne': {
      explanation: 'A common skin condition that causes pimples, blackheads, and whiteheads.',
      link: 'https://www.aad.org/public/diseases/acne',
      recommendations: [
        'Wash your face twice a day with a gentle cleanser.',
        'Avoid touching or picking at your skin.',
        'Use oil-free and non-comedogenic skincare products.',
        'Consider consulting a dermatologist for personalized treatment options.',
      ],
    },
    // ... (include other conditions as in your original code)
  };

  const saveToHistory = async () => {
    try {
      await saveAnalysisToFirestore({ prediction, imageUri });
      const saveToHistory = async () => {
        try {
          await saveAnalysisToFirestore(prediction, imageUri);
          Alert.alert('Success', 'Analysis saved to history.');
        } catch (err) {
          console.error('Error saving analysis:', err);
          Alert.alert('Error', 'Failed to save analysis.');
        }
      };
      Alert.alert('Success', 'Analysis saved to history.');
    } catch (err) {
      console.error('Error saving analysis:', err);
      Alert.alert('Error', 'Failed to save analysis.');
    }
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

  if (!prediction || Object.keys(prediction).length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No analysis results available.</Text>
      </View>
    );
  }

  const predictedClass = prediction.predictedClass;
  const conditionInfo = conditionExplanations[predictedClass];

  return (
    <ScrollView style={styles.container} accessibilityLabel="Analysis Results Screen">
      <Image source={{ uri: imageUri }} style={styles.image} accessibilityLabel="Analyzed Image" />
      <View style={styles.resultContainer}>
        <Text style={styles.title}>Analysis Results</Text>
        <View style={styles.topPredictionContainer}>
          <Text style={styles.topPredictionLabel}>Most Likely Condition:</Text>
          <Text style={[styles.topPredictionValue, { color: colors.primary }]}>
            {predictedClass}
          </Text>
          <ProgressBar
            progress={prediction.probabilities[predictedClass] / 100}
            color={colors.primary}
            style={styles.progressBar}
          />
          <Text style={styles.probabilityText}>
            Confidence: {prediction.probabilities[predictedClass]}
          </Text>
          <Text style={styles.severityText}>
            Severity: {getSeverityLevel(predictedClass)}
          </Text>
          {conditionInfo && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationText}>{conditionInfo.explanation}</Text>
              <TouchableOpacity onPress={() => Linking.openURL(conditionInfo.link)}>
                <Text style={styles.learnMoreLink}>Learn more about {predictedClass}</Text>
              </TouchableOpacity>
            </View>
          )}
          {conditionInfo && (
            <View style={styles.recommendationsContainer}>
              <Text style={styles.recommendationsTitle}>Recommendations:</Text>
              {conditionInfo.recommendations.map((recommendation, index) => (
                <Text key={index} style={styles.recommendationItem}>
                  - {recommendation}
                </Text>
              ))}
            </View>
          )}
        </View>
        <Text style={styles.otherProbabilitiesLabel}>Other Possibilities:</Text>
        {Object.entries(prediction.probabilities)
          .filter(([className]) => className !== predictedClass)
          .map(([className, probability]) => (
            <View key={className} style={styles.resultItem}>
              <Text style={styles.resultLabel}>{className}:</Text>
              <Text style={styles.resultValue}>{probability}</Text>
              <ProgressBar
                progress={probability / 100}
                color={colors.secondary}
                style={styles.progressBar}
              />
            </View>
          ))}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveToHistory}
        >
          <Text style={styles.saveButtonText}>Save to History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.learnMoreButton}
          onPress={() => navigation.navigate('Education')}
        >
          <Text style={styles.learnMoreButtonText}>Learn More</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    image: {
      width: '100%',
      height: 300,
      resizeMode: 'cover',
    },
    resultContainer: {
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
    },
    topPredictionContainer: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 15,
      marginBottom: 20,
    },
    topPredictionLabel: {
      fontSize: 18,
      color: colors.text,
      marginBottom: 5,
    },
    topPredictionValue: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    progressBar: {
      height: 10,
      borderRadius: 5,
      marginBottom: 10,
    },
    probabilityText: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 5,
    },
    severityText: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 10,
    },
    explanationContainer: {
      marginTop: 10,
    },
    explanationText: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 10,
    },
    learnMoreLink: {
      fontSize: 16,
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    recommendationsContainer: {
      marginTop: 20,
    },
    recommendationsTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 10,
    },
    recommendationItem: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 5,
    },
    otherProbabilitiesLabel: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 20,
      marginBottom: 10,
    },
    resultItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    resultLabel: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    resultValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginLeft: 10,
      width: 50,
      textAlign: 'right',
    },
    saveButton: {
      backgroundColor: colors.primary,
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: 'bold',
    },
    learnMoreButton: {
      backgroundColor: colors.secondary,
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: 10,
    },
    learnMoreButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: 'bold',
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
      padding: 20,
    },
    errorText: {
      color: colors.error,
      fontSize: 16,
      textAlign: 'center',
    },
    noDataContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    noDataText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
    },
  });
  
  export default ResultsScreen;