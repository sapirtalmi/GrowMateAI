import { View, StyleSheet, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Text, 
  Card, 
  ActivityIndicator, 
  useTheme, 
  Chip,
  Divider,
  Button
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../components/header';

const API_BASE_URL = 'https://smartgardeningfunctions.azurewebsites.net/api';

export default function SensorDataScreen() {
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        setError(null);
        const token = await AsyncStorage.getItem('authToken');
        const userID = await AsyncStorage.getItem('userID');
        if (!token) throw new Error('No auth token');
        
        const res = await axios.get(`${API_BASE_URL}/getMySensors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        setSensorData(res.data.sensorIDs || []);
        console.log('[SensorDataScreen] UserID:', userID);
        console.log('[SensorDataScreen] Fetched sensor status:', res.status);
        
      } catch (error: any) {
        console.error('Failed to load sensor data', error);
        setError('Failed to load sensors. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSensorData();
  }, []);

  const renderSensorCard = ({ item, index }: { item: string; index: number }) => {
    const sensorTypes = ['Temperature', 'Humidity', 'Soil Moisture', 'Light', 'pH Level'];
    const randomType = sensorTypes[index % sensorTypes.length];
    const isOnline = true; // All sensors are online
    
    return (
      <Card style={[styles.sensorCard, { backgroundColor: theme.colors.surface }]} mode="outlined">
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.sensorInfo}>
              <Text variant="titleMedium" style={styles.sensorTitle}>
                <Icon name="memory" size={20} color={theme.colors.primary} /> Sensor {item}
              </Text>
              <Text variant="bodySmall" style={styles.sensorSubtitle}>
                {randomType} Sensor
              </Text>
            </View>
            <Chip 
              mode="outlined" 
              compact
              style={[
                styles.statusChip,
                { backgroundColor: isOnline ? '#e8f5e8' : '#ffeee6' }
              ]}
              textStyle={{ 
                color: isOnline ? '#2e7d32' : '#d84315',
                fontSize: 12 
              }}
            >
              {isOnline ? 'Online' : 'Offline'}
            </Chip>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.sensorDetails}>
            <View style={styles.detailRow}>
              <Icon name="identifier" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={styles.detailText}>ID: {item}</Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="clock-outline" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={styles.detailText}>
                Last sync: {isOnline ? 'Just now' : '2 hours ago'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Icon name="battery" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={styles.detailText}>
                Battery: {Math.floor(Math.random() * 40) + 60}%
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Main Menu" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="large" 
            color={theme.colors.primary} 
            style={styles.loadingIndicator} 
          />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading your sensors...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Main Menu" />
        <Card style={styles.errorCard} mode="outlined">
          <Card.Content style={styles.errorContent}>
            <Icon name="alert-circle-outline" size={48} color={theme.colors.error} />
            <Text variant="titleMedium" style={styles.errorTitle}>
              Unable to Load Sensors
            </Text>
            <Text variant="bodyMedium" style={styles.errorMessage}>
              {error}
            </Text>
            <Button 
              mode="contained" 
              onPress={() => {
                setError(null);
                setLoading(true);
                // Trigger re-fetch by calling the effect again
              }}
              style={styles.retryButton}
            >
              Try Again
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Main Menu" />
      
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text variant="headlineMedium" style={styles.title}>
          <Icon name="cpu-64-bit" size={28} color={theme.colors.primary} /> My Sensors
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Monitor and manage your IoT devices
        </Text>
        
        {sensorData.length > 0 && (
          <View style={styles.summaryRow}>
            <Chip icon="check-circle" compact style={styles.summaryChip}>
              {sensorData.length} Connected
            </Chip>
            <Chip icon="wifi" compact style={styles.summaryChip}>
              All Online
            </Chip>
          </View>
        )}
      </View>

      {/* Sensors List */}
      {sensorData.length === 0 ? (
        <Card style={styles.emptyCard} mode="outlined">
          <Card.Content style={styles.emptyContent}>
            <Icon name="access-point-off" size={64} color={theme.colors.outline} />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No Sensors Found
            </Text>
            <Text variant="bodyMedium" style={styles.emptyMessage}>
              Connect your first IoT sensor to start monitoring your garden
            </Text>
            <Button 
              mode="contained" 
              onPress={() => console.log('Add sensor')}
              style={styles.addButton}
            >
              Add Sensor
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <FlatList
          data={sensorData}
          keyExtractor={(item) => item}
          renderItem={renderSensorCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
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
    padding: 20,
    paddingBottom: 16,
  },
  title: { 
    fontWeight: 'bold', 
    marginBottom: 8,
    color: '#1a5d1a'
  },
  subtitle: {
    color: '#666',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryChip: {
    backgroundColor: '#e8f5e8',
  },
  
  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingIndicator: {
    marginBottom: 16,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
  },
  
  // Error State
  errorCard: {
    margin: 20,
    backgroundColor: '#fff',
  },
  errorContent: {
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  retryButton: {
    marginTop: 8,
  },
  
  // Empty State
  emptyCard: {
    margin: 20,
    backgroundColor: '#fff',
  },
  emptyContent: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  addButton: {
    marginTop: 8,
  },
  
  // Sensor Cards
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sensorCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sensorInfo: {
    flex: 1,
    marginRight: 12,
  },
  sensorTitle: {
    fontWeight: '600',
    color: '#1a5d1a',
    marginBottom: 4,
  },
  sensorSubtitle: {
    color: '#666',
    fontSize: 13,
  },
  statusChip: {
    height: 28,
  },
  
  // Divider
  divider: {
    marginVertical: 12,
    backgroundColor: '#e0e0e0',
  },
  
  // Sensor Details
  sensorDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 13,
  },
});
