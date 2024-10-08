import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedView, ThemedText } from '../components/Themed';
import { colors } from '../styles/colors';
import Icon from '@expo/vector-icons/MaterialIcons';

const ImageDetailScreen: React.FC = () => {
  const router = useRouter();
  const { uri } = useLocalSearchParams<{ uri: string }>();

  if (!uri) {
    return <ThemedText>No image URI provided</ThemedText>;
  }

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Icon name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      <TouchableOpacity 
        style={styles.analyzeButton} 
        onPress={() => router.push({ pathname: '/analysis', params: { imageUri: uri } })}
      >
        <ThemedText style={styles.analyzeButtonText}>Analyze Image</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: '80%',
  },
  analyzeButton: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ImageDetailScreen;