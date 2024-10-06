import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as tf from '@tensorflow/tfjs';
import * as tflite from '@tensorflow/tfjs-tflite';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ThemedView, ThemedText } from '@/components/Themed';
import { colors } from '@/styles/colors';

type RootStackParamList = {
  Results: { output: number[]; imageUri: string };
  Gallery: undefined;
};

type CameraScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const CameraScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [model, setModel] = useState<tflite.TFLiteModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [flashMode, setFlashMode] = useState<FlashMode>(FlashMode.off);
  const [cameraType, setCameraType] = useState<CameraType>(CameraType.back);
  const cameraRef = useRef<Camera | null>(null);
  const navigation = useNavigation<CameraScreenNavigationProp>();

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
        await tf.ready();
        
        // Load the TFLite model
        const modelJson = require('../assets/final_trained_model.tflite');
        const modelBuffer = await FileSystem.readAsStringAsync(modelJson, { encoding: FileSystem.EncodingType.Base64 });
        const tfliteModel = await tflite.loadTFLiteModel(modelBuffer);
        setModel(tfliteModel);
      } catch (error) {
        console.error('Error initializing camera or loading model:', error);
        Alert.alert('Error', 'Failed to initialize camera or load model. Please try again.');
      }
    })();
  }, []);

  const captureImage = async () => {
    if (cameraRef.current && model) {
      try {
        setIsLoading(true);

        const directoryUri = `${FileSystem.documentDirectory}images/`;
        await FileSystem.makeDirectoryAsync(directoryUri, { intermediates: true });

        const photo = await cameraRef.current.takePictureAsync();

        const imageUri = `${directoryUri}${Date.now()}.jpg`;
        await FileSystem.moveAsync({ from: photo.uri, to: imageUri });

        const resizedPhoto = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 224, height: 224 } }],
          { format: ImageManipulator.SaveFormat.PNG }
        );

        const imgB64 = await FileSystem.readAsStringAsync(resizedPhoto.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
        const raw = new Uint8Array(imgBuffer);
        const imageTensor = tf.tidy(() => {
          const decodedImage = tf.tensor3d(raw, [224, 224, 3]);
          return tf.expandDims(decodedImage);
        });

        const outputTensor = await model.predict(imageTensor) as tf.Tensor;
        const outputData = await outputTensor.data();

        imageTensor.dispose();
        outputTensor.dispose();

        setIsLoading(false);
        navigation.navigate('Results', { output: Array.from(outputData), imageUri: imageUri });
      } catch (error) {
        console.error('Error capturing or processing image:', error);
        setIsLoading(false);
        Alert.alert('Error', 'Failed to capture or process image. Please try again.');
      }
    }
  };

  const toggleFlash = () => {
    setFlashMode((prevMode) =>
      prevMode === FlashMode.off ? FlashMode.on : FlashMode.off
    );
  };

  const switchCamera = () => {
    setCameraType((prevType) =>
      prevType === CameraType.back ? CameraType.front : CameraType.back
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
              {flashMode === FlashMode.off ? 'Flash On' : 'Flash Off'}
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
});

export default CameraScreen;
