import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme, ActivityIndicator, Menu } from 'react-native-paper';

import Header from '../components/header';
import Toast from '../components/Toast';

export default function AddPlantModal() {
  const router = useRouter();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [deviceID, setDeviceId] = useState('');
  const [plantType, setPlantType] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [availableSensors, setAvailableSensors] = useState<string[]>([]);
  const [sensorsLoading, setSensorsLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  // Fetch available sensors when component mounts
  useEffect(() => {
    fetchAvailableSensors();
  }, []);

  const fetchAvailableSensors = async () => {
    try {
      setSensorsLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert("Unauthorized", "No token found. Please log in again.");
        return;
      }

      const response = await axios.get(
        'https://smartgardeningfunctions.azurewebsites.net/api/getMySensors',
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.sensorIDs) {
        setAvailableSensors(response.data.sensorIDs);
      } else {
        setAvailableSensors([]);
      }
    } catch (error: any) {
      console.error('Error fetching sensors:', error);
      Alert.alert('Error', 'Failed to fetch available sensors. Please try again.');
      setAvailableSensors([]);
    } finally {
      setSensorsLoading(false);
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Camera access is needed to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleAdd = async () => {
    if (!name || !deviceID) {
      Alert.alert(
        "Missing Information", 
        !name ? "Please enter a plant name." : "Please select a device ID from your available sensors."
      );

      return;
    }
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        Alert.alert("Unauthorized", "No token found. Please log in again.");
        setIsLoading(false);
        return;
      }

      const response = await axios.post(
        'https://smartgardeningfunctions.azurewebsites.net/api/addplant',
        { name, deviceID, plantType },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Response:', response.data);
      setToastMsg('Plant added!');
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
        router.back();
      }, 2000);
    } catch (error: any) {
      console.error('Error adding plant:', error);
      if (error.response?.status === 421) {
        const suggestedName = error.response.data;
        if (suggestedName) {
          console.log('Suggested name:', suggestedName);
          Alert.alert(
            'Invalid Plant Name',
            `Suggested name: ${suggestedName}`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Apply', onPress: () => setPlantType(suggestedName) }
            ]
          );
        } else {
          Alert.alert('Invalid Plant Name', 'No suggested name was provided.');
        }
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toast visible={toastVisible} message={toastMsg} onHide={() => setToastVisible(false)} />
      <ScrollView contentContainerStyle={styles.container}>
        <Header title="Main Menu" />
        <Text variant="headlineMedium" style={styles.title}>
          <TextInput.Icon icon="sprout" /> Add New Plant
        </Text>

        <TextInput
          label="Plant Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="leaf" />}
        />

        {/* Device ID Picker */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Device ID</Text>
          {sensorsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading sensors...</Text>
            </View>
          ) : availableSensors.length === 0 ? (
            <View style={styles.noSensorsContainer}>
              <Text style={styles.noSensorsText}>No sensors available</Text>
              <Button mode="outlined" onPress={fetchAvailableSensors} style={styles.refreshButton}>
                Refresh
              </Button>
            </View>
          ) : (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  style={styles.pickerButton}
                  contentStyle={styles.pickerButtonContent}
                  icon="access-point"
                >
                  {deviceID || 'Select Device ID'}
                </Button>
              }
            >
              {availableSensors.map((sensorId) => (
                <Menu.Item
                  key={sensorId}
                  onPress={() => {
                    setDeviceId(sensorId);
                    setMenuVisible(false);
                  }}
                  title={sensorId}
                />
              ))}
            </Menu>
          )}
        </View>

        <TextInput
          label="Plant Type (e.g., Herb, Tree)"
          value={plantType}
          onChangeText={setPlantType}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="flower" />}
        />


        <Button
          mode="contained"
          onPress={handleAdd}
          icon="plus-box"
          style={{ marginTop: 20 }}
        >
          Add Plant
        </Button>
      </ScrollView>

      <Toast visible={toastVisible} message={toastMsg} onHide={() => setToastVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  preview: {
    width: 180,
    height: 180,
    marginTop: 20,
    borderRadius: 10,
    alignSelf: 'center',
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
  },
  noSensorsContainer: {
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  noSensorsText: {
    textAlign: 'center',
    color: '#856404',
    marginBottom: 10,
  },
  refreshButton: {
    alignSelf: 'center',
  },
  pickerButton: {
    marginBottom: 8,
    justifyContent: 'flex-start',
  },
  pickerButtonContent: {
    justifyContent: 'flex-start',
  },
});

