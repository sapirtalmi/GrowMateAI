import {
  View,
  StyleSheet,
  Keyboard,
  Image,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import { useState } from 'react';
import Header from '../components/header';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Text,
  TextInput,
  Button,
  useTheme,
  IconButton,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams } from 'expo-router';

export default function DiagnoseScreen() {
  const params = useLocalSearchParams();
  const [title, setTitle] = useState('');
  const [plantName, setPlantName] = useState(() => {
    // Prefill from query param if available
    return typeof params.prefillPlantName === 'string' ? params.prefillPlantName : '';
  });
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState('private');
  const theme = useTheme();

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
      if (!image) return Alert.alert('Upload required', 'Please upload or take a photo.');

      const base64Img = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const res = await axios.post(
        'https://smart-gardening-functions.azurewebsites.net/api/plantdiagnosis',
        {
          plantType: plantName,
          complaint: content,
          imageBase64: base64Img,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = res.data;
      const diagnosisText =
        result.problem === 'none'
          ? 'Your plant looks healthy!'
          : `Problem: ${result.problem}\nSeverity: ${result.severity}\nSuggestions:\n- ${result.suggestions.join('\n- ')}`;
      setDiagnosis(diagnosisText);

      await axios.post(
        'https://smart-gardening-functions.azurewebsites.net/api/createCommunityPost',
        {
          title,
          plantName,
          content: `${content}\n\nDiagnosis:\n${diagnosisText}`,
          visibility,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'Diagnosis completed and post created!');
      setTitle('');
      setPlantName('');
      setContent('');
      setImage(null);
    } catch (err: any) {
      console.error('Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Header title="Main Menu" />
        <View style={styles.row}>
          <Icon name="brain" size={24} color={theme.colors.primary} />
          <Text variant="titleLarge" style={styles.title}> Diagnose Plant</Text>
        </View>

        <TextInput label="Title" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
        <TextInput label="Plant Name" value={plantName} onChangeText={setPlantName} mode="outlined" style={styles.input} />
        <TextInput label="Description" value={content} onChangeText={setContent} multiline mode="outlined" style={styles.input} />
        <TextInput label="Visibility" value={visibility} onChangeText={setVisibility} mode="outlined" style={styles.input} />

        <View style={styles.row}>
          <Icon name="camera-image" size={22} color={theme.colors.primary} />
          <Text style={styles.label}> Plant Image</Text>
        </View>

        {image && <Image source={{ uri: image }} style={styles.image} />}

        <View style={styles.buttonRow}>
          <Button icon="image" mode="outlined" onPress={pickImage} style={styles.button}>
            Upload
          </Button>
          <Button icon="camera" mode="outlined" onPress={takePhoto} style={styles.button}>
            Camera
          </Button>
        </View>

        <Button
          icon="leaf"
          mode="contained"
          onPress={diagnoseAndPost}
          disabled={loading}
        >
          Run Diagnosis
        </Button>

        {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
        {diagnosis && (
          <Text style={styles.diagnosis}>
            <Icon name="check-circle-outline" size={18} /> {diagnosis}
          </Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  label: { fontWeight: '600', fontSize: 15 },
  input: { marginBottom: 10 },
  image: { width: '100%', height: 200, marginTop: 10, borderRadius: 10 },
  diagnosis: { marginTop: 20, fontSize: 16, color: 'green', fontStyle: 'italic' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  button: { flex: 1, marginHorizontal: 4 },
});
