import React, { useEffect, useState, useMemo } from 'react';
import { ScrollView, StyleSheet, TextInput as RNTextInput, View } from 'react-native';
import { Text, Button, Chip, Divider } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { updateFutureGarden } from '../../src/api';

export default function GardenDetails() {
  const params = useLocalSearchParams<{ garden: string }>();
  const initGarden = params.garden ? JSON.parse(params.garden) : null;

  const [garden, setGarden] = useState<any>(initGarden || null);
  const [loading, setLoading] = useState(!initGarden);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState<string>(initGarden?.metadata?.title || '');
  const [notes, setNotes] = useState<string>(initGarden?.metadata?.notes || '');
  const [editableCriteria, setEditableCriteria] = useState<any>(initGarden?.criteria || {});
  const [editablePlan, setEditablePlan] = useState<any>(initGarden?.plan || {});

  useEffect(() => { setLoading(false); }, []);

  const saveEdits = async () => {
    try {
      await updateFutureGarden(garden._id, {
        metadata: { ...(garden.metadata || {}), title, notes },
        criteria: editableCriteria,
        plan: editablePlan,
      });

      setGarden((g: any) => ({
        ...g,
        metadata: { ...(g?.metadata || {}), title, notes },
        criteria: editableCriteria,
        plan: editablePlan,
      }));

      setEditMode(false);
    } catch (e: any) {
      console.error('Update failed:', e?.response?.data || e?.message);
      alert('Failed to save changes');
    }
  };

  if (loading || !garden) return <Text style={{ padding: 16 }}>Loading…</Text>;

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="headlineMedium">🌱 {title || 'My Garden'}</Text>
      <Text style={styles.sub}>
        By {garden.username} • {garden.createdAt ? new Date(garden.createdAt).toLocaleString() : ''}
      </Text>

      <Divider style={{ marginVertical: 8 }} />

      {/* Criteria */}
      <Text variant="titleMedium">Criteria</Text>
      {editMode ? (
        Object.entries(editableCriteria).map(([k, v]) => (
          <RNTextInput
            key={k}
            value={String(v)}
            onChangeText={(val) =>
              setEditableCriteria((prev: any) => ({ ...prev, [k]: val }))
            }
            placeholder={k}
            style={styles.input}
          />
        ))
      ) : (
        <View style={styles.rowWrap}>
          {Object.entries(garden.criteria || {}).map(([k, v]) => (
            <Chip key={k} style={{ margin: 4 }} compact>{k}: {String(v)}</Chip>
          ))}
        </View>
      )}

      {/* Plants */}
      <Text variant="titleMedium" style={{ marginTop: 12 }}>Recommended Plants</Text>
      {editablePlan?.plants?.map((p: any, i: number) => (
        <View key={i} style={styles.plantCard}>
          {editMode ? (
            <>
              <RNTextInput
                value={p.name}
                onChangeText={(val) =>
                  setEditablePlan((prev: any) => {
                    const updated = [...prev.plants];
                    updated[i].name = val;
                    return { ...prev, plants: updated };
                  })
                }
                placeholder="Plant Name"
                style={styles.input}
              />
              <RNTextInput
                value={p.type}
                onChangeText={(val) => {
                  const updated = [...editablePlan.plants];
                  updated[i].type = val;
                  setEditablePlan({ ...editablePlan, plants: updated });
                }}
                placeholder="Type"
                style={styles.input}
              />
              <RNTextInput
                value={p.soil}
                onChangeText={(val) => {
                  const updated = [...editablePlan.plants];
                  updated[i].soil = val;
                  setEditablePlan({ ...editablePlan, plants: updated });
                }}
                placeholder="Soil"
                style={styles.input}
              />
              <RNTextInput
                value={p.watering}
                onChangeText={(val) => {
                  const updated = [...editablePlan.plants];
                  updated[i].watering = val;
                  setEditablePlan({ ...editablePlan, plants: updated });
                }}
                placeholder="Watering"
                style={styles.input}
              />
              <RNTextInput
                value={p.sunlightNeeds}
                onChangeText={(val) => {
                  const updated = [...editablePlan.plants];
                  updated[i].sunlightNeeds = val;
                  setEditablePlan({ ...editablePlan, plants: updated });
                }}
                placeholder="Sunlight"
                style={styles.input}
              />
              <RNTextInput
                value={p.maintenance}
                onChangeText={(val) => {
                  const updated = [...editablePlan.plants];
                  updated[i].maintenance = val;
                  setEditablePlan({ ...editablePlan, plants: updated });
                }}
                placeholder="Maintenance"
                style={styles.input}
              />
            </>
          ) : (
            <>
              <Text style={styles.plantName}>{p.name} ({p.type})</Text>
              {p.soil && <Text>🪴 Soil: {p.soil}</Text>}
              {p.watering && <Text>💧 Watering: {p.watering}</Text>}
              {p.sunlightNeeds && <Text>🌞 Sun: {p.sunlightNeeds}</Text>}
              {p.maintenance && <Text>🧰 Maintenance: {p.maintenance}</Text>}
            </>
          )}
        </View>
      ))}

      {/* Tips */}
      {editablePlan?.additionalTips?.length ? (
        <>
          <Text variant="titleMedium" style={{ marginTop: 12 }}>Tips</Text>
          {editMode ? (
            editablePlan.additionalTips.map((t: string, i: number) => (
              <RNTextInput
                key={i}
                value={t}
                onChangeText={(val) => {
                  const updated = [...editablePlan.additionalTips];
                  updated[i] = val;
                  setEditablePlan({ ...editablePlan, additionalTips: updated });
                }}
                placeholder="Tip"
                style={styles.input}
              />
            ))
          ) : (
            editablePlan.additionalTips.map((t: string, i: number) => <Text key={i}>• {t}</Text>)
          )}
        </>
      ) : null}

      <Divider style={{ marginVertical: 12 }} />

      {/* Notes + Title */}
      <Text variant="titleMedium">Notes</Text>
      {editMode ? (
        <>
          <RNTextInput value={title} onChangeText={setTitle} placeholder="Title" style={styles.input}/>
          <RNTextInput value={notes} onChangeText={setNotes} placeholder="Notes" style={[styles.input, { height: 100 }]} multiline/>
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
