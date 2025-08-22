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

  // title/notes
  const [title, setTitle] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // NEW: editable copies
  const [editableCriteria, setEditableCriteria] = useState<any>({});
  const [editablePlan, setEditablePlan] = useState<any>({ plants: [], additionalTips: [] });

  useEffect(() => {
    (async () => {
      try {
        const res = await getFutureGardens(); // list + find (until GET /{id})
        const found = (res.data || []).find((g: any) => g._id === id);
        setGarden(found || null);
        setTitle(found?.metadata?.title || '');
        setNotes(found?.metadata?.notes || '');
        setEditableCriteria(found?.criteria || {});
        setEditablePlan(found?.plan || { plants: [], additionalTips: [] });
      } catch (e: any) {
        console.error('Failed to load garden details:', e?.response?.data || e?.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const criteria = useMemo(() => garden?.criteria || {}, [garden]);

  // helpers to edit local state
  const onChangeCriterion = (key: string, val: string) =>
    setEditableCriteria((prev: any) => ({ ...prev, [key]: val }));

  const onChangePlant = (idx: number, key: string, val: string) =>
    setEditablePlan((prev: any) => {
      const plants = [...(prev.plants || [])];
      plants[idx] = { ...(plants[idx] || {}), [key]: val };
      return { ...prev, plants };
    });

  const addPlant = () =>
    setEditablePlan((prev: any) => ({
      ...prev,
      plants: [...(prev.plants || []), { name: '', type: '', soil: '', watering: '', sunlightNeeds: '', maintenance: '' }],
    }));

  const removePlant = (idx: number) =>
    setEditablePlan((prev: any) => {
      const plants = [...(prev.plants || [])];
      plants.splice(idx, 1);
      return { ...prev, plants };
    });

  const onChangeTip = (idx: number, val: string) =>
    setEditablePlan((prev: any) => {
      const tips = [...(prev.additionalTips || [])];
      tips[idx] = val;
      return { ...prev, additionalTips: tips };
    });

  const addTip = () =>
    setEditablePlan((prev: any) => ({ ...prev, additionalTips: [...(prev.additionalTips || []), ''] }));

  const removeTip = (idx: number) =>
    setEditablePlan((prev: any) => {
      const tips = [...(prev.additionalTips || [])];
      tips.splice(idx, 1);
      return { ...prev, additionalTips: tips };
    });

  const saveEdits = async () => {
  try {
    if (!garden?._id) throw new Error('Missing garden id');
    const payload = {
      metadata: { ...(garden.metadata || {}), title, notes },
      criteria: editableCriteria,
      plan: editablePlan,
    };
    await updateFutureGarden(garden._id, payload);

    setGarden((g:any) => ({ ...g, ...payload }));
    setEditMode(false);
  } catch (e:any) {
    console.error(
      'Update failed:',
      e?.response?.status,
      e?.response?.data,
      e?.config?.url,
      e?.config?.headers?.Authorization ? 'Auth: present' : 'Auth: MISSING'
    );
    alert(`Failed to save changes (${e?.response?.status || 'no status'})`);
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
      {editMode ? (
        Object.entries(editableCriteria).map(([k, v]) => (
          <RNTextInput
            key={k}
            value={String(v ?? '')}
            onChangeText={(val) => onChangeCriterion(k, val)}
            placeholder={k}
            style={styles.input}
          />
        ))
      ) : (
        <View style={styles.rowWrap}>
          {Object.entries(criteria).map(([k, v]) => (
            <Chip key={k} style={{ margin: 4 }} compact>{k}: {String(v)}</Chip>
          ))}
        </View>
      )}

      {/* Plants */}
      <Text variant="titleMedium" style={{ marginTop: 12 }}>Recommended Plants</Text>
      {(editMode ? editablePlan?.plants : garden?.plan?.plants)?.map((p: any, i: number) => (
        <View key={i} style={styles.plantCard}>
          {editMode ? (
            <>
              <RNTextInput style={styles.input} placeholder="Name" value={p.name ?? ''} onChangeText={(v) => onChangePlant(i, 'name', v)} />
              <RNTextInput style={styles.input} placeholder="Type" value={p.type ?? ''} onChangeText={(v) => onChangePlant(i, 'type', v)} />
              <RNTextInput style={styles.input} placeholder="Soil" value={p.soil ?? ''} onChangeText={(v) => onChangePlant(i, 'soil', v)} />
              <RNTextInput style={styles.input} placeholder="Watering" value={p.watering ?? ''} onChangeText={(v) => onChangePlant(i, 'watering', v)} />
              <RNTextInput style={styles.input} placeholder="Sunlight" value={p.sunlightNeeds ?? ''} onChangeText={(v) => onChangePlant(i, 'sunlightNeeds', v)} />
              <RNTextInput style={styles.input} placeholder="Maintenance" value={p.maintenance ?? ''} onChangeText={(v) => onChangePlant(i, 'maintenance', v)} />
              <Button onPress={() => removePlant(i)} style={{ marginTop: 4 }}>Remove plant</Button>
            </>
          ) : (
            <>
              <Text style={styles.plantName}>{p.name} {p.type ? `(${p.type})` : ''}</Text>
              {p.soil && <Text>🪴 Soil: {p.soil}</Text>}
              {p.watering && <Text>💧 Watering: {p.watering}</Text>}
              {p.sunlightNeeds && <Text>🌞 Sun: {p.sunlightNeeds}</Text>}
              {p.maintenance && <Text>🧰 Maintenance: {p.maintenance}</Text>}
            </>
          )}
        </View>
      ))}
      {editMode ? <Button onPress={addPlant} style={{ marginTop: 6 }}>Add plant</Button> : null}

      {/* Tips */}
      {!!(editMode ? editablePlan?.additionalTips : garden?.plan?.additionalTips)?.length && (
        <>
          <Text variant="titleMedium" style={{ marginTop: 12 }}>Tips</Text>
          {(editMode ? editablePlan.additionalTips : garden.plan.additionalTips).map((t: string, i: number) =>
            editMode ? (
              <View key={i}>
                <RNTextInput style={styles.input} placeholder="Tip" value={t ?? ''} onChangeText={(v) => onChangeTip(i, v)} />
                <Button onPress={() => removeTip(i)} style={{ marginTop: 4 }}>Remove tip</Button>
              </View>
            ) : (
              <Text key={i}>• {t}</Text>
            )
          )}
        </>
      )}
      {editMode ? <Button onPress={addTip} style={{ marginTop: 6 }}>Add tip</Button> : null}

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
          <Button mode="outlined" onPress={() => setEditMode(true)} style={{ marginTop: 8 }}>Edit all</Button>
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
