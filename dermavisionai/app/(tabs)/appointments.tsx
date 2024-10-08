import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Alert, FlatList } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker'; // Ensure correct import
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from '@react-native-firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import * as Calendar from 'expo-calendar';
import * as Notifications from 'expo-notifications';
import { colors } from '../../styles/colors';
import { responsive } from '../../styles/responsive';
import { ThemedText, ThemedView } from '../../components/Themed';
import { useRouter, useLocalSearchParams } from 'expo-router';
import firestore from '@react-native-firebase/firestore';

// Define the Appointment interface
interface Appointment {
  id: string;
  date: string;
  time: string;
  doctorId: string;
  userId: string;
}

const AppointmentBookingScreen: React.FC = () => {
  const { user, expoPushToken } = useAuth();
  const router = useRouter();
  const { doctorId, doctorName } = useLocalSearchParams<{ doctorId: string; doctorName: string }>();
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Fetch appointments from Firestore
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const q = query(collection(firestore(), 'appointments'), where('patientId', '==', user?.uid));
        const querySnapshot = await getDocs(q);
        const fetchedAppointments = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Appointment));
        setAppointments(fetchedAppointments);
      } catch (error) {
        Alert.alert('Error', (error as Error).message);
      }
    };

    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const handleBookAppointment = async () => {
    if (!date || !time || !user) {
      Alert.alert('Error', 'Please select both date and time.');
      return;
    }

    try {
      const appointmentData: Omit<Appointment, 'id'> = {
        doctorId,
        userId: user.uid,
        date: date.toISOString().split('T')[0],
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Save appointment to Firestore
      const docRef = await addDoc(collection(firestore(), 'appointments'), appointmentData);

      // Add appointment to device calendar
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendar = calendars.find(cal => cal.isPrimary) || calendars[0]; // Use primary or first available calendar

        if (defaultCalendar) {
          await Calendar.createEventAsync(defaultCalendar.id, {
            title: `Appointment with Dr. ${doctorName}`,
            startDate: new Date(date.setHours(time.getHours(), time.getMinutes())),
            endDate: new Date(date.setHours(time.getHours() + 1)),
            notes: `Appointment with Dr. ${doctorName}`,
          });
        }
      }

      // Send push notification if expoPushToken is available
      if (expoPushToken) {
        await sendPushNotification(
          expoPushToken,
          'Appointment Booked',
          `Your appointment with Dr. ${doctorName} is scheduled on ${date.toLocaleDateString()} at ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
        );
      }

      Alert.alert('Success', `Appointment booked with Dr. ${doctorName} on ${date.toLocaleDateString()} at ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to book appointment.');
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      await deleteDoc(doc(firestore(), 'appointments', id));
      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      Alert.alert('Success', 'Appointment canceled successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel appointment.');
    }
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const handleTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(false);
    setTime(currentTime);
  };

  const sendPushNotification = async (expoPushToken: string, title: string, body: string) => {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data: { data: 'goes here' },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Book Appointment with Dr. {doctorName}</ThemedText>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          style={styles.input}
          placeholder="Select Date"
          value={date.toLocaleDateString()}
          editable={false}
        />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          is24Hour={true}
          onChange={handleDateChange}
        />
      )}
      <TouchableOpacity onPress={() => setShowTimePicker(true)}>
        <TextInput
          style={styles.input}
          placeholder="Select Time"
          value={time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          editable={false}
        />
      </TouchableOpacity>
      {showTimePicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
          onChange={handleTimeChange}
        />
      )}
      <TouchableOpacity style={styles.button} onPress={handleBookAppointment}>
        <ThemedText style={styles.buttonText}>Book Appointment</ThemedText>
      </TouchableOpacity>
      <ThemedText style={styles.subtitle}>Your Appointments:</ThemedText>
      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.appointmentContainer}>
            <ThemedText>{`${new Date(item.date).toLocaleDateString()} at ${item.time} with Dr. ${item.doctorId}`}</ThemedText>
            <TouchableOpacity onPress={() => handleCancelAppointment(item.id)}>
              <ThemedText style={styles.cancelButton}>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: responsive(16), 
  },
  title: {
    fontSize: 24,
    marginBottom: responsive(16), 
  },
  subtitle: {
    fontSize: 18,
    marginTop: responsive(16), 
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: responsive(8), 
    paddingHorizontal: responsive(8), 
  },
  button: {
    backgroundColor: colors.primary,
    padding: responsive(8), 
    borderRadius: 5,
    marginTop: responsive(8), 
    width: '100%',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
  },
  appointmentContainer: {
    padding: responsive(8), 
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cancelButton: {
    color: 'red',
    marginTop: responsive(4), 
  },
});


export default AppointmentBookingScreen;
