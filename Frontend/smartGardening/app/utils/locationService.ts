import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
}

/**
 * Request location permission and get current coordinates
 * @returns Promise<UserLocation | null>
 */
export const getCurrentLocation = async (): Promise<UserLocation | null> => {
  try {
    // Check if permission is already granted
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
      if (newStatus !== 'granted') {
        console.log('❌ Location permission denied');
        return null;
      }
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const userLocation: UserLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: new Date().toISOString(),
    };

    // Store location in AsyncStorage
    await AsyncStorage.setItem('userLocation', JSON.stringify(userLocation));
    
    console.log('📍 Current Location:', userLocation);
    return userLocation;
    
  } catch (error) {
    console.error('❌ Error getting location:', error);
    return null;
  }
};

/**
 * Get stored location from AsyncStorage
 * @returns Promise<UserLocation | null>
 */
export const getStoredLocation = async (): Promise<UserLocation | null> => {
  try {
    const storedLocation = await AsyncStorage.getItem('userLocation');
    if (storedLocation) {
      const location: UserLocation = JSON.parse(storedLocation);
      console.log('📱 Retrieved stored location:', location);
      return location;
    }
    return null;
  } catch (error) {
    console.error('❌ Error retrieving stored location:', error);
    return null;
  }
};

/**
 * Calculate distance between two coordinates in kilometers
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};
