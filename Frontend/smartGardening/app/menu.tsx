import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Modal, TextInput, ActivityIndicator, Alert, TouchableOpacity, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Text } from 'react-native-paper';
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
  { title: 'Hazards', icon: 'alert-octagon', route: '/hazards' },
  { title: 'Settings', icon: 'cog', route: '/settings' },
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Main Menu" />
      <Text variant="headlineMedium" style={styles.title}>GrowMateAI Menu</Text>

      {/* Notifications slot */}
      <Card style={styles.notificationsCard} onPress={() => setNotificationsVisible(true)}>
        <Card.Title
          title={
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.notificationsTitle}>Notifications</Text>
              <View style={styles.notificationsBadge}>
                <Text style={styles.notificationsBadgeText}>{notifications.length}</Text>
              </View>
            </View>
          }
          left={(props) => <Icon name="bell" size={28} color="#fff" style={{ marginRight: 10 }} />}
        />
      </Card>

      {/* Other menu items */}
      {menuItems.map(({ title, icon, route }) => (
        route === 'add-sensor-modal' ? (
          <Card
            key={route}
            style={styles.card}
            onPress={() => setFirstStepVisible(true)}
          >
            <Card.Title
              title={title}
              left={(props) => <Icon name={icon} size={28} color="#388e3c" style={{ marginRight: 10 }} />}
            />
          </Card>
        ) : (
          <Card
            key={route}
            style={styles.card}
            onPress={() => router.push(route as any)}
          >
            <Card.Title
              title={title}
              left={(props) => <Icon name={icon} size={28} color="#388e3c" style={{ marginRight: 10 }} />}
            />
          </Card>
        )
      ))}

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f6fff6',
  },
  title: {
    marginVertical: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#e0f5e9', 
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
  // Add styles for notifications
  notificationsCard: {
    marginBottom: 16,
    backgroundColor: '#388e3c',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#fff176',
    elevation: 4,
  },
  notificationsTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  notificationsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationsModal: {
    width: '85%',
    backgroundColor: '#fffde7',
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  notificationsModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#388e3c',
    marginBottom: 18,
  },
  notificationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    paddingLeft: 4,
  },
  notificationsCloseButton: {
    marginTop: 18,
    backgroundColor: '#388e3c',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  notificationsCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Add styles for the badge
  notificationsBadge: {
    marginLeft: 10,
    backgroundColor: '#fff176',
    borderRadius: 10,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  notificationsBadgeText: {
    color: '#388e3c',
    fontWeight: 'bold',
    fontSize: 15,
  },
  notificationBox: {
    backgroundColor: '#e0f5e9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#388e3c',
    shadowColor: '#388e3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
    width: '100%',
  },
  notificationBoxText: {
    color: '#2e7d32',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  aiFont: {
    fontFamily: 'System', // fallback if custom font not available
    fontStyle: 'italic',
    fontWeight: 'bold',
    color: '#ff9800', // orange for AI
    letterSpacing: 1.1,
  },
});
