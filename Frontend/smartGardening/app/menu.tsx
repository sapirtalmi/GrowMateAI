import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, TextInput, ActivityIndicator, Alert, TouchableOpacity, Animated, Easing, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from 'react-native-paper';
import Header from './components/header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const menuItems = [
  { title: 'Plan Your Garden', icon: 'shovel', route: '/plants/plan' },
  { title: 'My Plants', icon: 'leaf', route: '/plants' },
  { title: 'Add Plant', icon: 'plus-box', route: '/plants/modal' },
  { title: 'My GrowMates', icon: 'access-point', route: '/sensor' },
  { title: 'Diagnose Plant Problem', icon: 'brain', route: '/diagnose' },
  { title: 'Community', icon: 'account-group', route: '/community' },
  { title: 'Hazards', icon: 'alert-octagon', route: '/hazards' } ,
  { title: 'Add a GrowMate!', icon: 'wifi-plus', route: 'add-sensor-modal' }, // New menu item
  { title: 'Profile', icon: 'account', route: '/profile' },
  { title: 'Weather Forecast', icon: 'weather-sunny', route: '/weather' },];


export default function MenuScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = React.useState(false); // Second step modal
  const [firstStepVisible, setFirstStepVisible] = React.useState(false); // First step modal
  const [wifiName, setWifiName] = React.useState('');
  const [wifiPassword, setWifiPassword] = React.useState('');
  const [pairLoading, setPairLoading] = React.useState(false);
  const [notificationsVisible, setNotificationsVisible] = React.useState(false);
  const [notifications, setNotifications] = React.useState<string[]>([]);
  // First step state
  const [sensorID, setSensorID] = React.useState('');
  const [pairingKey, setPairingKey] = React.useState('');
  const [firstStepLoading, setFirstStepLoading] = React.useState(false);
  const [firstStepResult, setFirstStepResult] = React.useState<'success' | 'error' | null>(null);

  // Animation state for book-like transition
  const firstStepAnim = React.useRef(new Animated.Value(0)).current; // 0 = on screen, -width = off left
  const secondStepAnim = React.useRef(new Animated.Value(500)).current; // 500 = off right, 0 = on screen

  // Helper to animate to next step
  const goToSecondStep = () => {
    Animated.parallel([
      Animated.timing(firstStepAnim, {
        toValue: -500,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      }),
      Animated.timing(secondStepAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease),
      })
    ]).start(() => {
      setFirstStepVisible(false);
      setModalVisible(true);
      setFirstStepResult(null);
    });
  };

  // When opening first step, reset positions
  React.useEffect(() => {
    if (firstStepVisible) {
      firstStepAnim.setValue(0);
      secondStepAnim.setValue(500);
    }
  }, [firstStepVisible, firstStepAnim, secondStepAnim]);

  // Fetch notifications function (moved outside useEffect)
  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('https://smartgardeningfunctions.azurewebsites.net/api/checklastwatering', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []);
      } else {
        setNotifications(["Failed to fetch notifications."]);
      }
    } catch {
      setNotifications(["Error fetching notifications."]);
    }
  };

  const [currentWeather, setCurrentWeather] = React.useState<{
  icon: string;
  temp: number;
  condition: string;
} | null>(null);

