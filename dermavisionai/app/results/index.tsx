import React from 'react';
import { View, Text, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ResultsScreen() {
  const { prediction, imageUri } = useLocalSearchParams<{ prediction: string, imageUri: string }>();

  const parsedPrediction = prediction ? JSON.parse(prediction) : null;

  return (
    <View>
      <Text>Results</Text>
      {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />}
      {parsedPrediction && (
        <Text>Prediction: {JSON.stringify(parsedPrediction)}</Text>
      )}
    </View>
  );
}