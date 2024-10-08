import * as tf from '@tensorflow/tfjs';
import * as tflite from '@tensorflow/tfjs-tflite';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

let model: tflite.TFLiteModel | null = null;

// Load the model
export const loadModel = async (): Promise<void> => {
  try {
    if (model) {
      console.log('Model already loaded, skipping initialization.');
      return;
    }

    console.log('Starting model loading process...');
    await tf.ready();
    console.log('TensorFlow.js is ready.');

    const modelPath = require('../ml/model_unquant.tflite'); // Ensure the path is correct
    model = await tflite.loadTFLiteModel(modelPath);
    console.log('TFLite model loaded successfully!');

    // Perform a warm-up inference
    const dummyInput = tf.zeros([1, 224, 224, 3]);
    const warmupResult = await model.predict(dummyInput) as tf.Tensor;
    warmupResult.dispose();
    dummyInput.dispose();
    console.log('Warm-up inference completed.');

  } catch (error) {
    console.error('Error loading model:', error);
    throw new Error('Failed to load the machine learning model. Please try again later.');
  }
};

// Preprocess the image and convert it to a tensor
const preprocessImage = async (imageUri: string): Promise<tf.Tensor> => {
  try {
    const resizedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 224, height: 224 } }],
      { format: ImageManipulator.SaveFormat.JPEG, compress: 0.8 }
    );

    // Read the image file as a Base64 string
    const imgB64 = await FileSystem.readAsStringAsync(resizedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert Base64 string to Uint8Array
    const binaryString = atob(imgB64); // Decode base64 to binary string
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const imageTensor = decodeJpeg(bytes).expandDims(0); // Create tensor from raw bytes
    return imageTensor;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    throw new Error('Failed to process the image. Please try again.');
  }
};

// Make predictions
export const predictImage = async (imageUri: string): Promise<{
  predictedClass: string;
  probabilities: { [key: string]: string };
}> => {
  try {
    if (!model) {
      throw new Error('Model not loaded yet. Please wait.');
    }
    const imageTensor = await preprocessImage(imageUri);
    const outputTensor = await model.predict(imageTensor) as tf.Tensor;
    const predictions = await outputTensor.data();
    const predictedClassIndex = predictions.indexOf(Math.max(...Array.from(predictions)));

    // Updated class names to match HAM10000 dataset classes
    const classNames = ['nv', 'mel', 'bkl', 'bcc', 'akiec', 'vasc', 'df'];

    const classProbabilities: { [key: string]: string } = {};
    for (let i = 0; i < classNames.length; i++) {
      classProbabilities[classNames[i]] = (predictions[i] * 100).toFixed(2) + '%';
    }
    
    imageTensor.dispose(); // Dispose of tensor properly
    outputTensor.dispose();
    return {
      predictedClass: classNames[predictedClassIndex],
      probabilities: classProbabilities
    };
  } catch (error) {
    console.error('Error predicting image:', error);
    throw error;
  }
};
