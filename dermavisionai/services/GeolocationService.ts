import Geolocation from 'react-native-geolocation-service';
import * as Location from 'expo-location';
import axios from 'axios';

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
const GOOGLE_MAPS_API_KEY = 'AIzaSyB8sjqse3KcHrYTf4huQb40QZ-E6lV29z0';

interface Facility {
  name: string;
  address: string;
  distance: string;
}

export const findNearbyFacilities = async (latitude: number, longitude: number): Promise<Facility[]> => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=hospital&key=${GOOGLE_MAPS_API_KEY}`
    );

    const facilities: Facility[] = response.data.results.map((result: any) => ({
      name: result.name,
      address: result.vicinity,
      distance: 'N/A', 
    }));

    return facilities.slice(0, 5); 
  } catch (error) {
    console.error('Error finding nearby facilities:', error);
    throw error;
  }
};