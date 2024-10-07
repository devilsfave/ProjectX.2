import React, { useState, useEffect } from 'react';
import { View, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemedView, ThemedText } from '../../components/Themed';
import { colors } from '../../styles/colors';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig'; 
import Icon from '@expo/vector-icons/MaterialIcons';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  location: string;
  rating: number;
}

export default function DoctorListScreen() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const doctorsRef = collection(db, 'doctors');
      const q = query(doctorsRef, orderBy('rating', 'desc'));
      const querySnapshot = await getDocs(q);
      const doctorList: Doctor[] = [];
      querySnapshot.forEach((doc) => {
        doctorList.push({ id: doc.id, ...doc.data() } as Doctor);
      });
      setDoctors(doctorList);
      setFilteredDoctors(doctorList);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filtered = doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(text.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(text.toLowerCase()) ||
        doctor.location.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredDoctors(filtered);
  };

  const renderDoctorItem = ({ item }: { item: Doctor }) => (
    <View style={styles.doctorItem}>
      <ThemedText style={styles.doctorName}>{item.name}</ThemedText>
      <ThemedText>{item.specialization}</ThemedText>
      <ThemedText>{item.location}</ThemedText>
      <View style={styles.ratingContainer}>
        <Icon name="star" size={16} color={colors.primary} />
        <ThemedText style={styles.ratingText}>{item.rating.toFixed(1)}</ThemedText>
      </View>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Find a Dermatologist</ThemedText>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, specialization, or location"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => handleSearch(searchQuery)}>
          <Icon name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredDoctors}
        renderItem={renderDoctorItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>No doctors found</ThemedText>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  searchButton: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  doctorItem: {
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingText: {
    marginLeft: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});