import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Header from '../components/header';

export default function FutureGardens() {
  const [gardens, setGardens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGardens = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      try {
        const res = await axios.get(
          'https://smart-gardening-functions.azurewebsites.net/api/getfuturegardens',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setGardens(res.data);
      } catch (err) {
        console.error("Failed to fetch saved gardens:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGardens();
  }, []);

  return (
    <ScrollView style={{ padding: 20 }}>
      <Header title="Saved Gardens" />
      {loading ? (
        <ActivityIndicator />
      ) : (
        gardens.map((garden, i) => (
          <View key={i} style={styles.gardenCard}>
            <Text variant="titleMedium" style={styles.gardenTitle}>
              🌱 Garden #{i + 1}
            </Text>

            <Text style={styles.meta}>👤 {garden.username} | 🏅 {garden.profileType}</Text>

            {/* Display quick plant summary */}
            {garden.plan?.plants?.slice(0, 2).map((plant: any, idx: number) => (
              <Text key={idx} style={styles.plantLine}>
                🌸 {plant.name} ({plant.type}) – {plant.sunlightNeeds}
              </Text>
            ))}

            {/* Action buttons */}
            <View style={styles.buttonRow}>
              <Button
                icon="eye"
                mode="outlined"
                onPress={() => alert("View functionality not implemented")}
                style={styles.cardButton}
              >
                View
              </Button>
              <Button
                icon="delete"
                mode="outlined"
                buttonColor="rgba(255,0,0,0.05)"
                textColor="red"
                onPress={async () => {
                  const token = await AsyncStorage.getItem('authToken');
                  try {
                    await axios.post(
                      'https://smart-gardening-functions.azurewebsites.net/api/deletefuturegarden',
                      { id: garden._id },
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                          'Content-Type': 'application/json',
                        },
                      }
                    );
                    setGardens((prev) => prev.filter((g) => g._id !== garden._id));
                  } catch (err) {
                    console.error("Delete failed:", err);
                    alert("Failed to delete garden");
                  }
                }}
                style={styles.cardButton}
              >
                Delete
              </Button>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  gardenCard: {
    backgroundColor: '#e6f4ea',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  gardenTitle: {
    marginBottom: 4,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
    marginBottom: 8,
    color: '#555',
  },
  plantLine: {
    fontSize: 14,
    marginBottom: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cardButton: {
    flex: 0.48,
  },
});
