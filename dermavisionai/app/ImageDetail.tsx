import React from 'react';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ThemedView, ThemedText } from '../components/Themed';
import { colors } from '../styles/colors';
import Icon from '@expo/vector-icons/MaterialIcons';

type RouteParams = {
  uri: string;
};

const ImageDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { uri } = route.params as RouteParams;

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Image source={{ uri }} style={styles.image} resizeMode="contain" />
      <TouchableOpacity style={styles.analyzeButton} onPress={() => {
        // Navigate to analysis screen or start analysis process
        // For now, we'll just show an alert
        alert('Analysis feature coming soon!');
      }}>
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