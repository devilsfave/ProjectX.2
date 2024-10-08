import { saveAnalysisToFirestore } from '../../services/FirestoreService';
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Linking
} from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { colors } from '../../styles/colors';
import { useAuth } from '../../hooks/ useAuth';

interface ConditionInfo {
  explanation: string;
  link: string;
  recommendations: string[];
}

interface Props {
  route: {
    params: {
      output: number[];
      imageUri: string;
    };
  };
  navigation: any;
}

const ResultsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { output, imageUri } = route.params;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{ [key: string]: number } | null>(null);

  useEffect(() => {
    processOutput(output);
  }, [output]);

  const processOutput = (outputData: number[]) => {
    const classNames = ['nv', 'mel', 'bkl', 'bcc', 'akiec', 'vasc', 'df']; // Classes for HAM10000
    const result = outputData.reduce((acc, prob, index) => {
      acc[classNames[index]] = parseFloat((prob * 100).toFixed(2));
      return acc;
    }, {} as { [key: string]: number });

    setPrediction(result);
    setIsLoading(false);
  };

  const getSeverityLevel = (className: string): string => {
    switch (className) {
      case 'mel':
        return 'High';
      case 'bcc':
      case 'akiec':
        return 'Medium';
      default:
        return 'Low';
    }
  };

  const conditionExplanations: { [key: string]: ConditionInfo } = {
    'nv': {
      explanation: 'A common benign mole or nevus that usually requires no treatment.',
      link: 'https://www.aad.org/public/diseases/skin-conditions/moles',
      recommendations: [
        'Monitor any changes in size, shape, or color.',
        'Consult a dermatologist if changes occur.'
      ],
    },
    'mel': {
      explanation: 'Melanoma is a serious form of skin cancer that develops from melanocytes.',
      link: 'https://www.cancer.org/cancer/melanoma-skin-cancer.html',
      recommendations: [
        'Perform regular skin checks.',
        'Wear sunscreen and protective clothing.',
        'Consult a dermatologist regularly.'
      ],
    },
    'bkl': {
      explanation: 'Benign keratosis is a non-cancerous growth that can appear on the skin.',
      link: 'https://www.aad.org/public/diseases/skin-conditions/benign-keratosis',
      recommendations: [
        'Keep the area clean and dry.',
        'Consult a dermatologist if it becomes painful or changes.'
      ],
    },
    'bcc': {
      explanation: 'Basal cell carcinoma is the most common type of skin cancer.',
      link: 'https://www.aad.org/public/diseases/skin-cancer/types/basal-cell-carcinoma',
      recommendations: [
        'Avoid sun exposure and use sunscreen.',
        'See a dermatologist for any suspicious growths.'
      ],
    },
    'akiec': {
      explanation: 'Actinic keratosis is a pre-cancerous skin condition caused by sun exposure.',
      link: 'https://www.aad.org/public/diseases/skin-cancer/types/actinic-keratosis',
      recommendations: [
        'Use sunscreen and protective clothing.',
        'See a dermatologist for treatment options.'
      ],
    },
    'vasc': {
      explanation: 'Vascular lesions can appear in a variety of forms and are usually benign.',
      link: 'https://www.ncbi.nlm.nih.gov/books/NBK547990/',
      recommendations: [
        'Monitor any changes in the lesions.',
        'Consult a dermatologist if concerned.'
      ],
    },
    'df': {
      explanation: 'Dermatofibroma is a common benign skin growth that often appears on the legs.',
      link: 'https://www.aad.org/public/diseases/skin-conditions/dermatofibroma',
      recommendations: [
        'Monitor for any changes.',
        'Consult a dermatologist for removal options if desired.'
      ],
    },
  };

  const auth = useAuth();
  const saveToHistory = async () => {
    try {
      const { user } = useAuth();
      if (prediction) {
        await saveAnalysisToFirestore(
          prediction,
          imageUri,
          () => auth
        );
        Alert.alert('Success', 'Analysis saved to history.');
      } else {
        Alert.alert('Error', 'No prediction data available to save.');
      }
    } catch (err) {
      console.error('Error saving analysis:', err);
      Alert.alert('Error', 'Failed to save analysis.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
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

  const predictedClass = Object.entries(prediction).reduce((a, b) => a[1] > b[1] ? a : b)[0];
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
            progress={prediction[predictedClass] / 100}
            color={colors.primary}
            style={styles.progressBar}
          />
          <Text style={styles.probabilityText}>
            Confidence: {prediction[predictedClass].toFixed(2)}%
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
        {Object.entries(prediction)
          .filter(([className]) => className !== predictedClass)
          .map(([className, probability]) => (
            <View key={className} style={styles.resultItem}>
              <Text style={styles.resultLabel}>{className}:</Text>
              <Text style={styles.resultValue}>{probability.toFixed(2)}%</Text>
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
      backgroundColor: colors.lightGray,
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
