import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Modal,
  TextInput,
  Image,
  Button,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

type Plant = {
  name: string;
  sensorID: string;
  plant_type: string;
};

const encodeImageToBase64 = async (uri: string): Promise<string> => {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return base64;
};

export default function PlantListScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sensorDataMap, setSensorDataMap] = useState<{ [sensorID: string]: any }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [problemText, setProblemText] = useState('');
  const [loadingDiagnosis, setLoadingDiagnosis] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: 'My Plants' });
  }, [navigation]);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) throw new Error('No token found');

        const response = await axios.get(
          'https://smartgardeningfunctions.azurewebsites.net/api/getUserPlants',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const plantsFromAPI = response.data.plants || [];
        setPlants(plantsFromAPI);

        // Fetch sensor data for each plant
        const sensorDataResults: { [sensorID: string]: any } = {};

        await Promise.all(
          plantsFromAPI.map(async (plant: Plant) => {
            try {
              const sensorRes = await axios.post(
                'https://smartgardeningfunctions.azurewebsites.net/api/getSensorHistoryByDeviceID',
                {
                  sensorID: plant.sensorID,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );
              

              const readings = sensorRes.data.data;
              if (readings && readings.length > 0) {
                readings.sort(
                  (a: any, b: any) =>
                    new Date(b.Date).getTime() - new Date(a.Date).getTime()
                );
                sensorDataResults[plant.sensorID] = readings[0];
              }
            } catch (err) {
              console.warn(`Failed to fetch sensor data for ${plant.sensorID}`);
            }
          })
        );

        setSensorDataMap(sensorDataResults);
      } catch (error) {
        console.error('Error fetching plants or sensor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  const handleSubmitProblem = async () => {
    if (!selectedPlant || !problemText || !imageUri) {
      alert('Please provide all fields');
      return;
    }

    setLoadingDiagnosis(true);

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Missing token');

      const base64Image = await encodeImageToBase64(imageUri);

      const response = await axios.post(
        'https://smartgardeningfunctions.azurewebsites.net/api/plantdiagnosis',
        {
          plantType: selectedPlant.plant_type,
          complaint: problemText,
          imageBase64: base64Image,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = response.data;

      alert(
        `🪴 Problem: ${result.problem}\n🚨 Severity: ${result.severity}\n💡 Suggestions:\n- ${result.suggestions.join(
          '\n- '
        )}`
      );
    } catch (error: any) {
      console.error('Failed to submit:', error);
      alert('Failed to submit the report.');
    } finally {
      setLoadingDiagnosis(false);
      setModalVisible(false);
      setImageUri(null);
      setProblemText('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🪴 My Plants</Text>
        <Pressable onPress={() => router.push('/plants/modal')}>
          <Text style={styles.newPlant}>New Plant</Text>
        </Pressable>
      </View>

      {loading ? (
        <Text>Loading...</Text>
      ) : plants.length === 0 ? (
        <Text style={styles.empty}>No plants yet 🥲</Text>
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.plantItem}>
              <Text style={styles.plantName}>🌱 {item.name}</Text>
              <Text style={styles.deviceId}>🔌 {item.sensorID}</Text>
              <Text style={styles.deviceId}>🌿 Type: {item.plant_type}</Text>

              {sensorDataMap[item.sensorID] && (
                <View style={{ marginTop: 8 }}>
                  <Text>
                    🌡 Temp: {sensorDataMap[item.sensorID].Temperature}°C
                  </Text>
                  <Text>
                    💧 Humidity: {sensorDataMap[item.sensorID].Humidity}%
                  </Text>
                  <Text>
                    🪴 Soil: {sensorDataMap[item.sensorID].SoilMoisture}
                  </Text>
                </View>
              )}

              <Pressable
                style={styles.cameraButton}
                onPress={() => {
                  setSelectedPlant(item);
                  setModalVisible(true);
                }}
              >
                <Ionicons name="camera" size={24} color="white" />
              </Pressable>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} animationType="slide">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalContainer}
          >
            <Text style={styles.modalTitle}>Report a Problem</Text>
            <Text style={{ marginBottom: 10, fontSize: 16 }}>
              Plant: {selectedPlant?.name}
            </Text>

            <Button
              title="📸 Take a photo"
              onPress={async () => {
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 1,
                });

                if (!result.canceled) {
                  setImageUri(result.assets[0].uri);
                }
              }}
            />

            <View style={{ height: 10 }} />

            <Button
              title="🖼️ Pick from gallery"
              onPress={async () => {
                const result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  quality: 1,
                });

                if (!result.canceled) {
                  setImageUri(result.assets[0].uri);
                }
              }}
            />

            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={{ width: 200, height: 200, marginTop: 10 }}
              />
            )}

            <TextInput
              placeholder="Describe the issue..."
              value={problemText}
              onChangeText={setProblemText}
              onSubmitEditing={Keyboard.dismiss}
              blurOnSubmit={true}
              style={styles.textArea}
              multiline
            />

            {loadingDiagnosis && (
              <ActivityIndicator
                size="large"
                color="#4CAF50"
                style={{ marginTop: 20 }}
              />
            )}

            <Button
              title="Submit"
              onPress={handleSubmitProblem}
              disabled={loadingDiagnosis}
            />
            <Button
              title="Cancel"
              color="red"
              onPress={() => setModalVisible(false)}
              disabled={loadingDiagnosis}
            />
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
  newPlant: {
    fontSize: 16,
    color: 'blue',
    fontWeight: '600',
  },
  empty: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    color: '#aaa',
  },
  plantItem: {
    backgroundColor: '#e0ffe0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    position: 'relative',
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deviceId: {
    fontSize: 14,
    color: '#555',
  },
  cameraButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 10,
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textArea: {
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    textAlignVertical: 'top',
  },
});
