import { useEffect, useState } from 'react';
import Header from '../components/header';

import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

type Plant = {
  name: string;
  sensorID: string;
  plant_type: string;
};

export default function PlantListScreen() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [sensorDataMap, setSensorDataMap] = useState<{ [sensorID: string]: any }>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) throw new Error('No token');

        const response = await axios.get(
          'https://smart-gardening-functions.azurewebsites.net/api/getuserplants',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const plantsFromAPI = response.data.plants || [];
        setPlants(plantsFromAPI);

        const sensorResults: { [sensorID: string]: any } = {};

        await Promise.all(
            plantsFromAPI.map(async (plant: Plant) => {
            try {
              const res = await axios.post(
                'https://smart-gardening-functions.azurewebsites.net/api/getsensorhistorybydeviceid',
                { sensorID: plant.sensorID },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );

              const readings = res.data.data;
              if (readings && readings.length > 0) {
                readings.sort(
                  (a: any, b: any) => new Date(b.Date).getTime() - new Date(a.Date).getTime()
                );
                sensorResults[plant.sensorID] = readings[0];
              }
            } catch {
              console.warn(`Sensor data missing for ${plant.sensorID}`);
            }
          })
        );

        setSensorDataMap(sensorResults);
      } catch (err) {
        console.error('Failed to load plants', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Header title="Main Menu" />
      <Text style={styles.title}>🪴 My Plants</Text>

      {plants.length === 0 ? (
        <Text style={styles.empty}>No plants found.</Text>
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
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  empty: { fontSize: 16, textAlign: 'center', marginTop: 40, color: '#888' },
  plantItem: {
    backgroundColor: '#e0ffe0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  plantName: { fontSize: 18, fontWeight: 'bold' },
  deviceId: { fontSize: 14, color: '#555' },
});
