import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  ActivityIndicator,
  useTheme,
  Divider,
  IconButton,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Header from '../components/header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';


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
        'https://smart-gardening-functions.azurewebsites.net/api/planyourgarden',
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
          'https://smart-gardening-functions.azurewebsites.net/api/savefuturegarden',
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

        {Object.keys(form).map((key) => (
          <TextInput
            key={key}
            label={key.replace(/([A-Z])/g, ' $1')}
            value={form[key as keyof typeof form]}
            onChangeText={(text) => handleChange(key, text)}
            mode="outlined"
            style={styles.input}
          />
        ))}

        {loading ? (
          <ActivityIndicator animating={true} size="large" />
        ) : (
          <Button mode="contained" onPress={handleSubmit}>
            Generate Plan
          </Button>
        )}

        {result && (
          <View style={styles.result}>
            <Divider style={{ marginVertical: 20 }} />
            <Text variant="titleMedium" style={styles.sectionTitle}>
              <Icon name="leaf" size={20} /> Recommended Plants
            </Text>
            {result.plants?.map((plant: any, index: number) => (
              <View key={index} style={styles.plantBox}>
                <Text>
                  <Icon name="flower" /> {plant.name} ({plant.type})
                </Text>
                <Text>🪵 Soil: {plant.soil}</Text>
                <Text>💧 Watering: {plant.watering}</Text>
                <Text>☀️ Sun: {plant.sunlightNeeds}</Text>
                <Text>🧰 Maintenance: {plant.maintenance}</Text>
              </View>
            ))}
            <Text variant="titleMedium" style={styles.sectionTitle}>
              <Icon name="lightbulb-on-outline" /> Tips
            </Text>
            {result.additionalTips?.map((tip: string, i: number) => (
              <Text key={i} style={{ marginBottom: 4 }}>
                <Icon name="check-circle-outline" /> {tip}
              </Text>
            ))}
          </View>
          
        )}

          <Button
              icon="eye"
              mode="outlined"
              style={{ marginTop: 10 }}
              onPress={() => router.push('/plants/futureGardens')}
            >
              View Saved Gardens
            </Button>


      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f6fff6',
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
  result: {
    marginTop: 30,
  },
  sectionTitle: {
    marginBottom: 10,
    fontWeight: '600',
  },
  plantBox: {
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#e0ffe0',
    borderRadius: 8,
  },
});
