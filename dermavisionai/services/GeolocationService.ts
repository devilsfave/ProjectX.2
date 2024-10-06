import Geolocation from 'react-native-geolocation-service';
import * as Location from 'expo-location';

// Function to get the user's current location
export const getCurrentLocation = async () => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync(); 
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    let location = await Location.getCurrentPositionAsync({});
    return location.coords; 
  } catch (error) {
    console.error('Error getting current location:', error);
    throw error;
  }
};

// Function to find nearby health facilities (placeholder - you'll need to implement the actual logic)
export const findNearbyFacilities = async (latitude, longitude) => {
  
  console.log('Finding nearby facilities for:', latitude, longitude);
  return [
    { name: 'Facility A', address: '123 Main St', distance: '1.2 km' },
    { name: 'Facility B', address: '456 Elm St', distance: '2.5 km' },
  ]; 
};