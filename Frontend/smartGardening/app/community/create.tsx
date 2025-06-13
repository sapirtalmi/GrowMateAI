import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Header from '../components/header';


export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [plantName, setPlantName] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const router = useRouter();

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return Alert.alert('Error', 'Missing token');

      const res = await axios.post(
        'https://smart-gardening-functions.azurewebsites.net/api/createCommunityPost',
        { title, plantName, content, visibility },
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

      <Button title="Submit Post" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, backgroundColor: '#fff' },
  label: { marginTop: 10, fontWeight: 'bold' },
  input: { borderColor: '#ccc', borderWidth: 1, padding: 8, marginTop: 4, borderRadius: 6 },
});
