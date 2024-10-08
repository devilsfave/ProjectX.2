import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, Switch, Image, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';
import { responsive } from '../styles/responsive';
import { useTheme } from '../context/ThemeContext';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Login: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
};

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList>;

type ProfileScreenProps = {
  navigation: ProfileScreenNavigationProp;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const checkAuth = setTimeout(() => {
      if (!user) {
        navigation.navigate('Login');
      } else {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(checkAuth);
  }, [user, navigation]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert('Logout Error', 'An error occurred while logging out. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDarkMode && styles.darkContainer]}>
      {user && (
        <View style={styles.profileContent}>
          <Image
            source={{ uri: user.photoURL || 'https://via.placeholder.com/150' }}
            style={styles.profileImage}
          />
          <Text style={[styles.welcomeText, isDarkMode && styles.darkText]}>
            Welcome, {user.displayName || user.email}!
          </Text>
          <Text style={[styles.emailText, isDarkMode && styles.darkText]}>
            Email: {user.email}
          </Text>
          <View style={styles.settingsContainer}>
            <Text style={[styles.settingsLabel, isDarkMode && styles.darkText]}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              thumbColor={isDarkMode ? colors.accent : colors.primary}
            />
          </View>
          <Button title="Logout" onPress={handleLogout} color={colors.primary} />

          <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('TermsOfService')}>
            <Text style={styles.linkButtonText}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={styles.linkButtonText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsive(20),
  },
  darkContainer: {
    backgroundColor: colors.backgroundDark, // Changed to match existing colors
  },
  darkText: {
    color: colors.textDark, // Changed to match existing colors
  },
  welcomeText: {
    fontSize: responsive(20),
    marginBottom: responsive(10),
  },
  emailText: {
    fontSize: 16,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContent: {
    alignItems: 'center',
    width: '100%',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  settingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '80%',
  },
  settingsLabel: {
    fontSize: 16,
  },
  linkButton: {
    marginTop: 10,
    padding: 10,
  },
  linkButtonText: {
    color: '#007AFF',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default ProfileScreen;
