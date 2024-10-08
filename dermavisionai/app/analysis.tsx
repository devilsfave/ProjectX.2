import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadModel, predictImage } from '../assets/ml/modelLoader';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import { colors } from '../styles/colors';
import { responsive } from '../styles/responsive';

const AnalysisScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>(CameraType.back);
  const [flashMode, setFlashMode] = useState<FlashMode>(FlashMode.off);
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const cameraRef = useRef<any>(null);
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  useEffect(() => {
    const loadImage = async () => {
      if (imageUri) {
        setImage(imageUri);
      } else {
        const savedImage = await AsyncStorage.getItem('capturedImage');
        if (savedImage) {
          setImage(savedImage);
        }
      }
    };

    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      await loadModel();
      loadImage();
    })();
  }, [imageUri]);

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          exif: true,
        });
        await AsyncStorage.setItem('capturedImage', photo.uri);
        setImage(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Camera Error', 'An error occurred while taking the picture. Please try again.');
      }
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
      const results = await predictImage(manipResult.uri);
      await AsyncStorage.removeItem('capturedImage');
      router.push({
        pathname: '../results/',
        params: { prediction: JSON.stringify(results), imageUri: manipResult.uri },
      });
    } catch (error) {
      console.error('Error analyzing picture:', error);
      Alert.alert('Error', 'An error occurred during image analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCameraType = () => {
    setCameraType(current => 
      current === CameraType.back 
        ? CameraType.front 
        : CameraType.back
    );
  };

  const toggleFlashMode = () => {
    setFlashMode(current => 
      current === FlashMode.off 
        ? FlashMode.on 
        : FlashMode.off
    );
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

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
        <Camera
          style={styles.camera}
          type={cameraType}
          flashMode={flashMode}
          ref={cameraRef}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
              <Text style={styles.buttonText}>Flip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={toggleFlashMode}>
              <Text style={styles.buttonText}>
                {flashMode === FlashMode.off ? 'Flash On' : 'Flash Off'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.buttonText}>Capture</Text>
            </TouchableOpacity>
          </View>
        </Camera>
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
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 20,
  },
  button: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
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