import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import * as tf from '@tensorflow/tfjs';
import * as tflite from '@tensorflow/tfjs-tflite';
import { ThemedView, ThemedText } from '@/components/Themed';
import { colors } from '@/styles/colors';
import { useRouter } from 'expo-router';

const CameraScreen = () => {
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef(null);

  const [permission, requestPermission] = Camera.useCameraPermissions();
  const router = useRouter();

  if (!permission) {
    return <ActivityIndicator size="large" color={colors.primary} />;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.message}>We need your permission to show the camera</ThemedText>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <ThemedText>Grant Permission</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

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
      const resizedImage = await ImageManipulator.manipulateAsync(
        capturedImage,
        [{ resize: { width: 224, height: 224 } }],
        { format: ImageManipulator.SaveFormat.JPEG }
      );

      await tf.ready();
      const tfliteModel = await tflite.loadTFLiteModel(
        '../../assets/ml/model_unquant.tflite'
      );
      const imageBuffer = await FileSystem.readAsStringAsync(resizedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const imageData = tf.tensor3d(Buffer.from(imageBuffer, 'base64'), [224, 224, 3]);
      const output = tfliteModel.predict(imageData);

      const outputData = await output.data();
      router.push({
        pathname: "../results",
        params: { output: JSON.stringify(Array.from(outputData)), imageUri: capturedImage }
      });
    } catch (error) {
      console.error('Error processing image:', error);
      Alert.alert('Error', 'Failed to process image');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFlash = () => {
    setFlashMode(prevMode => 
      prevMode === Camera.Constants.FlashMode.off 
        ? Camera.Constants.FlashMode.on 
        : Camera.Constants.FlashMode.off
    );
  };

  const switchCamera = () => {
    setCameraType(prevType => 
      prevType === Camera.Constants.Type.back 
        ? Camera.Constants.Type.front 
        : Camera.Constants.Type.back
    );
  };

  return (
    <ThemedView style={styles.container}>
      {capturedImage ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          <View style={styles.previewButtonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => setCapturedImage(null)}>
              <ThemedText>Retake</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={processImage}>
              <ThemedText>Process</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Camera
          style={styles.camera}
          type={cameraType}
          flashMode={flashMode}
          ref={cameraRef}
        >
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={switchCamera}>
              <ThemedText>Flip</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={toggleFlash}>
              <ThemedText>
                {flashMode === Camera.Constants.FlashMode.off ? 'Flash On' : 'Flash Off'}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={captureImage}>
              <ThemedText>Capture</ThemedText>
            </TouchableOpacity>
          </View>
        </Camera>
      )}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
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
  message: {
    textAlign: 'center',
    marginBottom: 20,
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