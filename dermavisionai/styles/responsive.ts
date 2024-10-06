import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Base dimensions
const baseWidth = 375;
const baseHeight = 812;

export const responsive = (size: number) => {
  const scale = Math.min(width / baseWidth, height / baseHeight);
  const newSize = size * scale;
  return Math.round(newSize);
};