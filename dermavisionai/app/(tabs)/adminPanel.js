import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { fetchUnverifiedDoctors, verifyDoctorInFirestore, rejectDoctorInFirestore } from '../../services/FirestoreService';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/colors';
import { responsive } from '../styles/responsive'; 

const AdminPanelScreen = () => {
  const { user, role } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUnverifiedDoctors = async () => {
      try {
        const unverifiedDoctors = await fetchUnverifiedDoctors();
        setDoctors(unverifiedDoctors);
      } catch (error) {
        console.error('Error loading unverified doctors:', error);
        Alert.alert('Error', 'Failed to load unverified doctors.');
      } finally {
        setLoading(false);
      }
    };

    loadUnverifiedDoctors();
  }, []);

  const handleVerifyDoctor = async (doctorId) => {
    try {
      await verifyDoctorInFirestore(doctorId);
      Alert.alert('Success', 'Doctor verified successfully.');
      // Refresh the list after verification
      loadUnverifiedDoctors(); 
    } catch (error) {
      console.error('Error verifying doctor:', error);
      Alert.alert('Error', 'Failed to verify doctor.');
    }
  };

  const handleRejectDoctor = async (doctorId) => {
    try {
      await rejectDoctorInFirestore(doctorId);
      Alert.alert('Success', 'Doctor rejected and deleted successfully.');
      // Refresh the list after rejection
      loadUnverifiedDoctors(); 
    } catch (error) {
      console.error('Error rejecting doctor:', error);
      Alert.alert('Error', 'Failed to reject doctor.');
    }
  };

  const renderDoctorItem = ({ item }) => (
    <View style={styles.doctorItem}>
      <Text style={styles.doctorInfo}>{item.name} ({item.email})</Text> {/* Display name and email */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={() => handleVerifyDoctor(item.id)}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonReject} onPress={() => handleRejectDoctor(item.id)}>
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Check if the user is an admin
  if (!user || role !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Unauthorized Access</Text>
        <Text>You do not have permission to access this screen.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} /> 
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unverified Doctors</Text>
      {doctors.length === 0 ? (
        <Text>No unverified doctors available</Text>
      ) : (
        <FlatList
          data={doctors}
          renderItem={renderDoctorItem}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  doctorItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  doctorInfo: {
    fontSize: 18,
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: colors.primary, // Use color from your color scheme
    padding: 10,
    borderRadius: 5,
    width: '45%',
  },
  buttonReject: {
    backgroundColor: colors.accent, // Use color from your color scheme
    padding: 10,
    borderRadius: 5,
    width: '45%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AdminPanelScreen;