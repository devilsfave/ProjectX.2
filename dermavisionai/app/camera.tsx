import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { Camera, CameraCapturedPicture } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import * as tf from '@tensorflow/tfjs';
import * as tflite from '@tensorflow/tfjs-tflite';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ThemedView, ThemedText } from '@/components/Themed';
import { colors } from '@/styles/colors';

// Define the types for CameraType and FlashMode
type CameraType = 'front' | 'back';
type FlashMode = 'on' | 'off' | 'auto' | 'torch';

type RootStackParamList = {
  Results: { output: number[]; imageUri: string };
  Gallery: undefined;
};

type CameraScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Results' | 'Gallery'>;

const CameraScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [flashMode, setFlashMode] = useState<FlashMode>('off');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef<Camera | null>(null);

  const navigation = useNavigation<CameraScreenNavigationProp>();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const captureImage = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setCapturedImage(photo.uri);
      } catch (error) {
        console.error('Error capturing image:', error);
        Alert.alert('Error', 'Failed to capture image');
      }
    }
  };

  const processImage = async () => {
    if (!capturedImage) return;

    setIsLoading(true);
    try {
      // Image preprocessing
      const resizedImage = await ImageManipulator.manipulateAsync(
        capturedImage,
        [{ resize: { width: 224, height: 224 } }],
        { format: ImageManipulator.SaveFormat.JPEG }
      );

      // Load and run the TensorFlow Lite model
      await tf.ready();
      const tfliteModel = await tflite.loadTFLiteModel(
        'path/to/your/model.tflite'
      );
      const imageBuffer = await FileSystem.readAsStringAsync(resizedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const imageData = tf.tensor3d(Buffer.from(imageBuffer, 'base64'), [
        224,
        224,
        3,
      ]);
      const output = tfliteModel.predict(imageData) as tf.Tensor;

      // Process the output and navigate to the results screen
      const outputData = await output.data();
      navigation.navigate('Results', {
        output: Array.from(outputData),
        imageUri: capturedImage,
      });
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFlash = () => {
    setFlashMode((prevMode) =>
      prevMode === 'off' ? 'on' : 'off'
    );
  };

  const switchCamera = () => {
    setCameraType((prevType) =>
      prevType === 'back' ? 'front' : 'back'
    );
  };

  if (hasPermission === null) {
    return <ActivityIndicator size="large" color={colors.primary} />;
  }

  if (hasPermission === false) {
    return <ThemedText>No access to camera</ThemedText>;
  }

  return (
    <ThemedView style={styles.container}>
      {capturedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          <View style={styles.previewButtonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => setCapturedImage(null)}>
              <ThemedText style={styles.buttonText}>Retake</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={processImage}>
              <ThemedText style={styles.buttonText}>Analyze</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Camera
          style={styles.camera}
          ref={cameraRef}
          type={cameraType}
          flashMode={flashMode}
        >
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={captureImage}
              disabled={isLoading}
              accessibilityLabel="Capture Image Button"
            >
              <ThemedText style={styles.buttonText}>Capture</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={toggleFlash}
              accessibilityLabel="Toggle Flash Button"
            >
              <ThemedText style={styles.buttonText}>
                {flashMode === 'off' ? 'Flash On' : 'Flash Off'}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={switchCamera}
              accessibilityLabel="Switch Camera Button"
            >
              <ThemedText style={styles.buttonText}>Switch Camera</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Gallery')}
              accessibilityLabel="Open Gallery Button"
            >
              <ThemedText style={styles.buttonText}>Gallery</ThemedText>
            </TouchableOpacity>
          </View>
        </Camera>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  button: {
    flex: 1,
    margin: 5,
    padding: 15,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '80%',
    height: '80%',
    resizeMode: 'contain',
  },
  previewButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
});

export default CameraScreen;