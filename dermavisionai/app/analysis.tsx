import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { colors } from '../styles/colors';
import { loadModel, predictImage } from '../assets/ml/modelLoader';

const AnalysisScreen: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to use this feature.');
      }
    })();
  }, []);

  const takePicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Camera Error', 'An error occurred while taking the picture. Please try again.');
    }
  };

  const analyzePicture = async () => {
    if (!image) {
      Alert.alert('No Image', 'Please capture an image first.');
      return;
    }
    try {
      setIsLoading(true);
      const manipResult = await ImageManipulator.manipulateAsync(
        image,
        [{ resize: { width: 224, height: 224 } }],
        { format: ImageManipulator.SaveFormat.PNG }
      );

      await loadModel();
      const prediction = await predictImage(manipResult.uri);

      router.push({
        pathname: '../results/',
        params: { 
          imageUri: manipResult.uri,
          predictedClass: prediction.predictedClass,
          probabilities: JSON.stringify(prediction.probabilities)
        },
      });
    } catch (error) {
      console.error('Error analyzing picture:', error);
      Alert.alert('Error', 'An error occurred during image analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity style={styles.button} onPress={() => setImage(null)}>
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={analyzePicture}>
            <Text style={styles.buttonText}>Analyze</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.cameraPlaceholder}>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.buttonText}>Take Picture</Text>
          </TouchableOpacity>
        </View>
      )}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20,
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
    borderRadius: 5,
    alignSelf: 'center',
    alignItems: 'center',
    margin: 20,
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnalysisScreen;