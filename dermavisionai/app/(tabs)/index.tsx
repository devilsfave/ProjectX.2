import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link, Href } from 'expo-router';
import Icon from '@expo/vector-icons/MaterialIcons';
import { ThemedView, ThemedText } from '../../components/Themed';
import { colors } from '../../styles/colors';

const HomeScreen = () => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>DermaVision-AI</ThemedText>
      <Link href="/camera" asChild>
        <TouchableOpacity
          style={styles.mainButton}
          accessibilityLabel="Scan Now Button"
        >
          <Icon name="camera-alt" size={24} color="white" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Scan Now</Text>
        </TouchableOpacity>
      </Link>
      <View style={styles.optionsContainer}>
        <Link href="/analysis" asChild>
          <TouchableOpacity
            style={styles.optionButton}
            accessibilityLabel="Analyze Skin Condition Button"
          >
            <Icon name="search" size={20} color="white" style={styles.buttonIcon} />
            <ThemedText style={styles.optionText}>Analyze</ThemedText>
          </TouchableOpacity>
        </Link>
        <Link href="/history" asChild>
          <TouchableOpacity
            style={styles.optionButton}
            accessibilityLabel="View Past Analyses Button"
          >
            <Icon name="history" size={20} color="white" style={styles.buttonIcon} />
            <ThemedText style={styles.optionText}>History</ThemedText>
          </TouchableOpacity>
        </Link>
        <Link href="/education" asChild>
          <TouchableOpacity
            style={styles.optionButton}
            accessibilityLabel="Educational Resources Button"
          >
            <Icon name="school" size={20} color="white" style={styles.buttonIcon} />
            <ThemedText style={styles.optionText}>Education</ThemedText>
          </TouchableOpacity>
        </Link>
        <Link href="/profile" asChild>
          <TouchableOpacity
            style={styles.optionButton}
            accessibilityLabel="Profile Button"
          >
            <Icon name="person" size={20} color="white" style={styles.buttonIcon} />
            <ThemedText style={styles.optionText}>Profile</ThemedText>
          </TouchableOpacity>
        </Link>
        <Link href={'/doctor-list' as Href<string>} asChild>
  <TouchableOpacity
    style={styles.optionButton}
    accessibilityLabel="Find Dermatologist Button"
  >
    <Icon name="search" size={20} color="white" style={styles.buttonIcon} />
    <ThemedText style={styles.optionText}>Find Dermatologist</ThemedText>
  </TouchableOpacity>
</Link>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  mainButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 50,
    paddingVertical: 15,
    borderRadius: 30,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    backgroundColor: colors.secondary,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
    flexDirection: 'row',
  },
  optionText: {
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 10,
  },
});

export default HomeScreen;