import { View, Text, StyleSheet, TextInput, Button, Image, Alert, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/header';


export default function DiagnoseScreen() {
  const [title, setTitle] = useState('');
  const [plantName, setPlantName] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState('private');


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

  const diagnoseAndPost = async () => {
    try {
      setLoading(true);
      setDiagnosis(null);

      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Missing token');

      if (!image) {
        Alert.alert('Error', 'Please upload or take a photo.');
        return;
      }

      const base64Img = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Step 1: Diagnose
      const diagnosisRes = await axios.post(
        'https://smart-gardening-functions.azurewebsites.net/api/plantdiagnosis',
        { plantType: plantName,      
          complaint: content,         
          imageBase64: base64Img,  },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = diagnosisRes.data;
      const diagnosisText = result.problem === 'none'
      ? '🪴 Your plant looks healthy!'
      : `Problem: ${result.problem}\nSeverity: ${result.severity}\nSuggestions:\n- ${result.suggestions.join('\n- ')}`;

    setDiagnosis(diagnosisText);

      // Step 2: Create Private Post
      await axios.post(
        'https://smart-gardening-functions.azurewebsites.net/api/createCommunityPost',
        {
          title,
          plantName,
          content: `${content}\n\n🧠 Diagnosis:\n${diagnosisText}`,
          visibility,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      Alert.alert('Success', 'Diagnosis completed and private post created!');
      setTitle('');
      setPlantName('');
      setContent('');
      setImage(null);
    } catch (err: any) {
      console.error('Error during diagnosis/post', err.response?.data || err.message);
      Alert.alert('Error', 'Something went wrong. Please check the console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Header title="Main Menu" />
        <Text style={styles.title}>🧠 Diagnose Plant</Text>

        <Text style={styles.label}>🪴 Title</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />

        <Text style={styles.label}>🌿 Plant Name</Text>
        <TextInput style={styles.input} value={plantName} onChangeText={setPlantName} />

        <Text style={styles.label}>📝 Description</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={content}
          onChangeText={setContent}
          multiline
        />

        <Text style={styles.label}>🌐 Visibility (public/private)</Text>
        <TextInput
          style={styles.input}
          value={visibility}
          onChangeText={setVisibility}
          placeholder="private"
        />

        <Text style={styles.label}>📸 Plant Image</Text>
        {image && <Image source={{ uri: image }} style={styles.image} />}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <Button title="Upload Photo" onPress={pickImage} />
          <Button title="Take Photo" onPress={takePhoto} />
        </View>

        <Button title="Run Diagnosis & Create Private Post" onPress={diagnoseAndPost} />
        {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
        {diagnosis && <Text style={styles.diagnosis}>🧠 Diagnosis: {diagnosis}</Text>}
      </View>
    </TouchableWithoutFeedback>
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
  image: { width: '100%', height: 200, resizeMode: 'cover', marginTop: 10, marginBottom: 10 },
  diagnosis: { marginTop: 20, fontSize: 16, color: 'green' },
});
