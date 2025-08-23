import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import Header from '../components/header';
import { router } from 'expo-router'; 
import { getFutureGardens, deleteFutureGarden } from '../../src/api';
export default function FutureGardens() {
  const [gardens, setGardens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getFutureGardens();
        setGardens(res.data);
      } catch (err:any) {
        console.error('Failed to fetch saved gardens:', err?.response?.data || err?.message);
      } finally { setLoading(false); }
    })();
  }, []);

  const onDelete = async (id: string) => {
    try {
      await deleteFutureGarden(id);               // <-- real DELETE
      setGardens(prev => prev.filter(g => g._id !== id));
    } catch (e:any) {
      console.error('Delete failed:', e?.response?.data || e?.message);
      alert('Failed to delete garden');
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Header title="Saved Gardens" />
      {loading ? <ActivityIndicator/> : gardens.map((garden, i) => (
        <View key={garden._id || i} style={styles.gardenCard}>
          <Text variant="titleMedium" style={styles.gardenTitle}>🌱 Garden #{i + 1}</Text>
          <Text style={styles.meta}>👤 {garden.username} | 🏅 {garden.profileType}</Text>

          {garden.plan?.plants?.slice(0,2).map((p:any, idx:number) => (
            <Text key={idx} style={styles.plantLine}>🌸 {p.name} ({p.type}) – {p.sunlightNeeds}</Text>
          ))}

          <View style={styles.buttonRow}>
            <Button
              icon="eye"
              mode="outlined"
              onPress={() => router.push(`/plants/garden/${garden._id}`)}   
              style={styles.cardButton}
            >
              View
            </Button>

            <Button
              icon="delete"
              mode="outlined"
              buttonColor="rgba(255,0,0,0.05)"
              textColor="red"
              onPress={() => onDelete(garden._id)}
              style={styles.cardButton}
            >
              Delete
            </Button>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  gardenCard: { backgroundColor:'#e6f4ea', borderRadius:10, padding:16, marginBottom:16,
    shadowColor:'#000', shadowOpacity:0.05, shadowOffset:{width:0,height:2}, shadowRadius:4 },
  gardenTitle:{ marginBottom:4, fontWeight:'600' },
  meta:{ fontSize:12, marginBottom:8, color:'#555' },
  plantLine:{ fontSize:14, marginBottom:2 },
  buttonRow:{ flexDirection:'row', justifyContent:'space-between', marginTop:12 },
  cardButton:{ flex:0.48 },
});
