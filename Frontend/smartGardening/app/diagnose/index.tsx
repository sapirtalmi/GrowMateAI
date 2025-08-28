import {
  View,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Modal,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  FlatList,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import Header from '../components/header';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Text,
  TextInput,
  Button,
  Card,
  Chip,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLocalSearchParams } from 'expo-router';

export default function DiagnoseScreen() {
  const params = useLocalSearchParams();
  const [title, setTitle] = useState('');
  const [plantName, setPlantName] = useState(() => {
    // Prefill from query param if available
    return typeof params.prefillPlantName === 'string' ? params.prefillPlantName : '';
  });
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState('private');
  const [diagnosisModalVisible, setDiagnosisModalVisible] = useState(false);
  
  // New states for plant selection
  const [userPlants, setUserPlants] = useState<any[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<any>(null);
  const [showPlantSelector, setShowPlantSelector] = useState(false);
  const [plantsLoading, setPlantsLoading] = useState(true); // Start with loading true
  const [sensorID, setSensorID] = useState<string>('');
  
  // Animation for the modal
  const modalAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (diagnosisModalVisible) {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(modalAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [diagnosisModalVisible, backdropAnim, modalAnim]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ base64: false });
    if (!result.canceled && result.assets?.length) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({ base64: false });
    if (!result.canceled && result.assets?.length) {
      setImage(result.assets[0].uri);
    }
  };

  const diagnoseAndPost = async () => {
    try {
      setLoading(true);
      setDiagnosis(null);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Missing token');
      if (!image) return Alert.alert('Upload required', 'Please upload or take a photo.');

      const base64Img = await FileSystem.readAsStringAsync(image, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const res = await axios.post(
        'https://smartgardeningfunctions.azurewebsites.net/api/plantdiagnosis',
        {
          plantType: plantName,
          complaint: content,
          imageBase64: base64Img,
          sensorID: sensorID || null, // Include sensorID if available
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = res.data;
      
      // Store structured diagnosis data
      const diagnosisData = {
        problem: result.problem,
        severity: result.severity,
        suggestions: result.suggestions || [],
        isHealthy: result.problem === 'none',
        plantType: plantName,
        originalImage: image,
        sensorID: sensorID || null, // Include sensorID
        selectedPlant: selectedPlant,
      };
      
      setDiagnosis(diagnosisData);
      setDiagnosisModalVisible(true); // Show the modal instead of plain text

      const diagnosisText =
        result.problem === 'none'
          ? 'Your plant looks healthy!'
          : `Problem: ${result.problem}\nSeverity: ${result.severity}\nSuggestions:\n- ${result.suggestions.join('\n- ')}`;

      await axios.post(
        'https://smartgardeningfunctions.azurewebsites.net/api/createCommunityPost',
        {
          title,
          plantName,
          content: `${content}\n\nDiagnosis:\n${diagnosisText}`,
          visibility,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Don't clear form immediately, let user see results first
    } catch (err: any) {
      console.error('Error:', err.response?.data || err.message);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const closeDiagnosisModal = () => {
    setDiagnosisModalVisible(false);
    // Clear form after showing results
    setTimeout(() => {
      setTitle('');
      setPlantName('');
      setContent('');
      setImage(null);
      setDiagnosis(null);
      setSelectedPlant(null);
      setSensorID('');
    }, 300);
  };

  // Fetch user plants
  const fetchUserPlants = async () => {
    try {
      setPlantsLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found');
        return;
      }

      console.log('Fetching user plants...');
      const response = await fetch('https://smartgardeningfunctions.azurewebsites.net/api/getuserplants', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Plants data received:', data);
        
        // Handle different possible response formats
        let plantsArray = [];
        if (data && Array.isArray(data.plants)) {
          // API returns {"plants": [...]}
          plantsArray = data.plants;
        } else if (Array.isArray(data)) {
          // API returns [...]
          plantsArray = data;
        } else {
          console.log('Unexpected data format:', typeof data, data);
          plantsArray = [];
        }
        
        console.log('Setting plants array:', plantsArray);
        setUserPlants(plantsArray);
      } else {
        console.error('Failed to fetch plants. Status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setUserPlants([]);
      }
    } catch (error) {
      console.error('Error fetching user plants:', error);
      setUserPlants([]);
    } finally {
      setPlantsLoading(false);
    }
  };

  // Fetch plants on component mount
  useEffect(() => {
    fetchUserPlants();
  }, []);

  // Handle plant selection from user's collection
  const handlePlantSelection = (plant: any) => {
    setSelectedPlant(plant);
    setPlantName(plant.plant_type || plant.nickname || '');
    setSensorID(plant.sensorID || '');
    setShowPlantSelector(false);
  };

  // Clear plant selection
  const clearPlantSelection = () => {
    setSelectedPlant(null);
    setPlantName('');
    setSensorID('');
  };

  return (
    <View style={styles.container}>
      <Header title="Plant Diagnosis" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <Icon name="brain" size={32} color="#fff" />
            </View>
            <Text variant="headlineSmall" style={styles.pageTitle}>
              AI Plant Diagnosis
            </Text>
            <Text style={styles.subtitle}>
              Upload a photo and get instant plant health analysis
            </Text>
          </View>

          {/* Form Card */}
          <Card style={styles.formCard}>
            <Card.Content style={styles.cardContent}>
              <TextInput 
                label="Title" 
                value={title} 
                onChangeText={setTitle} 
                mode="outlined" 
                style={styles.input}
                left={<TextInput.Icon icon="format-title" />}
              />
              
              <TextInput
                label="Plant Name" 
                value={plantName} 
                onChangeText={(text) => {
                  setPlantName(text);
                  // Clear selection if user types manually
                  if (selectedPlant) {
                    setSelectedPlant(null);
                    setSensorID('');
                  }
                }} 
                mode="outlined" 
                style={styles.input}
                left={<TextInput.Icon icon="leaf" />}
                right={selectedPlant ? (
                  <TextInput.Icon 
                    icon="close-circle" 
                    onPress={clearPlantSelection}
                  />
                ) : undefined}
              />

              {/* Plant Selection Section */}
              <View style={styles.plantSelectionSection}>
                <View style={styles.orDivider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.orText}>Or choose from your plants</Text>
                  <View style={styles.dividerLine} />
                </View>
                
                <TouchableOpacity 
                  style={styles.showPlantsButton}
                  onPress={() => setShowPlantSelector(!showPlantSelector)}
                  disabled={plantsLoading}
                >
                  <Icon name="format-list-bulleted" size={20} color="#4caf50" />
                  <Text style={styles.showPlantsButtonText}>
                    {plantsLoading 
                      ? 'Loading...' 
                      : `My Plants (${Array.isArray(userPlants) ? userPlants.length : 0})`
                    }
                  </Text>
                  <Icon 
                    name={showPlantSelector ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#4caf50" 
                  />
                </TouchableOpacity>

                {showPlantSelector && (
                  <View style={styles.plantsContainer}>
                    {!userPlants || userPlants.length === 0 ? (
                      <View style={styles.noPlantsContainer}>
                        <Icon name="leaf-off" size={32} color="#bdbdbd" />
                        <Text style={styles.noPlantsText}>
                          {plantsLoading ? 'Loading plants...' : 'No plants found'}
                        </Text>
                        <Text style={styles.noPlantsSubtext}>
                          {plantsLoading ? 'Please wait...' : 'Add plants to your collection first'}
                        </Text>
                      </View>
                    ) : (
                      <FlatList
                        data={userPlants}
                        keyExtractor={(item: any) => item.sensorID || item.nickname || Math.random().toString()}
                        renderItem={({ item }: { item: any }) => (
                          <TouchableOpacity
                            style={[
                              styles.plantItem,
                              selectedPlant?.sensorID === item.sensorID && styles.selectedPlantItem
                            ]}
                            onPress={() => handlePlantSelection(item)}
                          >
                            <View style={styles.plantItemContent}>
                              <View style={styles.plantIconContainer}>
                                <Icon name="leaf" size={20} color="#4caf50" />
                              </View>
                              <View style={styles.plantInfo}>
                                <Text style={styles.plantNickname}>
                                  {item.nickname || 'Unnamed Plant'}
                                </Text>
                                <Text style={styles.plantType}>
                                  {item.plant_type || 'Unknown Type'}
                                </Text>
                                <Text style={styles.sensorIdText}>
                                  Sensor: {item.sensorID || 'No sensor'}
                                </Text>
                              </View>
                              {selectedPlant?.sensorID === item.sensorID && (
                                <Icon name="check-circle" size={20} color="#4caf50" />
                              )}
                            </View>
                          </TouchableOpacity>
                        )}
                        style={styles.plantsList}
                        scrollEnabled={false}
                      />
                    )}
                  </View>
                )}

                {selectedPlant && (
                  <View style={styles.selectedPlantBanner}>
                    <Icon name="check-circle" size={16} color="#4caf50" />
                    <Text style={styles.selectedPlantText}>
                      Selected: {selectedPlant.nickname} ({selectedPlant.plant_type})
                    </Text>
                  </View>
                )}
              </View>
              
              <TextInput 
                label="What's wrong with your plant?" 
                value={content} 
                onChangeText={setContent} 
                multiline 
                numberOfLines={3}
                mode="outlined" 
                style={styles.input}
                left={<TextInput.Icon icon="text" />}
              />
              
              <TextInput 
                label="Post Visibility" 
                value={visibility} 
                onChangeText={setVisibility} 
                mode="outlined" 
                style={styles.input}
                left={<TextInput.Icon icon="eye" />}
              />
            </Card.Content>
          </Card>

          {/* Image Section */}
          <Card style={styles.imageCard}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.sectionHeader}>
                <Icon name="camera-image" size={24} color="#4caf50" />
                <Text style={styles.sectionTitle}>Plant Photo</Text>
              </View>

              {image ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.image} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => setImage(null)}
                  >
                    <Icon name="close-circle" size={24} color="#ff5252" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="image-plus" size={48} color="#bdbdbd" />
                  <Text style={styles.placeholderText}>Add a photo of your plant</Text>
                </View>
              )}

              <View style={styles.buttonRow}>
                <Button 
                  icon="image" 
                  mode="outlined" 
                  onPress={pickImage} 
                  style={styles.imageButton}
                  contentStyle={styles.buttonContent}
                >
                  Gallery
                </Button>
                <Button 
                  icon="camera" 
                  mode="outlined" 
                  onPress={takePhoto} 
                  style={styles.imageButton}
                  contentStyle={styles.buttonContent}
                >
                  Camera
                </Button>
              </View>
            </Card.Content>
          </Card>

          {/* Diagnosis Button */}
          <Button
            icon="brain"
            mode="contained"
            onPress={diagnoseAndPost}
            disabled={loading || !image || !plantName || !content}
            style={styles.diagnoseButton}
            contentStyle={styles.diagnoseButtonContent}
            labelStyle={styles.diagnoseButtonLabel}
          >
            {loading ? 'Analyzing...' : 'Run AI Diagnosis'}
          </Button>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4caf50" />
              <Text style={styles.loadingText}>Analyzing your plant...</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Diagnosis Results Modal */}
      <Modal
        visible={diagnosisModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeDiagnosisModal}
      >
        <Animated.View 
          style={[
            styles.modalBackdrop,
            {
              opacity: backdropAnim,
            }
          ]}
        >
          <TouchableWithoutFeedback onPress={closeDiagnosisModal}>
            <View style={styles.modalBackdropTouch} />
          </TouchableWithoutFeedback>
          
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [
                  {
                    scale: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 1],
                    }),
                  },
                  {
                    translateY: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
                opacity: modalAnim,
              }
            ]}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {diagnosis && (
                <View style={styles.diagnosisContent}>
                  {/* Header */}
                  <View style={styles.modalHeader}>
                    <View style={[
                      styles.modalIconContainer,
                      { backgroundColor: diagnosis.isHealthy ? '#4caf50' : '#ff9800' }
                    ]}>
                      <Icon 
                        name={diagnosis.isHealthy ? "check-circle" : "alert-circle"} 
                        size={32} 
                        color="#fff" 
                      />
                    </View>
                    <Text style={styles.modalTitle}>
                      {diagnosis.isHealthy ? 'Plant is Healthy! 🌱' : 'Issue Detected 🔍'}
                    </Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={closeDiagnosisModal}
                    >
                      <Icon name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  {/* Plant Image */}
                  {diagnosis.originalImage && (
                    <Image 
                      source={{ uri: diagnosis.originalImage }} 
                      style={styles.modalImage} 
                    />
                  )}

                  {/* Results */}
                  <View style={styles.resultsSection}>
                    <Text style={styles.plantTypeText}>
                      <Icon name="leaf" size={16} color="#4caf50" /> {diagnosis.plantType}
                    </Text>

                    {diagnosis.sensorID && (
                      <Text style={styles.sensorIdText}>
                        <Icon name="wifi" size={14} color="#666" /> Sensor: {diagnosis.sensorID}
                      </Text>
                    )}

                    {diagnosis.selectedPlant && (
                      <Text style={styles.plantNickname}>
                        &ldquo;{diagnosis.selectedPlant.nickname}&rdquo;
                      </Text>
                    )}

                    {!diagnosis.isHealthy ? (
                      <>
                        <View style={styles.problemCard}>
                          <Text style={styles.problemLabel}>Problem Identified:</Text>
                          <Text style={styles.problemText}>{diagnosis.problem}</Text>
                        </View>

                        {diagnosis.severity && (
                          <View style={styles.severityContainer}>
                            <Text style={styles.severityLabel}>Severity:</Text>
                            <Chip 
                              mode="outlined"
                              style={[
                                styles.severityChip,
                                { 
                                  backgroundColor: diagnosis.severity.toLowerCase().includes('high') ? '#ffebee' : 
                                                 diagnosis.severity.toLowerCase().includes('medium') ? '#fff3e0' : '#e8f5e8'
                                }
                              ]}
                              textStyle={[
                                styles.severityChipText,
                                { 
                                  color: diagnosis.severity.toLowerCase().includes('high') ? '#d32f2f' : 
                                        diagnosis.severity.toLowerCase().includes('medium') ? '#f57c00' : '#388e3c'
                                }
                              ]}
                            >
                              {diagnosis.severity}
                            </Chip>
                          </View>
                        )}

                        {diagnosis.suggestions && diagnosis.suggestions.length > 0 && (
                          <View style={styles.suggestionsSection}>
                            <Text style={styles.suggestionsTitle}>
                              <Icon name="lightbulb-on" size={18} color="#ff9800" /> Recommendations:
                            </Text>
                            {diagnosis.suggestions.map((suggestion: string, index: number) => (
                              <View key={index} style={styles.suggestionItem}>
                                <Icon name="check" size={16} color="#4caf50" />
                                <Text style={styles.suggestionText}>{suggestion}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </>
                    ) : (
                      <View style={styles.healthyCard}>
                        <Icon name="heart" size={24} color="#4caf50" />
                        <Text style={styles.healthyText}>
                          Your plant appears to be in excellent health! Keep up the great care.
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.modalButtons}>
                    <Button
                      mode="contained"
                      onPress={closeDiagnosisModal}
                      style={styles.primaryButton}
                      contentStyle={styles.buttonContent}
                    >
                      Done
                    </Button>
                  </View>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f8fffe' 
  },
  
  // Main Content
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  
  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a5d1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  
  // Cards
  formCard: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageCard: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    padding: 16,
  },
  
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a5d1a',
    marginLeft: 8,
  },
  
  // Form Inputs
  input: { 
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  
  // Image Handling
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  image: { 
    width: '100%', 
    height: 200, 
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 4,
  },
  imagePlaceholder: {
    height: 150,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 16,
    color: '#bdbdbd',
    fontWeight: '500',
  },
  
  // Buttons
  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 12,
  },
  imageButton: { 
    flex: 1,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  diagnoseButton: {
    marginTop: 8,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  diagnoseButtonContent: {
    paddingVertical: 12,
  },
  diagnoseButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Loading
  loadingContainer: {
    alignItems: 'center',
    marginTop: 24,
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4caf50',
    fontWeight: '500',
  },
  
  // Modal Styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdropTouch: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    maxHeight: '80%',
  },
  
  // Modal Content
  diagnosisContent: {
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1a5d1a',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  
  modalImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
  },
  
  resultsSection: {
    padding: 20,
  },
  plantTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4caf50',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  // Problem Display
  problemCard: {
    backgroundColor: '#fff3e0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  problemLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 4,
  },
  problemText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f57c00',
  },
  
  // Severity
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  severityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  severityChip: {
    borderRadius: 16,
  },
  severityChipText: {
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Suggestions
  suggestionsSection: {
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingLeft: 8,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: '#555',
    lineHeight: 20,
    marginLeft: 8,
  },
  
  // Healthy Plant
  healthyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  healthyText: {
    flex: 1,
    fontSize: 16,
    color: '#2e7d32',
    marginLeft: 12,
    lineHeight: 22,
  },
  
  // Modal Buttons
  modalButtons: {
    padding: 20,
    paddingTop: 0,
  },
  primaryButton: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  // Plant Selector Modal
  plantSelectorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  plantSelectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  plantSelectorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a5d1a',
  },
  plantLoader: {
    marginTop: 16,
  },
  // Plant Selection Styles
  plantSelectionSection: {
    marginVertical: 16,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  orText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  showPlantsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  showPlantsButtonText: {
    fontSize: 16,
    color: '#4caf50',
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  plantsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 200,
  },
  noPlantsContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noPlantsText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
    marginTop: 8,
  },
  noPlantsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  plantsList: {
    maxHeight: 180,
  },
  plantItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedPlantItem: {
    backgroundColor: '#e8f5e8',
  },
  plantItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  plantIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e8f5e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  plantInfo: {
    flex: 1,
  },
  plantNickname: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  plantType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  sensorIdText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  selectedPlantBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  selectedPlantText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
    marginLeft: 8,
  },
});
