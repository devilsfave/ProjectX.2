import React, { useState } from 'react';
import {
  View, TextInput, Button, StyleSheet,
  Text, ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import auth from '@react-native-firebase/auth';
import { colors } from '../../styles/colors';
import { ThemedView, ThemedText } from '../../components/Themed';
import { typography } from '../../styles/typography';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import firestore from '@react-native-firebase/firestore';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
};

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const handleEmailPasswordRegister = async () => {
    // Enhanced input validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (role === 'doctor' && (!fullName || !licenseNumber || !specialization || !location)) {
      setError('Doctors must provide all required details.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      // Store user details based on role
      if (role === 'doctor') {
        await firestore().collection('doctors').doc(userCredential.user.uid).set({
          fullName,
          email,
          licenseNumber,
          specialization,
          location,
          verified: false, // Initially set as not verified
        });
        Alert.alert('Success', 'Doctor registered successfully. Verification is pending.');
      } else {
        await firestore().collection('patients').doc(userCredential.user.uid).set({
          fullName,
          email,
        });
        Alert.alert('Success', 'Patient registered successfully.');
      }
      navigation.navigate('Login');
    } catch (error: any) {
      console.error('Registration error (Email/Password):', error);
      setError(error.message || 'An error occurred during signup.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to validate email format
  const isValidEmail = (email: string): boolean => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={typography.h2}>Register as {role === 'patient' ? 'Patient' : 'Doctor'}</ThemedText>
      
      {/* Role Selection */}
      <View style={styles.roleToggle}>
        <TouchableOpacity 
          style={[styles.roleButton, role === 'patient' && styles.selectedRole]}
          onPress={() => setRole('patient')}
        >
          <ThemedText style={styles.roleText}>Patient</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.roleButton, role === 'doctor' && styles.selectedRole]}
          onPress={() => setRole('doctor')}
        >
          <ThemedText style={styles.roleText}>Doctor</ThemedText>
        </TouchableOpacity>
      </View>

      {role === 'doctor' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="License Number"
            value={licenseNumber}
            onChangeText={setLicenseNumber}
          />
          <TextInput
            style={styles.input}
            placeholder="Specialization"
            value={specialization}
            onChangeText={setSpecialization}
          />
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={location}
            onChangeText={setLocation}
          />
        </>
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

      <Button 
        title="Register"
        onPress={handleEmailPasswordRegister}
        disabled={isLoading}
        color={colors.primary}
      />

      {isLoading &&       <ActivityIndicator style={styles.loader} color={colors.error} />}

      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Login')}>
        <ThemedText style={styles.linkButtonText}>Already have an account? Log In</ThemedText>
      </TouchableOpacity>
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
  roleToggle: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  roleButton: {
    padding: 10,
    backgroundColor: colors.gray,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  selectedRole: {
    backgroundColor: colors.primary,
  },
  roleText: {
    color: colors.white,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: colors.gray,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  errorText: {
    color: colors.error,
    marginBottom: 10,
  },
  loader: {
    marginTop: 10,
  },
  linkButton: {
    marginTop: 10,
    padding: 10,
  },
  linkButtonText: {
    color: colors.primary,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;