import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedView, ThemedText } from '../components/Themed';
import { responsive } from '../styles/responsive';

export default function PrivacyPolicyScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <ThemedText style={styles.title}>Privacy Policy</ThemedText>
        <ThemedText style={styles.content}>
          [Your privacy policy content goes here]
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: responsive(20),
  },
  title: {
    fontSize: responsive(24),
    fontWeight: 'bold',
    marginBottom: responsive(20),
  },
  content: {
    fontSize: responsive(16),
    lineHeight: responsive(24),
  },
});