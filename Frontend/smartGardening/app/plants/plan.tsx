import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Button,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function PlanYourGardenScreen() {
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
        <Text style={styles.title}>🌿 Plan Your Garden</Text>

        {Object.keys(form).map((key) => (
          <TextInput
            key={key}
            style={styles.input}
            placeholder={key}
            value={form[key as keyof typeof form]}
            onChangeText={(text) => handleChange(key, text)}
          />
        ))}

        <Button title="Generate Plan" onPress={handleSubmit} />
        {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

        {result && (
          <View style={styles.result}>
            <Text style={styles.sectionTitle}>✅ Recommended Plants</Text>
            {result.plants?.map((plant: any, index: number) => (
              <View key={index} style={styles.plantBox}>
                <Text>🌱 {plant.name} ({plant.type})</Text>
                <Text>Soil: {plant.soil}</Text>
                <Text>Watering: {plant.watering}</Text>
                <Text>Sun: {plant.sunlightNeeds}</Text>
                <Text>Maintenance: {plant.maintenance}</Text>
              </View>
            ))}
            <Text style={styles.sectionTitle}>💡 Tips</Text>
            {result.additionalTips?.map((tip: string, i: number) => (
              <Text key={i}>👉 {tip}</Text>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 10,
    borderRadius: 6,
  },
  result: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  plantBox: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#e0ffe0',
    borderRadius: 8,
  },
});
