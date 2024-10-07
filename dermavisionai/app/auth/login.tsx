import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import Icon from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { ThemedView, ThemedText } from '../../components/Themed';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { login, loginWithGoogle, loginWithFacebook } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <ThemedView style={styles.container}>
      <Image
        source={require('../assets/your_app_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ThemedText style={typography.h2}>Welcome Back!</ThemedText>

      <View style={styles.roleContainer}>
        <ThemedText>Select your role:</ThemedText>
        <TouchableOpacity onPress={() => setRole('patient')} style={[styles.roleButton, role === 'patient' && styles.selectedRole]}>
          <ThemedText style={styles.roleText}>Patient</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRole('doctor')} style={[styles.roleButton, role === 'doctor' && styles.selectedRole]}>
          <ThemedText style={styles.roleText}>Doctor</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>Email Address</ThemedText>
        <View style={styles.inputWrapper}>
          <Icon name="email" size={24} color={colors.text} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={colors.text}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <ThemedText style={styles.label}>Password</ThemedText>
        <View style={styles.inputWrapper}>
          <Icon name="lock" size={24} color={colors.text} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            placeholderTextColor={colors.text}
          />
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            <Icon name={isPasswordVisible ? 'visibility-off' : 'visibility'} size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

      <Button title="Login" onPress={handleLogin} disabled={isLoading || !email || !password} color={colors.primary} />

      {isLoading && <ActivityIndicator style={styles.loader} color={colors.accent} />}

      <View style={styles.socialLoginContainer}>
        <ThemedText style={styles.orText}>Or login with</ThemedText>
        <View style={styles.socialButtonsContainer}>
          <TouchableOpacity style={styles.socialButton} onPress={loginWithGoogle}>
            <Icon name="google" size={20} color={colors.text} style={styles.socialIcon} />
            <ThemedText>Google</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton} onPress={loginWithFacebook}>
            <Icon name="facebook" size={20} color={colors.text} style={styles.socialIcon} />
            <ThemedText>Facebook</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={() => router.push('/signup')}>
        <ThemedText style={styles.signupLink}>Don't have an account? Sign up</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/forgot-password')}>
        <ThemedText style={styles.forgotPasswordLink}>Forgot Password?</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  roleButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: colors.lightBackground,
  },
  selectedRole: {
    backgroundColor: colors.primary,
  },
  roleText: {
    color: colors.text,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    color: colors.text,
  },
  eyeIcon: {
    padding: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  loader: {
    marginTop: 10,
  },
  socialLoginContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  orText: {
    marginVertical: 10,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
  },
  socialIcon: {
    marginRight: 5,
  },
  signupLink: {
    textAlign: 'center',
    marginTop: 10,
  },
  forgotPasswordLink: {
    textAlign: 'center',
    color: colors.primary,
    marginTop: 10,
  },
});

export default LoginScreen;