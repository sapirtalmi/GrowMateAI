import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Header from '../components/header';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';



export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [plantName, setPlantName] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const router = useRouter();

  const [image, setImage] = useState<string | null>(null);

    const pickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({ base64: false });
      if (!result.canceled && result.assets?.length) {
        setImage(result.assets[0].uri);
      }
    };

    const takePhoto = async () => {
      const result = await ImagePicker.launchCameraAsync({ base64: false });
      if (!result.canceled && result.assets?.length) {
        setImage(result.assets[0].uri);
      }
    };

    const handleSubmit = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) return Alert.alert('Error', 'Missing token');

        let imageBase64 = '';
        if (image) {
          imageBase64 = await FileSystem.readAsStringAsync(image, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }

        await axios.post(
          'https://smart-gardening-functions.azurewebsites.net/api/createCommunityPost',
          { title, plantName, content, visibility, imageBase64 },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        Alert.alert('Success', 'Post created!');
        router.push('/community');
      } catch (err) {
        console.error('Create post error', err);
        Alert.alert('Error', 'Could not create post.');
      }
    };


  return (
    <View style={styles.container}>
      <Header title="Main Menu" />
      
      <Text style={styles.label}>🪴 Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>🌿 Plant Name</Text>
      <TextInput style={styles.input} value={plantName} onChangeText={setPlantName} />

      <Text style={styles.label}>📄 Content</Text>
      <TextInput style={[styles.input, { height: 100 }]} value={content} onChangeText={setContent} multiline />

      <Text style={styles.label}>🌐 Visibility (public/private)</Text>
      <TextInput style={styles.input} value={visibility} onChangeText={setVisibility} />

      <Text style={styles.label}>📸 Photo (optional)</Text>
      {image && <Image source={{ uri: image }} style={styles.image} />}

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
        <Button title="Upload Photo" onPress={pickImage} />
        <View style={{ width: 10 }} />
        <Button title="Take Photo" onPress={takePhoto} />
      </View>


      <Button title="Submit Post" onPress={handleSubmit} />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { marginTop: 10, fontWeight: '600' },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 5,
  },
  image: { width: '100%', height: 200, resizeMode: 'cover', marginTop: 10, marginBottom: 10 }
});
