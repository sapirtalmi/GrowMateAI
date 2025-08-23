import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import MapView, { Marker, Circle, Callout } from 'react-native-maps';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import Header from '../components/header';
import { getStoredLocation, UserLocation, calculateDistance } from '../utils/locationService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = 'https://smartgardeningfunctions.azurewebsites.net/api';

// Interface for hazard data
interface HazardData {
  _id: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  created_at: string;
  reported_by: string;
  distance_km: number;
}

// Initial map region centered on Tel Aviv
const INITIAL_REGION = {
  latitude: 32.0853,
  longitude: 34.7818,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

// Hazard types organized by categories
const HAZARD_TYPES = {
  weather: [
    { id: 'frost', label: 'Frost warning – sudden temperature drops damaging sensitive plants', icon: '❄️' },
    { id: 'heatwave', label: 'Heatwave / extreme heat – plants drying out, risk of sunburn', icon: '🔥' },
    { id: 'flooding', label: 'Heavy rain / flooding – risk of root rot, soil erosion, nutrient loss', icon: '🌊' },
    { id: 'wind', label: 'Strong winds / storm damage – plants knocked over, branches broken', icon: '💨' },
    { id: 'hail', label: 'Hail – physical damage to leaves, flowers, fruits', icon: '🧊' },
  ],
  plant: [
    { id: 'aphids', label: 'Aphid infestation – common pest spreading fast', icon: '🐛' },
    { id: 'whiteflies', label: 'Whiteflies / spider mites outbreak – harmful to many crops', icon: '🕷️' },
    { id: 'blight', label: 'Tomato blight / fungal disease – often spreads regionally', icon: '🍄' },
    { id: 'mildew', label: 'Powdery mildew – especially in humid conditions', icon: '☁️' },
    { id: 'weeds', label: 'Invasive weed outbreak – e.g., bindweed or parthenium', icon: '🌿' },
  ],
  environmental: [
    { id: 'pesticide', label: 'Pesticide spraying in area – warning to cover crops / stay safe', icon: '⚠️' },
    { id: 'water', label: 'Water shortage / restrictions – limited watering allowed', icon: '💧' },
    { id: 'pollution', label: 'Air pollution / wildfire smoke – risk for plant photosynthesis and health', icon: '😷' },
    { id: 'contamination', label: 'Soil contamination alert – if discovered in shared gardens or farms', icon: '☢️' },
  ],
  community: [
    { id: 'neighboring', label: 'Neighboring pest spread – someone nearby reports pests that can spread quickly', icon: '🏘️' },
    { id: 'other', label: 'Other', icon: '📝' },
  ],
};

// Radius options for the slider (in km)
const RADIUS_OPTIONS = [1, 2, 5, 10, 15, 40, 80];
const DEFAULT_RADIUS = 2;
const MAX_FETCH_RADIUS = 80;

export default function HazardsScreen() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [showCreateHazardModal, setShowCreateHazardModal] = useState(false);
  const [selectedCoordinate, setSelectedCoordinate] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedHazardType, setSelectedHazardType] = useState<string>('');
  const [hazardDescription, setHazardDescription] = useState<string>('');
  
  // New state for hazards and radius
  const [allHazards, setAllHazards] = useState<HazardData[]>([]);
  const [visibleHazards, setVisibleHazards] = useState<HazardData[]>([]);
  const [currentRadius, setCurrentRadius] = useState<number>(DEFAULT_RADIUS);
  const [isLoadingHazards, setIsLoadingHazards] = useState<boolean>(false);
  const [radiusSliderIndex, setRadiusSliderIndex] = useState<number>(1); // Default to 2km (index 1)

  useEffect(() => {
    // Load stored user location when component mounts
    const loadUserLocation = async () => {
      const location = await getStoredLocation();
      if (location) {
        setUserLocation(location);
        console.log('📍 Loaded user location for Hazards map:', location);
        // Fetch hazards once we have the user location
        await fetchHazards(location);
      }
    };
    
    loadUserLocation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Navigate to discussion page for a specific hazard
  const navigateToDiscussion = (hazard: HazardData) => {
    console.log('🔗 Navigating to discussion for hazard:', hazard._id, hazard.type);
    
    try {
      router.push({
        pathname: '/hazards/discussion',
        params: {
          id: hazard._id,
          type: hazard.type,
          description: hazard.description,
          latitude: hazard.latitude.toString(),
          longitude: hazard.longitude.toString(),
          created_at: hazard.created_at,
          reported_by: hazard.reported_by,
          distance_km: hazard.distance_km.toString(),
        },
      });
      console.log('✅ Navigation initiated successfully');
    } catch (error) {
      console.error('❌ Navigation error:', error);
      Alert.alert('Error', 'Failed to open discussion page');
    }
  };

  // Get emoji icon for hazard type
  const getHazardIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      frost: '❄️',
      heatwave: '🔥',
      flooding: '🌊',
      wind: '💨',
      hail: '🧊',
      aphids: '🐛',
      whiteflies: '🕷️',
      blight: '🍄',
      mildew: '☁️',
      weeds: '🌿',
      pesticide: '⚠️',
      water: '💧',
      pollution: '😷',
      contamination: '☢️',
      neighboring: '🏘️',
      other: '📝',
    };
    return iconMap[type] || '📝';
  };

  // Fetch hazards from backend API
  const fetchHazards = async (location: UserLocation) => {
    if (!location) return;
    
    setIsLoadingHazards(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/getHazards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          radius_km: MAX_FETCH_RADIUS, // Fetch all hazards within 80km
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🚨 Fetched hazards:', data);
        setAllHazards(data.hazards || []);
        // Filter hazards for default radius
        filterHazardsByRadius(data.hazards || [], DEFAULT_RADIUS, location);
      } else {
        console.error('❌ Failed to fetch hazards:', response.status);
        Alert.alert('Error', 'Failed to fetch hazards from server');
      }
    } catch (error) {
      console.error('❌ Error fetching hazards:', error);
      Alert.alert('Error', 'Network error while fetching hazards');
    } finally {
      setIsLoadingHazards(false);
    }
  };

  // Filter hazards based on current radius
  const filterHazardsByRadius = (hazards: HazardData[], radiusKm: number, location: UserLocation) => {
    const filtered = hazards.filter(hazard => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        hazard.latitude,
        hazard.longitude
      );
      return distance <= radiusKm;
    });
    console.log(`🔍 Filtered ${filtered.length} hazards within ${radiusKm}km radius`);
    setVisibleHazards(filtered);
  };

  // Handle radius change from slider
  const handleRadiusChange = (sliderIndex: number) => {
    const newRadius = RADIUS_OPTIONS[sliderIndex];
    setRadiusSliderIndex(sliderIndex);
    setCurrentRadius(newRadius);
    
    // Filter hazards with new radius
    if (userLocation && allHazards.length > 0) {
      filterHazardsByRadius(allHazards, newRadius, userLocation);
    }
  };

  // Handle map press to suggest creating new hazard
  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setSelectedCoordinate(coordinate);
    
    Alert.alert(
      'Create New Hazard',
      `Do you want to report a hazard at this location?\nCoordinates: ${coordinate.latitude.toFixed(4)}, ${coordinate.longitude.toFixed(4)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Create Hazard', 
          onPress: () => setShowCreateHazardModal(true)
        }
      ]
    );
  };

  // Handle hazard upload
  const handleUploadHazard = async () => {
    if (!selectedHazardType) {
      Alert.alert('Error', 'Please select a hazard type.');
      return;
    }
    
    if (!hazardDescription.trim()) {
      Alert.alert('Error', 'Please provide a description.');
      return;
    }

    if (!selectedCoordinate) {
      Alert.alert('Error', 'Invalid coordinates.');
      return;
    }

    try {
      // Get token and user data from AsyncStorage
      const token = await AsyncStorage.getItem('authToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const reportedBy = userData?.username || 'Anonymous';

      const hazardData = {
        type: selectedHazardType,
        description: hazardDescription,
        latitude: selectedCoordinate.latitude,
        longitude: selectedCoordinate.longitude,
        reported_by: reportedBy,
      };

      console.log('🚨 Creating new hazard:', hazardData);

      const response = await fetch(`${API_BASE_URL}/createHazard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(hazardData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Hazard created successfully:', result);
        
        // Refresh hazards list
        if (userLocation) {
          await fetchHazards(userLocation);
        }
        
        // Reset and close modal
        setShowCreateHazardModal(false);
        setSelectedHazardType('');
        setHazardDescription('');
        setSelectedCoordinate(null);
        
        Alert.alert('Success', 'Hazard reported successfully!');
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to create hazard:', errorData);
        Alert.alert('Error', errorData.error || 'Failed to report hazard');
      }
    } catch (error) {
      console.error('❌ Error creating hazard:', error);
      Alert.alert('Error', 'Network error while reporting hazard');
    }
  };

  // Determine initial region based on user location or default to Tel Aviv
  const initialRegion = userLocation ? {
    latitude: userLocation.latitude,
    longitude: userLocation.longitude,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  } : INITIAL_REGION;

  return (
    <View style={styles.container}>
      <Header title="Hazards" />
      
      <Text variant="headlineSmall" style={styles.title}>
        Environmental Hazards Map
      </Text>
      
      {/* Radius Control Slider - Moved to top */}
      <View style={styles.radiusContainer}>
        <Text style={styles.radiusTitle}>
          Filter Radius: {currentRadius}km
        </Text>
        <Text style={styles.radiusSubtitle}>
          Showing {visibleHazards.length} hazards within {currentRadius}km
        </Text>
        
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>1km</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={RADIUS_OPTIONS.length - 1}
            step={1}
            value={radiusSliderIndex}
            onValueChange={handleRadiusChange}
            minimumTrackTintColor="#388e3c"
            maximumTrackTintColor="#c8e6c9"
          />
          <Text style={styles.sliderLabel}>80km</Text>
        </View>
        
        {/* Radius markers */}
        <View style={styles.radiusMarkersContainer}>
          {RADIUS_OPTIONS.map((radius, index) => (
            <TouchableOpacity
              key={radius}
              style={[
                styles.radiusMarker,
                radiusSliderIndex === index && styles.activeRadiusMarker
              ]}
              onPress={() => handleRadiusChange(index)}
            >
              <Text
                style={[
                  styles.radiusMarkerText,
                  radiusSliderIndex === index && styles.activeRadiusMarkerText
                ]}
              >
                {radius}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation={false}
            showsMyLocationButton={false}
            mapType="standard"
            onPress={handleMapPress}
          >
          {/* User's current location marker (if available) */}
          {userLocation && (
            <>
              <Marker
                coordinate={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                }}
                title="Your Location"
                description="Current user position"
                pinColor="blue"
                stopPropagation={true}
              />
              
              {/* Radius circle around user location */}
              <Circle
                center={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                }}
                radius={currentRadius * 1000} // Convert km to meters
                strokeColor="rgba(0, 122, 255, 0.5)"
                fillColor="rgba(0, 122, 255, 0.1)"
                strokeWidth={2}
              />
            </>
          )}
          
          {/* Hazard markers */}
          {visibleHazards.map((hazard) => (
            <Marker
              key={hazard._id}
              coordinate={{
                latitude: hazard.latitude,
                longitude: hazard.longitude,
              }}
              pinColor="red"
              stopPropagation={true}
            >
              <Callout 
                style={styles.calloutContainer}
                onPress={() => navigateToDiscussion(hazard)}
              >
                <View style={styles.calloutContent}>
                  <View style={styles.calloutHeader}>
                    <Text style={styles.calloutIcon}>{getHazardIcon(hazard.type)}</Text>
                    <View style={styles.calloutInfo}>
                      <Text style={styles.calloutTitle}>
                        {hazard.type.charAt(0).toUpperCase() + hazard.type.slice(1)}
                      </Text>
                      <Text style={styles.calloutDistance}>
                        📍 {hazard.distance_km.toFixed(1)}km away
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.calloutDescription} numberOfLines={2}>
                    {hazard.description}
                  </Text>
                  <View style={styles.discussionButton}>
                    <Icon name="forum" size={16} color="#fff" />
                    <Text style={styles.discussionButtonText}>See Discussion</Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
        
        {/* Loading overlay */}
        {isLoadingHazards && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#388e3c" />
            <Text style={styles.loadingText}>Loading hazards...</Text>
          </View>
        )}
      </View>
      
      {/* Info Container */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          📍 {userLocation ? `Map centered on your location` : `Map centered on Tel Aviv (default)`}
        </Text>
        <Text style={styles.infoText}>
          🔵 Blue marker shows your current location with {currentRadius}km radius circle
        </Text>
        <Text style={styles.infoText}>
          🔴 Red markers show hazards within the selected radius
        </Text>
        <Text style={styles.infoText}>
          📌 Tap on empty areas of the map to report a new hazard
        </Text>
        <Text style={styles.infoText}>
          💬 Tap on hazard markers and press &quot;See Discussion&quot; to join the conversation
        </Text>
        {userLocation && (
          <Text style={styles.coordText}>
            Your coordinates: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
        )}
      </View>
      </ScrollView>

      {/* Create Hazard Modal */}
      <Modal
        visible={showCreateHazardModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateHazardModal(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report New Hazard</Text>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setShowCreateHazardModal(false)}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedCoordinate && (
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>
                  📍 Location: {selectedCoordinate.latitude.toFixed(4)}, {selectedCoordinate.longitude.toFixed(4)}
                </Text>
              </View>
            )}

            {/* Weather-related Hazards */}
            <Text style={styles.categoryTitle}>🌦 Weather-related Hazards</Text>
            {HAZARD_TYPES.weather.map((hazard) => (
              <TouchableOpacity
                key={hazard.id}
                style={[
                  styles.hazardOption,
                  selectedHazardType === hazard.id && styles.selectedHazardOption
                ]}
                onPress={() => setSelectedHazardType(hazard.id)}
              >
                <Text style={styles.hazardIcon}>{hazard.icon}</Text>
                <Text style={styles.hazardLabel}>{hazard.label}</Text>
              </TouchableOpacity>
            ))}

            {/* Plant & Pest Hazards */}
            <Text style={styles.categoryTitle}>🌱 Plant & Pest Hazards</Text>
            {HAZARD_TYPES.plant.map((hazard) => (
              <TouchableOpacity
                key={hazard.id}
                style={[
                  styles.hazardOption,
                  selectedHazardType === hazard.id && styles.selectedHazardOption
                ]}
                onPress={() => setSelectedHazardType(hazard.id)}
              >
                <Text style={styles.hazardIcon}>{hazard.icon}</Text>
                <Text style={styles.hazardLabel}>{hazard.label}</Text>
              </TouchableOpacity>
            ))}

            {/* Environmental Hazards */}
            <Text style={styles.categoryTitle}>🛑 Environmental Hazards</Text>
            {HAZARD_TYPES.environmental.map((hazard) => (
              <TouchableOpacity
                key={hazard.id}
                style={[
                  styles.hazardOption,
                  selectedHazardType === hazard.id && styles.selectedHazardOption
                ]}
                onPress={() => setSelectedHazardType(hazard.id)}
              >
                <Text style={styles.hazardIcon}>{hazard.icon}</Text>
                <Text style={styles.hazardLabel}>{hazard.label}</Text>
              </TouchableOpacity>
            ))}

            {/* Community Alerts */}
            <Text style={styles.categoryTitle}>👥 Community Alerts</Text>
            {HAZARD_TYPES.community.map((hazard) => (
              <TouchableOpacity
                key={hazard.id}
                style={[
                  styles.hazardOption,
                  selectedHazardType === hazard.id && styles.selectedHazardOption
                ]}
                onPress={() => setSelectedHazardType(hazard.id)}
              >
                <Text style={styles.hazardIcon}>{hazard.icon}</Text>
                <Text style={styles.hazardLabel}>{hazard.label}</Text>
              </TouchableOpacity>
            ))}

            {/* Description Input */}
            <Text style={styles.descriptionTitle}>Description</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Provide details about the hazard..."
              placeholderTextColor="#999"
              value={hazardDescription}
              onChangeText={setHazardDescription}
              multiline
              numberOfLines={4}
              mode="outlined"
            />

            {/* Upload Button */}
            <Button
              mode="contained"
              onPress={handleUploadHazard}
              style={styles.uploadButton}
              contentStyle={styles.uploadButtonContent}
            >
              Upload
            </Button>

            <View style={styles.modalSpacer} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fff6',
  },
  title: {
    marginVertical: 8,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#2e7d32',
    paddingHorizontal: 16,
  },
  // Scroll container styles
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mapContainer: {
    height: '70%', // 70% of available screen space
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    minHeight: 400, // Minimum height to ensure usability
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  infoContainer: {
    backgroundColor: '#e0f5e9',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#388e3c',
  },
  infoText: {
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 3,
    fontWeight: '500',
  },
  coordText: {
    fontSize: 14,
    color: '#1976d2',
    marginTop: 8,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalScrollView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  closeButton: {
    padding: 8,
  },
  locationInfo: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  locationText: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  hazardOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedHazardOption: {
    backgroundColor: '#e8f5e8',
    borderColor: '#388e3c',
  },
  hazardIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
    textAlign: 'center',
  },
  hazardLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  descriptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  descriptionInput: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  uploadButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#388e3c',
  },
  uploadButtonContent: {
    paddingVertical: 8,
  },
  modalSpacer: {
    height: 32,
  },
  // Loading overlay styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#388e3c',
    fontWeight: '600',
  },
  // Radius control styles
  radiusContainer: {
    backgroundColor: '#e8f5e8',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#388e3c',
  },
  radiusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 2,
  },
  radiusSubtitle: {
    fontSize: 12,
    color: '#388e3c',
    textAlign: 'center',
    marginBottom: 12,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  radiusMarkersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radiusMarker: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#c8e6c9',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 32,
    alignItems: 'center',
  },
  activeRadiusMarker: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  radiusMarkerText: {
    fontSize: 12,
    color: '#388e3c',
    fontWeight: '600',
  },
  activeRadiusMarkerText: {
    color: '#fff',
  },
  // Callout styles
  calloutContainer: {
    width: 250,
    minHeight: 120,
  },
  calloutContent: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  calloutIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  calloutInfo: {
    flex: 1,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 2,
  },
  calloutDistance: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '600',
  },
  calloutDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
    marginBottom: 12,
  },
  discussionButton: {
    backgroundColor: '#388e3c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  discussionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
