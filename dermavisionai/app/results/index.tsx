import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

type PredictionOutput = number[];

export default function ResultsScreen() {
  const { output, imageUri } = useLocalSearchParams<{ output: string, imageUri: string }>();

  const parsedOutput: PredictionOutput | null = output ? JSON.parse(output) : null;

  const getTopPrediction = () => {
    if (!parsedOutput) return null;
    const classNames = ['nv', 'mel', 'bkl', 'bcc', 'akiec', 'vasc', 'df']; // Classes for HAM10000
    return classNames.reduce<{ className: string, probability: number }>((max, className, index) => 
      parsedOutput[index] > max.probability ? { className, probability: parsedOutput[index] } : max,
      { className: '', probability: 0 }
    );
  };

  const topPrediction = getTopPrediction();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Analysis Results</Text>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      {parsedOutput && (
        <View style={styles.resultContainer}>
          <Text style={styles.subtitle}>Top Prediction:</Text>
          {topPrediction && (
            <Text style={styles.prediction}>
              {topPrediction.className}: {(topPrediction.probability * 100).toFixed(2)}%
            </Text>
          )}
          <Text style={styles.subtitle}>All Predictions:</Text>
          {parsedOutput.map((prob: number, index: number) => (
            <Text key={index} style={styles.predictionItem}>
              Class {index}: {(prob * 100).toFixed(2)}%
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  resultContainer: {
    width: '100%',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  prediction: {
    fontSize: 16,
    marginBottom: 10,
  },
  predictionItem: {
    fontSize: 14,
    marginBottom: 5,
  },
});