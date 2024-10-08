import React, { useState } from 'react';
import {
  StyleSheet, ScrollView,
  TouchableOpacity, TextInput, FlatList,
  Linking
} from 'react-native';
import { Link } from 'expo-router';
import { colors } from '../../styles/colors';
import { responsive } from '../../styles/responsive';
import { ThemedView, ThemedText } from '../../components/Themed';

// Define the type for education content items
type EducationItem = {
  title: string;
  content: string;
  link: string;
};

// Educational content for the diseases in HAM10000
const educationContent: EducationItem[] = [
  {
    title: "Melanoma",
    content: "Learn about melanoma, a serious form of skin cancer that develops from melanocytes.",
    link: "https://www.cancer.org/cancer/melanoma-skin-cancer.html"
  },
  {
    title: "Basal Cell Carcinoma",
    content: "Basal cell carcinoma is the most common form of skin cancer, often appearing as a slightly transparent bump on the skin.",
    link: "https://www.aad.org/public/diseases/skin-cancer/types/basal-cell-carcinoma"
  },
  {
    title: "Squamous Cell Carcinoma",
    content: "Squamous cell carcinoma is a common skin cancer that arises from the squamous cells in the outer layer of the skin.",
    link: "https://www.cancer.org/cancer/squamous-cell-skin-cancer.html"
  },
  {
    title: "Actinic Keratosis",
    content: "Actinic keratosis is a pre-cancerous skin condition caused by sun exposure, appearing as rough, scaly patches.",
    link: "https://www.aad.org/public/diseases/skin-cancer/types/actinic-keratosis"
  },
  {
    title: "Atypical Melanocytic Nevi",
    content: "Atypical nevi are moles that may have irregular features and can be a risk factor for melanoma.",
    link: "https://www.mayoclinic.org/diseases-conditions/atypical-moles/symptoms-causes/syc-20377086"
  },
  {
    title: "Vascular Lesions",
    content: "Vascular lesions include a variety of skin conditions that involve blood vessels, such as hemangiomas and port-wine stains.",
    link: "https://www.ncbi.nlm.nih.gov/books/NBK547990/"
  },
  {
    title: "Dermatofibroma",
    content: "Dermatofibroma is a benign skin growth that often appears as a small, firm bump on the skin.",
    link: "https://www.aad.org/public/diseases/skin-conditions/dermatofibroma"
  },
];

const EducationScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContent = educationContent.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: EducationItem }) => (
    <TouchableOpacity
      key={item.title}
      style={styles.topicContainer}
      onPress={() => Linking.openURL(item.link)}
    >
      <ThemedText style={styles.topicTitle}>{item.title}</ThemedText>
      <ThemedText style={styles.topicPreview}>{item.content.substring(0, 80)}...</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <ThemedText style={styles.title}>Educational Resources</ThemedText>

        <TextInput
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />

        <FlatList
          data={filteredContent}
          renderItem={renderItem}
          keyExtractor={(item) => item.title}
          contentContainerStyle={styles.listContent}
        />

        {/* Navigation Buttons */}
        <Link href="/terms-of-service" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <ThemedText style={styles.linkButtonText}>Terms of Service</ThemedText>
          </TouchableOpacity>
        </Link>
        <Link href="/privacy-policy" asChild>
          <TouchableOpacity style={styles.linkButton}>
            <ThemedText style={styles.linkButtonText}>Privacy Policy</ThemedText>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: responsive(20),
  },
  title: {
    fontSize: responsive(24),
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: responsive(20),
  },
  topicContainer: {
    backgroundColor: colors.white,
    borderRadius: responsive(10),
    padding: responsive(15),
    marginBottom: responsive(15),
  },
  topicTitle: {
    fontSize: responsive(18),
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: responsive(5),
  },
  topicPreview: {
    fontSize: responsive(14),
    color: colors.text,
  },
  searchInput: {
    marginBottom: responsive(20),
    backgroundColor: colors.white,
    padding: responsive(10),
    borderRadius: responsive(10),
  },
  linkButton: {
    marginTop: 20,
    padding: 10,
  },
  linkButtonText: {
    color: '#007AFF',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  listContent: {
    paddingBottom: responsive(20),
  },
});

export default EducationScreen;
