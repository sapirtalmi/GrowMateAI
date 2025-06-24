import React, { useEffect, useState } from 'react';
import { Modal, TouchableOpacity, FlatList, StyleSheet, View, Dimensions } from 'react-native';
import Header from '../components/header';
import {
  ActivityIndicator,
  Card,
  Text,
  useTheme,
  Button,
} from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';

const chartWidth = Math.min(Dimensions.get('window').width - 40, 350);
const chartHeight = 220;

type Plant = {
  nickname: string;
  sensorID: string;
  plant_type: string;
};

type SensorModalState = {
  visible: boolean;
  plant: Plant | null;
  sensorHistory: any[];
};

const API_BASE_URL = 'https://smartgardeningfunctions.azurewebsites.net/api';

export default function PlantListScreen() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [sensorDataMap, setSensorDataMap] = useState<{ [sensorID: string]: any }>({});
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const [sensorModal, setSensorModal] = useState<SensorModalState>({ visible: false, plant: null, sensorHistory: [] });
  const [activeTab, setActiveTab] = useState<'Temp' | 'Humidity' | 'Soil'>('Temp');
  const router = useRouter();

  // Fetch full sensor history for a plant
  const openSensorModal = async (plant: Plant) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const res = await axios.post(
        `${API_BASE_URL}/getsensorhistorybydeviceid`,
        { sensorID: plant.sensorID },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.info(`[PlantListScreen-MODAL] Sensor history fetched for ${plant.sensorID}:`, res.data.data);
      console.info(`[PlantListScreen-MODAL] Response status:`, res.status);
      const history = Array.isArray(res.data.data) ? res.data.data : [];
      setSensorModal({ visible: true, plant, sensorHistory: history });
      setActiveTab('Temp');
    } catch {
      setSensorModal({ visible: true, plant, sensorHistory: [] });
      setActiveTab('Temp');
    }
  };

  const closeSensorModal = () => setSensorModal({ visible: false, plant: null, sensorHistory: [] });

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        console.log('[PlantListScreen] Fetching auth token...');
        const token = await AsyncStorage.getItem('authToken');
        if (!token) throw new Error('No token');

        console.log('[PlantListScreen] Fetching user plants...');
        const response = await axios.get(
          `${API_BASE_URL}/getuserplants`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const plantsFromAPI = response.data.plants || [];
        console.log(`[PlantListScreen] Plants fetched:`, plantsFromAPI);
        setPlants(plantsFromAPI);

        const sensorResults: { [sensorID: string]: any } = {};

        await Promise.all(
          plantsFromAPI.map(async (plant: Plant) => {
            try {
              console.log(`[PlantListScreen] Fetching sensor data for plant:`, plant);
              const res = await axios.post(
                `${API_BASE_URL}/getsensorhistorybydeviceid`,
                { sensorID: plant.sensorID },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );
              console.log(`[PlantListScreen] Response status for sensor ${plant.sensorID}:`, res.status);
              if (res.status === 200) {
                console.log(`[PlantListScreen] 200 OK for sensor ${plant.sensorID}`);
              } else if (res.status === 400) {
                console.warn(`[PlantListScreen] 400 Bad Request for sensor ${plant.sensorID}`);
              } else if (res.status === 500) {
                console.error(`[PlantListScreen] 500 Server Error for sensor ${plant.sensorID}`);
              }
              const readings = res.data.data;
              console.log(`[PlantListScreen] Sensor readings for ${plant.sensorID}:`, readings);
              if (readings?.length > 0) {
                // The newest data is the last element
                sensorResults[plant.sensorID] = readings[readings.length - 1];
                console.log(`[PlantListScreen] Latest reading for ${plant.sensorID}:`, readings[readings.length - 1]);
              } else {
                console.warn(`[PlantListScreen] No readings found for sensor ${plant.sensorID}`);
              }
            } catch (err: any) {
              if (err.response) {
                console.error(`[PlantListScreen] Error response for sensor ${plant.sensorID}:`, err.response.status, err.response.data);
              } else {
                console.warn(`[PlantListScreen] Sensor data missing for ${plant.sensorID}`, err);
              }
            }
          })
        );

        console.log('[PlantListScreen] Final sensorResults:', sensorResults);
        setSensorDataMap(sensorResults);
      } catch (err) {
        console.error('[PlantListScreen] Failed to load plants', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator
          animating={true}
          size={64}
          color={theme.colors.primary}
          style={styles.loadingSpinner}
        />
        <Text style={styles.loadingText}>Loading Plants...</Text>
      </View>
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
        <>
          <FlatList
            data={plants}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity activeOpacity={0.8} onPress={() => openSensorModal(item)}>
                <Card style={styles.card} mode="contained">
                  <Card.Title
                    title={item.nickname}
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
              </TouchableOpacity>
            )}
          />

          {/* Sensor Data Modal */}
          <Modal
            visible={sensorModal.visible}
            animationType="fade"
            transparent={true}
            onRequestClose={closeSensorModal}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 18, width: chartWidth + 20, alignItems: 'center', elevation: 8 }}>
                {/* Plant and Sensor Details */}
                <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 4 }}>
                  {sensorModal.plant?.nickname || 'Plant'} Sensor Data
                </Text>
                <Text style={{ fontSize: 15, color: '#388e3c', marginBottom: 2 }}>
                  Type: {sensorModal.plant?.plant_type || '-'}
                </Text>
                <Text style={{ fontSize: 14, color: '#555', marginBottom: 10 }}>
                  Sensor: {sensorModal.plant?.sensorID || '-'}
                </Text>
                {/* Tab Buttons */}
                <View style={{ flexDirection: 'row', marginBottom: 12, gap: 8 }}>
                  <Button mode={activeTab === 'Temp' ? 'contained' : 'outlined'} onPress={() => setActiveTab('Temp')}>Temp</Button>
                  <Button mode={activeTab === 'Humidity' ? 'contained' : 'outlined'} onPress={() => setActiveTab('Humidity')}>Humidity</Button>
                  <Button mode={activeTab === 'Soil' ? 'contained' : 'outlined'} onPress={() => setActiveTab('Soil')}>Soil</Button>
                </View>
                {/* Chart */}
                {/* Chart logic for modal */}
                {(() => {
                  // Filter out zero/undefined values for the selected tab
                  const dataArr = sensorModal.sensorHistory
                    .map((d) =>
                      activeTab === 'Temp'
                        ? d.Temperature ?? d.temperature
                        : activeTab === 'Humidity'
                        ? d.Humidity ?? d.humidity
                        : d.SoilMoisture ?? d.soil ?? d.moisture
                    )
                    .filter((v) => v !== undefined && v !== null);
                  if (!dataArr.length) {
                    return <Text>No sensor data available.</Text>;
                  }
                  return (
                    <LineChart
                      data={{
                        labels: sensorModal.sensorHistory.map((d, i) => (i % 2 === 0 ? (d.Date || d.timestamp || '').slice(5) : '')),
                        datasets: [
                          {
                            data: dataArr,
                          },
                        ],
                      }}
                      width={chartWidth}
                      height={chartHeight}
                      yAxisSuffix={
                        activeTab === 'Temp' ? '°C' : activeTab === 'Humidity' ? '%' : ''
                      }
                      yAxisInterval={1}
                      chartConfig={{
                        backgroundColor: '#fff',
                        backgroundGradientFrom: '#f6fff6',
                        backgroundGradientTo: '#e0ffe0',
                        decimalPlaces: 1,
                        color: (opacity = 1) => `rgba(56, 142, 60, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                        style: { borderRadius: 12 },
                        propsForDots: { r: '4', strokeWidth: '2', stroke: '#388e3c' },
                      }}
                      bezier
                      fromZero
                      yLabelsOffset={8}
                      style={{ borderRadius: 12, marginBottom: 8 }}
                    />
                  );
                })()}
                <Button
                  mode="contained"
                  style={{ marginTop: 8, backgroundColor: '#388e3c' }}
                  onPress={() => {
                    closeSensorModal();
                    // Navigate to Diagnose page with plant type using Expo Router
                    router.push(`/diagnose?prefillPlantName=${encodeURIComponent(sensorModal.plant?.plant_type || '')}`);
                  }}
                >
                  Needs AI doctor
                </Button>
                <Button onPress={closeSensorModal} style={{ marginTop: 10 }}>Close</Button>

              </View>
            </View>
          </Modal>
        </>
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
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    marginVertical: 40,
    shadowColor: '#388e3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingSpinner: {
    marginBottom: 18,
    transform: [{ scale: 1.2 }],
  },
  loadingText: {
    color: '#388e3c',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
});
