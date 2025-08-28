import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import {
  Button,
  Text,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Header from '../components/header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import OptionSelector from './components/OptionSelector';


export default function PlanYourGardenScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    environment: '',
    sunDirection: '',
    sunlightHours: '',
    city: '',
    plantPreference: '',
    maintenanceLevel: '',
    scentPreference: '',
    colorPreference: '',
    placement: '',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const theme = useTheme();

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) throw new Error('Missing token');

      const res = await axios.post(
        'https://smartgardeningfunctions.azurewebsites.net/api/planyourgarden',
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setResult(res.data);

      // Immediately save the result to the database
      try {
        await axios.post(
          'https://smartgardeningfunctions.azurewebsites.net/api/savefuturegarden',
          { plan: res.data },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        console.log("Saved plan to database.");
      } catch (saveError) {
        console.error("Error saving plan:", saveError);
        alert("Plan generated but could not be saved.");
      }


    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Failed to generate garden plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Header title="Main Menu" />
        <View style={styles.iconHeader}>
          <Icon name="sprout" size={32} color={theme.colors.primary} />
          <Text variant="headlineMedium" style={styles.title}>
            Plan Your Garden
          </Text>
        </View>

        <OptionSelector
          label="Environment"
          options={['Balcony', 'Yard', 'Rooftop', 'Indoor']}
          value={form.environment}
          onSelect={(val) => handleChange('environment', val)}
        />

        <OptionSelector
          label="Sun Direction"
          options={['North', 'South', 'East', 'West']}
          value={form.sunDirection}
          onSelect={(val) => handleChange('sunDirection', val)}
        />

        <OptionSelector
          label="Sunlight Hours"
          options={['2–4', '4–6', '6–8', '8+']}
          value={form.sunlightHours}
          onSelect={(val) => handleChange('sunlightHours', val)}
        />

        <OptionSelector
          label="City"
          options={['Tel Aviv', 'Jerusalem', 'Haifa']}
          value={form.city}
          onSelect={(val) => handleChange('city', val)}
        />

        <OptionSelector
          label="Plant Preference"
          options={['Flowers', 'Trees', 'Herbs', 'Veggies']}
          value={form.plantPreference}
          onSelect={(val) => handleChange('plantPreference', val)}
        />

        <OptionSelector
          label="Maintenance Level"
          options={['Low', 'Medium', 'High']}
          value={form.maintenanceLevel}
          onSelect={(val) => handleChange('maintenanceLevel', val)}
        />

        <OptionSelector
          label="Scent Preference"
          options={['Scented', 'Non-scented']}
          value={form.scentPreference}
          onSelect={(val) => handleChange('scentPreference', val)}
        />

        <OptionSelector
          label="Color Preference"
          options={['Green', 'Colorful', 'Red', 'Purple']}
          value={form.colorPreference}
          onSelect={(val) => handleChange('colorPreference', val)}
        />

        <OptionSelector
          label="Placement"
          options={['Ground', 'Planter']}
          value={form.placement}
          onSelect={(val) => handleChange('placement', val)}
        />


        {loading ? (
          <ActivityIndicator animating={true} size="large" />
        ) : (
          <Button mode="contained" onPress={handleSubmit}>
            Generate Plan
          </Button>
        )}

        {result && (
          <View style={styles.resultContainer}>
            {/* Success Header */}
            <View style={styles.successHeader}>
              <View style={styles.successIconContainer}>
                <Icon name="check-circle" size={32} color="#fff" />
              </View>
              <View style={styles.successTextContainer}>
                <Text variant="headlineSmall" style={styles.successTitle}>
                  Garden Plan Ready!
                </Text>
                <Text style={styles.successSubtitle}>
                  Here&apos;s your personalized garden plan
                </Text>
              </View>
            </View>

            {/* Recommended Plants Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Icon name="leaf" size={24} color="#4caf50" />
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Recommended Plants
                </Text>
              </View>
              
              {result.plants?.map((plant: any, index: number) => (
                <View key={index} style={styles.modernPlantCard}>
                  <View style={styles.plantCardHeader}>
                    <View style={styles.plantIconContainer}>
                      <Icon name="flower" size={20} color="#fff" />
                    </View>
                    <View style={styles.plantNameContainer}>
                      <Text variant="titleMedium" style={styles.plantName}>
                        {plant.name}
                      </Text>
                      <Text style={styles.plantType}>
                        {plant.type}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.plantDetailsGrid}>
                    <View style={styles.plantDetailItem}>
                      <Icon name="earth" size={16} color="#8bc34a" />
                      <Text style={styles.plantDetailLabel}>Soil</Text>
                      <Text style={styles.plantDetailValue}>{plant.soil}</Text>
                    </View>
                    
                    <View style={styles.plantDetailItem}>
                      <Icon name="water-outline" size={16} color="#2196f3" />
                      <Text style={styles.plantDetailLabel}>Watering</Text>
                      <Text style={styles.plantDetailValue}>{plant.watering}</Text>
                    </View>
                    
                    <View style={styles.plantDetailItem}>
                      <Icon name="white-balance-sunny" size={16} color="#ff9800" />
                      <Text style={styles.plantDetailLabel}>Sunlight</Text>
                      <Text style={styles.plantDetailValue}>{plant.sunlightNeeds}</Text>
                    </View>
                    
                    <View style={styles.plantDetailItem}>
                      <Icon name="tools" size={16} color="#9c27b0" />
                      <Text style={styles.plantDetailLabel}>Maintenance</Text>
                      <Text style={styles.plantDetailValue}>{plant.maintenance}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Tips Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Icon name="lightbulb-on" size={24} color="#ff9800" />
                <Text variant="titleLarge" style={styles.sectionTitle}>
                  Expert Tips
                </Text>
              </View>
              
              <View style={styles.tipsContainer}>
                {result.additionalTips?.map((tip: string, i: number) => (
                  <View key={i} style={styles.tipCard}>
                    <View style={styles.tipIconContainer}>
                      <Icon name="check-circle" size={16} color="#4caf50" />
                    </View>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Action Button */}
            <View style={styles.actionContainer}>
              <Button
                icon="eye"
                mode="contained"
                style={styles.actionButton}
                contentStyle={styles.actionButtonContent}
                labelStyle={styles.actionButtonLabel}
                onPress={() => router.push('/plants/futureGardens')}
              >
                View All Saved Gardens
              </Button>
            </View>
          </View>
        )}


      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8fffe',
  },
  iconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
  },
  
  // Modern Result Container
  resultContainer: {
    marginTop: 30,
  },
  
  // Success Header
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  successIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  successTextContainer: {
    flex: 1,
  },
  successTitle: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4,
  },
  successSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  
  // Section Containers
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1a5d1a',
    marginLeft: 8,
  },
  
  // Modern Plant Cards
  modernPlantCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
  },
  plantCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  plantIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4caf50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  plantNameContainer: {
    flex: 1,
  },
  plantName: {
    fontWeight: '600',
    color: '#1a5d1a',
    marginBottom: 2,
  },
  plantType: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  
  // Plant Details Grid
  plantDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#f0f0f0',
    marginTop: 4,
  },
  plantDetailItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  plantDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    marginRight: 4,
    fontWeight: '500',
  },
  plantDetailValue: {
    fontSize: 12,
    color: '#1a5d1a',
    fontWeight: '600',
    flex: 1,
  },
  
  // Tips Section
  tipsContainer: {
    gap: 12,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff8e1',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tipIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  
  // Action Container
  actionContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  actionButton: {
    borderRadius: 12,
    elevation: 2,
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
  actionButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Legacy styles (keeping for compatibility)
  result: {
    marginTop: 30,
  },
  plantBox: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#e0ffe0',
    borderRadius: 8,
  },
});