React.useEffect(() => {
  const fetchWeather = async () => {
    try {
      const res = await fetch(
        'https://smart-gardening-functions.azurewebsites.net/api/getweatherforecast?city=Tel%20Aviv'
      );
      const data = await res.json();
      if (data?.current) {
        setCurrentWeather({
          icon: data.current.icon,
          temp: data.current.temp,
          condition: data.current.condition,
        });
      }
    } catch (err) {
      console.error('Weather fetch failed:', err);
    }
  };

  fetchWeather();
}, []);

  // Only fetch notifications once on mount, not on every render
  useEffect(() => {
    fetchNotifications();
  }, []);

  const handlePairSensor = async () => {
    setPairLoading(true);
    try {
      await fetch('http://192.168.4.1/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ssid: wifiName, password: wifiPassword, userID: await AsyncStorage.getItem('userID') }),
      });
      Alert.alert('Success', 'Sensor paired successfully!');
      setModalVisible(false);
      setWifiName('');
      setWifiPassword('');
    } catch {
      Alert.alert('Error', "Failed to pair sensor. Make sure you are connected to the sensor's WiFi.");
    } finally {
      setPairLoading(false);
    }
  };

  const renderMenuItem = ({ item, index }: { item: any; index: number }) => {
    const isAddSensor = item.route === 'add-sensor-modal';
    
    return (
      <TouchableOpacity
        style={styles.menuCard}
        onPress={() => {
          if (isAddSensor) {
            setFirstStepVisible(true);
          } else {
            router.push(item.route as any);
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Icon 
              name={item.icon} 
              size={28} 
              color="#fff" 
            />
          </View>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Main Menu" />
      
      {/* Header Section with Weather */}
      <View style={styles.headerSection}>
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Text variant="headlineMedium" style={styles.title}>
              Welcome to GrowMate<Text style={styles.aiFont}>AI</Text>
            </Text>
          </View>
          {currentWeather && (
            <View style={styles.weatherBox}>
              <Image
                source={{ uri: `https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png` }}
                style={styles.weatherIcon}
              />
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherText}>{currentWeather.temp}°</Text>
                <Text style={styles.weatherCondition}>{currentWeather.condition}</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notifications Card */}
        <TouchableOpacity 
          style={styles.notificationsCard} 
          onPress={() => setNotificationsVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.notificationContent}>
            <View style={styles.notificationLeft}>
              <Icon name="bell" size={28} color="#fff" />
              <View style={styles.notificationText}>
                <Text style={styles.notificationsTitle}>Notifications</Text>
                <Text style={styles.notificationsSubtitle}>Check your garden alerts</Text>
              </View>
            </View>
            <View style={styles.notificationsBadge}>
              <Text style={styles.notificationsBadgeText}>{notifications.length}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {menuItems.map((item, index) => (
            <View key={`${item.route}-${index}`} style={styles.menuItemContainer}>
              {renderMenuItem({ item, index })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Notifications Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={notificationsVisible}
        onShow={fetchNotifications}
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <View style={styles.notificationsOverlay}>
          <View style={styles.notificationsModal}>
            <Text style={styles.notificationsModalTitle}>Notifications</Text>
            <ScrollView style={{ maxHeight: 220, width: '100%' }}>
              {notifications.length === 0 ? (
                <Text style={styles.notificationText}>No notifications.</Text>
              ) : (
                notifications.map((note, idx) => (
                  <View key={idx} style={styles.notificationBox}>
                    <Text style={styles.notificationBoxText}>{note}</Text>
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={styles.notificationsCloseButton} onPress={() => setNotificationsVisible(false)}>
              <Text style={styles.notificationsCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* First Step Modal foa adding new sensor */}
      <Modal
        animationType="none"
        transparent={true}
        visible={firstStepVisible}
        onRequestClose={() => setFirstStepVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContainer, { transform: [{ translateX: firstStepAnim }] }]}> 
            <ScrollView>
              <Text style={styles.modalTitle}>Pair the sensor to your account</Text>
              <Text style={styles.instructions}>Identify the sensorID and the pairingKey on the box and enter here to validate:</Text>
              <TextInput
                style={styles.input}
                placeholder="Sensor ID"
                placeholderTextColor="#388e3c"
                value={sensorID}
                onChangeText={setSensorID}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Pairing Key"
                placeholderTextColor="#388e3c"
                value={pairingKey}
                onChangeText={setPairingKey}
                autoCapitalize="none"
              />
              {firstStepLoading ? (
                <View style={{ alignItems: 'center', marginVertical: 16 }}>
                  <ActivityIndicator size="large" color="#388e3c" />
                </View>
              ) : firstStepResult === 'success' ? (
                <View style={{ alignItems: 'center', marginVertical: 16 }}>
                  <Icon name="check-circle" size={48} color="#43a047" />
                  <Text style={{ color: '#43a047', fontWeight: 'bold', fontSize: 18, marginTop: 8 }}>Sensor validated!</Text>
                </View>
              ) : firstStepResult === 'error' ? (
                <View style={{ alignItems: 'center', marginVertical: 16 }}>
                  <Icon name="close-circle" size={48} color="#e53935" />
                  <Text style={{ color: '#e53935', fontWeight: 'bold', fontSize: 18, marginTop: 8 }}>Validation failed</Text>
                  <Text style={{ color: '#e53935', fontSize: 15, marginTop: 4 }}>Error has occurred, check your credentials</Text>
                </View>
              ) : null}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.pairButtonBox}
                  disabled={firstStepLoading}
                  onPress={async () => {
                    setFirstStepLoading(true);
                    setFirstStepResult(null);
                    try {
                      const userID = await AsyncStorage.getItem('userID');
                      const token = await AsyncStorage.getItem('authToken');
                      const response = await fetch('https://smartgardeningfunctions.azurewebsites.net/api/validnewsensor', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          ...(token ? { Authorization: `Bearer ${token}` } : {})
                        },
                        body: JSON.stringify({ sensorID, pairingKey, userID }),
                      });
                      if (response.ok) {
                        setFirstStepResult('success');
                        setFirstStepLoading(false);
                        // Wait for user to click 'Next' before moving to the second step
                      } else {
                        console.log('Validation failed:', response.status);
                        setFirstStepResult('error');
                        setFirstStepLoading(false);
                      }
                    } catch {
                      setFirstStepResult('error');
                      setTimeout(() => {
                        setFirstStepResult(null);
                        setFirstStepLoading(false);
                      }, 1200);
                    }
                  }}
                >
                  <Text style={styles.buttonText}>Validate Sensor</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButtonBox} onPress={() => setFirstStepVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
              {/* In the modal, add a Next button when firstStepResult === 'success' */}
              {firstStepResult === 'success' && (
                <TouchableOpacity
                  style={[styles.pairButtonBox, { marginTop: 12 }]}
                  onPress={goToSecondStep}
                >
                  <Text style={styles.buttonText}>Next</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Second Step Modal foa adding new sensorl */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContainer, { transform: [{ translateX: secondStepAnim }] }]}> 
            <ScrollView>
              <Text style={styles.modalTitle}>Add New Sensor</Text>
              <Text style={styles.instructions}>1. Find the credentials on the sensor box with the WiFi name and password.</Text>
              <Text style={styles.instructions}>2. Connect to the sensor&apos;s WiFi.</Text>
              <Text style={styles.instructions}>3. Enter a WiFi network (2.4GHz) near the sensor:</Text>
              <TextInput
                style={styles.input}
                placeholder="WiFi Name (SSID)"
                placeholderTextColor="#388e3c"
                value={wifiName}
                onChangeText={setWifiName}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="WiFi Password"
                placeholderTextColor="#388e3c"
                value={wifiPassword}
                onChangeText={setWifiPassword}
                secureTextEntry
              />
              <Text style={styles.instructions}>4. Click &quot;Pair Sensor&quot;</Text>
              {pairLoading ? (
                <ActivityIndicator size="large" color="#388e3c" />
              ) : (
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.pairButtonBox} onPress={handlePairSensor}>
                    <Text style={styles.buttonText}>Pair Sensor</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButtonBox} onPress={() => setModalVisible(false)}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  
  // Header Section
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 12, // Reduced from 16 to 12
    paddingBottom: 12, // Increased from 8 to 12 for balance
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e8e8e8', // Lighter border
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    marginRight: 8, // Add space between title and weather
  },
  title: {
    fontWeight: '600', // Reduced from 700 for less boldness
    color: '#1a5d1a',
    letterSpacing: 0.3, // Reduced from 0.5
    fontSize: 24, // Reduced from 28 to fit better
  },
  aiFont: {
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: '#ff9800',
    letterSpacing: 1.1,
  },
  
  // Weather
  weatherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    borderRadius: 12, // Reduced from 16 for more compact
    paddingHorizontal: 8, // Reduced from 12
    paddingVertical: 6, // Reduced from 8
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minWidth: 80, // Ensure minimum width
  },
  weatherIcon: {
    width: 28, // Reduced from 32
    height: 28, // Reduced from 32
    marginRight: 6, // Reduced from 8
  },
  weatherInfo: {
    alignItems: 'flex-start',
  },
  weatherText: {
    fontSize: 14, // Reduced from 16
    fontWeight: 'bold',
    color: '#1a5d1a',
    lineHeight: 16,
  },
  weatherCondition: {
    fontSize: 10, // Reduced from 12
    color: '#4caf50',
    lineHeight: 12,
  },
  
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 32, // Add more bottom padding for better scrolling
  },
  
  // Notifications Card
  notificationsCard: {
    backgroundColor: '#4caf50',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationText: {
    marginLeft: 16,
  },
  notificationsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  notificationsSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  notificationsBadge: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  notificationsBadgeText: {
    color: '#4caf50',
    fontWeight: 'bold',
    fontSize: 12,
  },
  
  // Menu Grid
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItemContainer: {
    width: '48%', // Each item takes roughly half the width
    marginBottom: 12, // Spacing between rows
  },
  menuCard: {
    backgroundColor: '#fafafa', // Light gray background for modern look
    borderRadius: 16, // Slightly smaller radius for modern look
    padding: 16, // Reduced padding for more compact cards
    elevation: 2, // Reduced elevation for subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    minHeight: 110, // Slightly reduced height
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
  },
  cardContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48, // Reduced from 56 to 48
    height: 48, // Reduced from 56 to 48
    borderRadius: 24, // Adjusted for new size
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8, // Reduced from 12 to 8
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 13, // Slightly reduced for better fit
    fontWeight: '600',
    color: '#1a5d1a',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 4, // Add some padding to prevent text cutoff
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  instructions: {
    marginBottom: 8,
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '600',
    fontFamily: 'System',
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#388e3c', // Green border for input
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    color: '#43a047', // Lighter green for input text
    fontWeight: 'bold',
    backgroundColor: '#fff', // White background for input
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  pairButtonBox: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#43a047',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  cancelButtonBox: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#ffb6c1',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 12,
  },
  
  // Notifications Modal Styles
  notificationsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationsModal: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    maxHeight: '70%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  notificationsModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a5d1a',
    textAlign: 'center',
    marginBottom: 20,
  },
  notificationBox: {
    backgroundColor: '#f1f8e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  notificationBoxText: {
    fontSize: 15,
    color: '#2e7d32',
    lineHeight: 20,
  },
  notificationsCloseButton: {
    backgroundColor: '#4caf50',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  notificationsCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
