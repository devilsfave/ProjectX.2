import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { ThemedView, ThemedText } from '../components/Themed';
import { responsive } from '../styles/responsive';

const TermsOfServiceScreen: React.FC = () => {
  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <ThemedText style={styles.title}>Terms of Service</ThemedText>
        <ThemedText style={styles.content}>
          {/* Replace this with your actual terms of service content */}
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, 
          nisi vel consectetur interdum, nisl nunc egestas nunc, vitae 
          tincidunt nisl nunc euismod nunc.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
};

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

export default TermsOfServiceScreen;