import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SensorDataScreen() {
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const res = await axios.get('https://your-api.azurewebsites.net/api/getSensorHistory');
        setSensorData(res.data);
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
      <Text style={styles.title}>📡 Sensor Data</Text>
      <FlatList
        data={sensorData}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>📍 Plant: {item.plantID}</Text>
            <Text>🌡️ Temp: {item.temperature}°C</Text>
            <Text>💧 Moisture: {item.moisture}%</Text>
            <Text>🕒 {new Date(item.timestamp).toLocaleString()}</Text>
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
  item: { padding: 12, marginBottom: 10, backgroundColor: '#f2f2f2', borderRadius: 8 },
});
