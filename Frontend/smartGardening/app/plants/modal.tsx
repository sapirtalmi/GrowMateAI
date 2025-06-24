import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme, ActivityIndicator } from 'react-native-paper';
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
      Alert.alert("Missing Info", "Please fill in both the name and device ID.");
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

        <TextInput
          label="Device ID"
          value={deviceID}
          onChangeText={setDeviceId}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="access-point" />}
        />

        <TextInput
          label="Plant Type (e.g., Herb, Tree)"
          value={plantType}
          onChangeText={setPlantType}
          mode="outlined"
          style={styles.input}
          left={<TextInput.Icon icon="flower" />}
        />

        <Button
          mode="outlined"
          onPress={pickFromGallery}
          icon="image"
          style={styles.button}
        >
          Choose from Gallery
        </Button>

        <Button
          mode="outlined"
          onPress={takePhoto}
          icon="camera"
          style={styles.button}
        >
          Take a Photo
        </Button>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        )}

        {isLoading ? (
          <ActivityIndicator animating={true} style={{ marginTop: 20 }} color={theme.colors.primary} />
        ) : (
          <Button
            mode="contained"
            onPress={handleAdd}
            icon="plus-box"
            style={styles.button}
          >
            Add Plant
          </Button>
        )}
      </ScrollView>
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
    marginTop: 10,
  },
  preview: {
    width: 180,
    height: 180,
    marginTop: 20,
    borderRadius: 10,
    alignSelf: 'center',
  },
});
