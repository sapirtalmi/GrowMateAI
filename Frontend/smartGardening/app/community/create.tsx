import { useState } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  useTheme,
  IconButton,
} from 'react-native-paper';
import Header from '../components/header';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CreatePost() {
  const theme = useTheme();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [plantName, setPlantName] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
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
        'https://smartgardeningfunctions.azurewebsites.net/api/createCommunityPost',
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

      <Text variant="titleLarge" style={styles.title}>
        <Icon name="pencil-box-outline" size={22} /> Create New Post
      </Text>

      <TextInput label="Title" value={title} onChangeText={setTitle} style={styles.input} mode="outlined" />
      <TextInput label="Plant Name" value={plantName} onChangeText={setPlantName} style={styles.input} mode="outlined" />
      <TextInput label="Content" value={content} onChangeText={setContent} multiline numberOfLines={5} style={styles.input} mode="outlined" />
      <TextInput label="Visibility" value={visibility} onChangeText={setVisibility} style={styles.input} mode="outlined" />

      <View style={styles.imageRow}>
        <Text style={{ fontWeight: '600' }}>Photo</Text>
        <IconButton icon="image" onPress={pickImage} />
        <IconButton icon="camera" onPress={takePhoto} />
      </View>

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <Button mode="contained" icon="check" onPress={handleSubmit}>
        Submit Post
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { marginBottom: 16 },
  input: { marginBottom: 12 },
  imageRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  image: { width: '100%', height: 180, borderRadius: 8, marginBottom: 20 },
});
