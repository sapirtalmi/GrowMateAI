import { useEffect, useState } from 'react';
import Header from '../components/header';
import {
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Card,
  Text,
  useTheme,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Plant = {
  name: string;
  sensorID: string;
  plant_type: string;
};

export default function PlantListScreen() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [sensorDataMap, setSensorDataMap] = useState<{ [sensorID: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) throw new Error('No token');

        const response = await axios.get(
          'https://smart-gardening-functions.azurewebsites.net/api/getuserplants',
          { headers: { Authorization: `Bearer ${token}` } }
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
              if (readings?.length > 0) {
                readings.sort((a: any, b: any) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
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
    return (
      <ActivityIndicator
        animating={true}
        size="large"
        style={{ marginTop: 50 }}
        color={theme.colors.primary}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Main Menu" />
      <Text variant="headlineMedium" style={styles.title}>
        <Icon name="sprout" size={26} /> My Plants
      </Text>

      {plants.length === 0 ? (
        <Text style={styles.empty}>No plants found.</Text>
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card} mode="contained">
              <Card.Title
                title={item.name}
                subtitle={`Sensor: ${item.sensorID}`}
                left={() => (
                  <View style={styles.iconLeft}>
                    <Icon name="leaf" size={28} color={theme.colors.primary} />
                  </View>
                )}
              />
              <Card.Content>
                <Text style={styles.label}>Type: {item.plant_type}</Text>

                {sensorDataMap[item.sensorID] && (
                  <View style={{ marginTop: 10 }}>
                    <View style={styles.row}>
                      <Icon name="thermometer" size={20} color="#555" />
                      <Text> Temp: {sensorDataMap[item.sensorID].Temperature}°C</Text>
                    </View>
                    <View style={styles.row}>
                      <Icon name="water-percent" size={20} color="#555" />
                      <Text> Humidity: {sensorDataMap[item.sensorID].Humidity}%</Text>
                    </View>
                    <View style={styles.row}>
                      <Icon name="water" size={20} color="#555" />
                      <Text> Soil: {sensorDataMap[item.sensorID].SoilMoisture}</Text>
                    </View>
                  </View>
                )}
              </Card.Content>
            </Card>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f6fff6' },
  title: { marginBottom: 20, textAlign: 'center' },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' },
  card: { marginBottom: 12, backgroundColor: '#e0ffe0' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  label: {
    marginBottom: 4,
    color: '#333',
  },
  iconLeft: {
    marginRight: 10,
  },
});
