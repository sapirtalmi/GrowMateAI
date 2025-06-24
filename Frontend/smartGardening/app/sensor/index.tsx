import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/header';

const API_BASE_URL = 'https://smartgardeningfunctions.azurewebsites.net/api';

export default function SensorDataScreen() {
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userID = await AsyncStorage.getItem('userID');
        if (!token) throw new Error('No auth token');
        const res = await axios.get(`${API_BASE_URL}/getMySensors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSensorData(res.data.sensorIDs || []);
        console.log('[SensorDataScreen] UserID:', userID);
        
        console.log('[SensorDataScreen] Fetched sensor status:', res.status);
        
      } catch (error) {
        console.error('Failed to load sensor data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSensorData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="green" style={styles.center} />;
  }

  return (
    <View style={styles.container}>
      <Header title="Main Menu" />
      <Text style={styles.title}>📡 My Sensors</Text>
      <FlatList
        data={sensorData}
        keyExtractor={(item) => item}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <View style={styles.circleItem}>
            <Text style={styles.circleText}>🔗{item}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  circleItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 8,
    backgroundColor: '#e0ffe0',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#388e3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  circleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#388e3c',
    textAlign: 'center',
    paddingHorizontal: 6,
  },
});
