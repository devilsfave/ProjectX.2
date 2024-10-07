import React, { useEffect, useState } from 'react';
import { View, FlatList, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as FileSystem from 'expo-file-system';
import { ThemedView, ThemedText } from '../../components/Themed';
import { colors } from '../../styles/colors';

type RootStackParamList = {
  ImageDetail: { uri: string };
  // Add other screen names and their params here
};

type GalleryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GalleryScreen: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const navigation = useNavigation<GalleryScreenNavigationProp>();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const directoryUri = `${FileSystem.documentDirectory}images/`;
        const fileInfo = await FileSystem.readDirectoryAsync(directoryUri);
        
        const imageFiles = fileInfo.map(file => `${directoryUri}${file}`);
        setImages(imageFiles);
      } catch (error) {
        console.error('Error fetching images from gallery:', error);
      }
    };
    fetchImages();
  }, []);

  const renderImage = ({ item }: { item: string }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ImageDetail', { uri: item })}>
      <Image source={{ uri: item }} style={styles.image} />
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Gallery</ThemedText>
      {images.length > 0 ? (
        <FlatList
          data={images}
          renderItem={renderImage}
          keyExtractor={(item) => item}
          numColumns={3}
          columnWrapperStyle={styles.columnWrapper}
        />
      ) : (
        <ThemedText style={styles.noImagesText}>No images found.</ThemedText>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 100,
    margin: 5,
    borderRadius: 10,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  noImagesText: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
    color: colors.text,
  },
});

export default GalleryScreen;