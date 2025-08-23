import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  useTheme,
  RadioButton,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [acceptEmailNotifications, setAcceptEmailNotifications] = useState(false);
  const [profileType, setProfileType] = useState('amateur'); // default
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  const requestLocationPermission = async () => {
    setIsRequestingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        setLocationPermissionGranted(true);
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(currentLocation);
        Alert.alert('Success', 'Location access granted! Your coordinates will be included in registration.');
      } else {
        Alert.alert(
          'Location Permission',
          'Location access was denied. You can still register, but location features may be limited.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get your location. You can still register without it.');
    } finally {
      setIsRequestingLocation(false);
    }
  };

  const handleRegister = async () => {
    if (!username || !password || !email) {
      Alert.alert('Validation Error', 'Username, password, and email are required.');
      return;
    }
    if (!acceptEmailNotifications) {
      Alert.alert('Consent Required', 'You must accept receiving notifications via email.');
      return;
    }
    setIsLoading(true);
    try {
      // Prepare registration data
      const registrationData: any = {
        username,
        password,
        email,
        profileType,
        acceptEmailNotifications,
      };

      // Add location data if available
      if (location) {
        registrationData.latitude = location.coords.latitude;
        registrationData.longitude = location.coords.longitude;
        registrationData.accuracy = location.coords.accuracy;
      }

      const res = await fetch('https://smartgardeningfunctions.azurewebsites.net/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      if (res.status === 409) {
        Alert.alert('Registration Failed', 'Username already exists.');
        return;
      }

      if (!res.ok) throw new Error('Unexpected error');

      Alert.alert('Success', 'Account created! You can now log in.');
      router.replace('/');
    } catch (err) {
      console.error('Register error:', err);
      Alert.alert('Error', 'Could not register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Icon name="account-plus" size={42} color={theme.colors.primary} style={{ marginBottom: 10 }} />
      <Text variant="headlineSmall" style={styles.title}>
        Create Account
      </Text>

      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        mode="outlined"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        label="Email Address"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Icon
          name={acceptEmailNotifications ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={28}
          color={acceptEmailNotifications ? theme.colors.primary : '#888'}
          onPress={() => setAcceptEmailNotifications(!acceptEmailNotifications)}
          style={{ marginRight: 8 }}
        />
        <Text style={{ flex: 1 }} onPress={() => setAcceptEmailNotifications(!acceptEmailNotifications)}>
          I accept receiving notifications regarding my plants and garden via email
        </Text>
      </View>

      <Text variant="labelLarge" style={{ marginTop: 10, marginBottom: 6 }}>
        Select your profile type:
      </Text>

      <RadioButton.Group onValueChange={value => setProfileType(value)} value={profileType}>
        {['amateur', 'enthusiast', 'professional', 'nursery_owner'].map(type => (
          <View key={type} style={styles.radioRow}>
            <RadioButton value={type} />
            <Text>{type.replace('_', ' ')}</Text>
          </View>
        ))}
      </RadioButton.Group>

      {/* Location Permission Section */}
      <View style={styles.locationSection}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Icon
            name={locationPermissionGranted ? 'map-marker-check' : 'map-marker-question'}
            size={24}
            color={locationPermissionGranted ? theme.colors.primary : '#666'}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.locationTitle}>Location Access (Optional)</Text>
        </View>

        <Text style={styles.locationDescription}>
          {locationPermissionGranted
            ? `✓ Location access granted! Your coordinates will be included.`
            : 'Allow location access to enable location-based features like nearby garden centers and weather updates.'}
        </Text>

        {!locationPermissionGranted && (
          <Button
            mode="outlined"
            onPress={requestLocationPermission}
            disabled={isRequestingLocation}
            style={{ marginTop: 8 }}
            icon="map-marker"
          >
            {isRequestingLocation ? 'Requesting...' : 'Enable Location Access'}
          </Button>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <Button mode="contained" onPress={handleRegister} style={{ marginTop: 20 }}>
          Register
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { textAlign: 'center', marginBottom: 20 },
  input: { marginBottom: 12 },
  locationSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  locationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
});
