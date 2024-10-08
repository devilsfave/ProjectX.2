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
          {/* Terms of Service Content */}
          <ThemedText style={styles.sectionTitle}>Effective Date: [Insert Date]</ThemedText>
          
          <ThemedText style={styles.sectionContent}>
            Welcome to DermaVision AI (“we”, “our”, “us”). These Terms of Service (“Terms”) govern your access to and use of our application, services, and website (collectively, the “Service”). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, do not use the Service.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>1. Acceptance of Terms</ThemedText>
          <ThemedText style={styles.sectionContent}>
            By using the Service, you affirm that you are at least 18 years old or that you are the age of majority in your jurisdiction, and you have the legal capacity to enter into these Terms.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>2. Changes to Terms</ThemedText>
          <ThemedText style={styles.sectionContent}>
            We reserve the right to modify or replace these Terms at any time. We will notify you about significant changes to these Terms through the Service or via email. Your continued use of the Service after any changes constitutes your acceptance of the new Terms.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>3. Use of Service</ThemedText>
          <ThemedText style={styles.sectionContent}>
            You agree to use the Service only for lawful purposes and in accordance with these Terms. You are prohibited from using the Service:
            {'\n'}- In any way that violates any applicable federal, state, local, or international law or regulation.
            {'\n'}- For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.
            {'\n'}- To transmit, or procure the sending of, any advertising or promotional material without our prior written consent.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>4. Account Security</ThemedText>
          <ThemedText style={styles.sectionContent}>
            You are responsible for maintaining the confidentiality of your account and password and for restricting access to your device. You agree to accept responsibility for all activities that occur under your account or password.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>5. Intellectual Property Rights</ThemedText>
          <ThemedText style={styles.sectionContent}>
            All content, features, and functionality of the Service, including but not limited to text, graphics, logos, and software, are the exclusive property of DermaVision AI and are protected by copyright, trademark, and other intellectual property laws.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>6. Third-Party Links</ThemedText>
          <ThemedText style={styles.sectionContent}>
            Our Service may contain links to third-party websites or services that are not owned or controlled by DermaVision AI. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>7. Limitation of Liability</ThemedText>
          <ThemedText style={styles.sectionContent}>
            To the fullest extent permitted by law, DermaVision AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or in connection with your use of the Service.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>8. Disclaimer of Warranties</ThemedText>
          <ThemedText style={styles.sectionContent}>
            The Service is provided on an “as is” and “as available” basis. We make no representations or warranties of any kind, express or implied, regarding the operation of the Service or the information, content, materials, or products included in the Service.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>9. Governing Law</ThemedText>
          <ThemedText style={styles.sectionContent}>
            These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction]. You agree to submit to the personal jurisdiction of the courts located within [Your Jurisdiction] for the resolution of any disputes.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>10. Contact Us</ThemedText>
          <ThemedText style={styles.sectionContent}>
            If you have any questions about these Terms, please contact us at [Your Contact Information].
          </ThemedText>

          <ThemedText style={styles.sectionContent}>
            By using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </ThemedText>
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
  sectionTitle: {
    fontSize: responsive(20),
    fontWeight: 'bold',
    marginTop: responsive(10),
  },
  sectionContent: {
    fontSize: responsive(16),
    lineHeight: responsive(24),
    marginBottom: responsive(10),
  },
  content: {
    fontSize: responsive(16),
    lineHeight: responsive(24),
  },
});

export default TermsOfServiceScreen;
