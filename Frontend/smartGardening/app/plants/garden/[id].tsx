// app/plants/garden/[id].tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { Text, Button, Chip, Divider } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { getFutureGardens, updateFutureGarden } from '../../../src/api';

export default function GardenDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [garden, setGarden] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getFutureGardens();              // list + find (until you add GET /{id})
        const found = (res.data || []).find((g: any) => g._id === id);
        setGarden(found || null);
        setTitle(found?.metadata?.title || '');
        setNotes(found?.metadata?.notes || '');
      } catch (e: any) {
        console.error('Failed to load garden details:', e?.response?.data || e?.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const criteria = useMemo(() => garden?.criteria || {}, [garden]);

  const saveEdits = async () => {
    try {
      if (!garden?._id) return;
      await updateFutureGarden(garden._id, {
        metadata: { ...(garden.metadata || {}), title, notes },
      });
      setGarden((g: any) => ({ ...g, metadata: { ...(g?.metadata || {}), title, notes } }));
      setEditMode(false);
    } catch (e: any) {
      console.error('Update failed:', e?.response?.data || e?.message);
      alert('Failed to save changes');
    }
  };

  if (loading) return <Text style={{ padding: 16 }}>Loading…</Text>;

  if (!garden) {
    return (
      <ScrollView style={{ padding: 16 }}>
        <Text>Garden not found.</Text>
        <Button onPress={() => router.back()} style={{ marginTop: 8 }}>Go back</Button>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="headlineMedium">🌱 {title || garden.metadata?.title || 'My Garden'}</Text>
      <Text style={styles.sub}>
        By {garden.username} • {garden.createdAt ? new Date(garden.createdAt).toLocaleString() : ''}
      </Text>

      <Divider style={{ marginVertical: 8 }} />

      {/* Criteria */}
      <Text variant="titleMedium">Criteria</Text>
      <View style={styles.rowWrap}>
        {Object.entries(criteria).map(([k, v]) => (
          <Chip key={k} style={{ margin: 4 }} compact>{k}: {String(v)}</Chip>
        ))}
      </View>

      {/* Plants */}
      <Text variant="titleMedium" style={{ marginTop: 12 }}>Recommended Plants</Text>
      {garden.plan?.plants?.map((p: any, i: number) => (
        <View key={i} style={styles.plantCard}>
          <Text style={styles.plantName}>{p.name} ({p.type})</Text>
          {p.soil && <Text>🪴 Soil: {p.soil}</Text>}
          {p.watering && <Text>💧 Watering: {p.watering}</Text>}
          {p.sunlightNeeds && <Text>🌞 Sun: {p.sunlightNeeds}</Text>}
          {p.maintenance && <Text>🧰 Maintenance: {p.maintenance}</Text>}
        </View>
      ))}

      {/* Tips */}
      {!!garden.plan?.additionalTips?.length && (
        <>
          <Text variant="titleMedium" style={{ marginTop: 12 }}>Tips</Text>
          {garden.plan.additionalTips.map((t: string, i: number) => <Text key={i}>• {t}</Text>)}
        </>
      )}

      <Divider style={{ marginVertical: 12 }} />

      {/* Notes / Edit */}
      <Text variant="titleMedium">Notes</Text>
      {editMode ? (
        <>
          <RNTextInput value={title} onChangeText={setTitle} placeholder="Title" style={styles.input}/>
          <RNTextInput value={notes} onChangeText={setNotes} placeholder="Notes"
                       style={[styles.input, { height: 100 }]} multiline/>
          <Button mode="contained" onPress={saveEdits} style={{ marginTop: 8 }}>Save</Button>
          <Button onPress={() => setEditMode(false)} style={{ marginTop: 8 }}>Cancel</Button>
        </>
      ) : (
        <>
          <Text style={{ marginTop: 6, fontWeight: '600' }}>{title || '—'}</Text>
          <Text>{notes || '—'}</Text>
          <Button mode="outlined" onPress={() => setEditMode(true)} style={{ marginTop: 8 }}>Edit</Button>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sub: { color: '#666', marginBottom: 8 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  plantCard: { backgroundColor: '#eef7ef', padding: 10, borderRadius: 8, marginTop: 8 },
  plantName: { fontWeight: '700', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginTop: 8 },
});
