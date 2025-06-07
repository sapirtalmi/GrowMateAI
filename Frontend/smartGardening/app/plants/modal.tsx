import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, Image, StyleSheet, Text, TextInput, View } from 'react-native';


export default function AddPlantModal() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [deviceID, setDeviceId] = useState('');
  const [plantType, setPlantType] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  //adding pic
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
      Alert.alert("Missing info", "Please fill in both the name and device ID.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
  
      if (!token) {
        Alert.alert("Unauthorized", "No token found. Please log in again.");
        return;
      }
  
      const plantData = {
        name,
        deviceID,
        plantType,
      };

      console.log('Sending plant:', plantData);

      const response = await axios.post(
        'https://smart-gardening-functions.azurewebsites.net/api/addplant', 
        plantData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Response:', response.data);

      router.back(); // Close modal after success

    } catch (error: any) {
      console.error('Error adding plant:', error);

      if (error.response?.status === 401) {
        Alert.alert('Unauthorized', 'Your session has expired. Please log in again.');
      } else {
        Alert.alert('Error', 'Failed to add plant. Please try again.');
      }
    }

    console.log('Plant added:', {
      name,
      deviceID,
      plantType,
      imageUri,
    });

    router.back(); // Close the modal
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌿Add New Plant</Text>

      <Link href="/menu" style={{ marginBottom: 20 }}>
        <Text style={{ color: 'blue', fontSize: 16 }}>← menu</Text>
      </Link>


      <TextInput
        style={styles.input}
        placeholder="Plant name"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#9FE2BF"

      />

      <TextInput
        style={styles.input}
        placeholder="Device ID"
        value={deviceID}
        onChangeText={setDeviceId}
        placeholderTextColor="#9FE2BF"

      />

      <TextInput
        style={styles.input}
        placeholder="Plant Type (e.g., Herb, Tree)"
        value={plantType}
        onChangeText={setPlantType}
        placeholderTextColor="#9FE2BF"
      />

      <Button title="Choose from Gallery" onPress={pickFromGallery} />
      <View style={{ marginVertical: 10 }} />
      <Button title="Take a Photo" onPress={takePhoto} />

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      )}


      <View style={{ marginTop: 20 }}>
        <Button title="Add Plant" onPress={handleAdd} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
  },
  preview: {
    width: 180,
    height: 180,
    marginTop: 20,
    borderRadius: 10,
    alignSelf: 'center',
  },
});
