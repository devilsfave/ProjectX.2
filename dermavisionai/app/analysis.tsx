import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Camera, CameraType as CameraTypeValue, FlashMode as FlashModeValue } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { loadModel, predictImage } from '../assets/ml/modelLoader';
import { colors } from '../styles/colors';
import { responsive } from '../styles/responsive';

const AnalysisScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<CameraTypeValue>(CameraTypeValue.back);
  const [flashMode, setFlashMode] = useState<FlashModeValue>(FlashModeValue.off);
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const cameraRef = useRef<Camera | null>(null);
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
        params: { prediction: JSON.stringify(results), imageUri: manipResult.uri }
      });
    } catch (error) {
      console.error('Error analyzing picture:', error);
      Alert.alert('Error', 'An error occurred during image analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCameraType = () => {
    setCameraType(
      cameraType === CameraTypeValue.back ? CameraTypeValue.front : CameraTypeValue.back
    );
  };

  const toggleFlashMode = () => {
    setFlashMode(
      flashMode === FlashModeValue.off ? FlashModeValue.on : FlashModeValue.off
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
      {!image ? (
        <Camera
          style={styles.camera}
          ref={cameraRef}
          type={cameraType}
          flashMode={flashMode}
        >
          <View style={styles.controlsContainer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={toggleCameraType}
              accessibilityLabel="Flip Camera Button"
            >
              <Text style={styles.buttonText}>Flip</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.button}
              onPress={toggleFlashMode}
              accessibilityLabel="Toggle Flash Button"
            >
              <Text style={styles.buttonText}>
                {flashMode === FlashModeValue.off ? 'Flash On' : 'Flash Off'}
              </Text>
            </TouchableOpacity>
          </View>
        </Camera>
      ) : (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image }} style={styles.imagePreview} />
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={() => setImage(null)}
            accessibilityLabel="Retake Photo Button"
          >
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
        </View>
      )}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
      <View style={styles.buttonContainer}>
        {!image ? (
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            accessibilityLabel="Capture Image Button"
          >
            <Text style={styles.buttonText}>Capture</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={analyzePicture}
            disabled={isLoading}
            accessibilityLabel="Analyze Image Button"
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Analyze</Text>
            )}
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.back()} // Use router for going back
          accessibilityLabel="Back Button"
        >
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/gallery')} // Use router for navigating to Gallery
          accessibilityLabel="Open Gallery Button"
        >
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: responsive(20),
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: responsive(30),
  },
  button: {
    backgroundColor: colors.primary,
    padding: responsive(10),
    borderRadius: responsive(5),
  },
  captureButton: {
    backgroundColor: colors.accent,
    padding: responsive(20),
    borderRadius: responsive(50),
  },
  buttonText: {
    fontSize: responsive(18),
    color: colors.white,
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
  retakeButton: {
    backgroundColor: colors.secondary,
    padding: responsive(15),
    borderRadius: responsive(5),
    marginTop: responsive(20),
  },
  analyzeButton: {
    backgroundColor: colors.accent,
    padding: responsive(20),
    borderRadius: responsive(50),
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnalysisScreen;
