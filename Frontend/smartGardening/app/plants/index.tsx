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
      <Header title="My Plants" />
      <View style={styles.headerSection}>
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <View style={styles.titleWithIcon}>
              <Icon name="sprout" size={26} color="#4caf50" />
              <Text variant="headlineMedium" style={styles.title}>My Plants</Text>
            </View>
            <Text style={styles.subtitle}>Manage and monitor your garden</Text>
          </View>
        </View>
      </View>

      {plants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="flower" size={64} color="#c8e6c9" />
          <Text style={styles.emptyTitle}>No plants yet</Text>
          <Text style={styles.emptySubtitle}>Start your garden journey by adding your first plant!</Text>
        </View>
      ) : (
        <View style={styles.plantsContainer}>
          <FlatList
            data={plants}
            keyExtractor={(_, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => openSensorModal(item)}
                style={styles.plantCardWrapper}
              >
                <Card style={styles.plantCard} mode="elevated">
                  <View style={styles.cardHeader}>
                    <View style={styles.plantIconContainer}>
                      <Icon name="leaf" size={24} color="#fff" />
                    </View>
                    <View style={styles.plantInfo}>
                      <Text style={styles.plantName}>{item.nickname}</Text>
                      <Text style={styles.plantType}>{item.plant_type}</Text>
                      <Text style={styles.sensorId}>Sensor: {item.sensorID}</Text>
                    </View>
                    <View style={styles.statusIndicator}>
                      <Icon 
                        name={sensorDataMap[item.sensorID] ? "check-circle" : "alert-circle"} 
                        size={20} 
                        color={sensorDataMap[item.sensorID] ? "#4caf50" : "#ff9800"} 
                      />
                    </View>
                  </View>
                  
                  {sensorDataMap[item.sensorID] && (
                    <View style={styles.sensorDataContainer}>
                      <View style={styles.sensorRow}>
                        <View style={styles.sensorItem}>
                          <Icon name="thermometer" size={16} color="#ff5722" />
                          <Text style={styles.sensorLabel}>Temp</Text>
                          <Text style={styles.sensorValue}>{sensorDataMap[item.sensorID].Temperature}°C</Text>
                        </View>
                        <View style={styles.sensorItem}>
                          <Icon name="water-percent" size={16} color="#2196f3" />
                          <Text style={styles.sensorLabel}>Humidity</Text>
                          <Text style={styles.sensorValue}>{sensorDataMap[item.sensorID].Humidity}%</Text>
                        </View>
                        <View style={styles.sensorItem}>
                          <Icon name="water" size={16} color="#4caf50" />
                          <Text style={styles.sensorLabel}>Soil</Text>
                          <Text style={styles.sensorValue}>{sensorDataMap[item.sensorID].SoilMoisture}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </Card>
              </TouchableOpacity>
            )}
          />
        </View>
      )}      {/* Sensor Data Modal */}
      {sensorModal.visible && (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fffe' 
  },
  
  // Header Section
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e8e8e8',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: { 
    fontWeight: '600',
    color: '#1a5d1a',
    letterSpacing: 0.3,
    fontSize: 24,
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a5d1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Plants Container
  plantsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  
  // Plant Cards
  plantCardWrapper: {
    marginBottom: 16,
  },
  plantCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  plantIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a5d1a',
    marginBottom: 2,
  },
  plantType: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '500',
    marginBottom: 2,
  },
  sensorId: {
    fontSize: 12,
    color: '#888',
  },
  statusIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Sensor Data
  sensorDataContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#f0f0f0',
    marginTop: 4,
  },
  sensorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
  },
  sensorItem: {
    alignItems: 'center',
    flex: 1,
  },
  sensorLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  sensorValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a5d1a',
    marginTop: 2,
  },
  
  // Loading
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    marginVertical: 40,
    marginHorizontal: 20,
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingSpinner: {
    marginBottom: 18,
    transform: [{ scale: 1.2 }],
  },
  loadingText: {
    color: '#4caf50',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  
  // Legacy styles (keeping for modal compatibility)
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
