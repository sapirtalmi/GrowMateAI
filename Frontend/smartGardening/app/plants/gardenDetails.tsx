import React, { useEffect, useState, useMemo } from 'react';
import { ScrollView, StyleSheet, TextInput as RNTextInput } from 'react-native';
import { Text, Button, Chip, Divider } from 'react-native-paper';
import { updateFutureGarden } from '../../src/api';

export default function GardenDetails({ route }: any) {
  // we receive the whole garden object from navigation
  const initGarden = route.params?.garden;
  const [garden, setGarden] = useState<any>(initGarden || null);
  const [loading, setLoading] = useState(!initGarden);
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState<string>(initGarden?.metadata?.title || '');
  const [notes, setNotes] = useState<string>(initGarden?.metadata?.notes || '');

  // If you ever decide to support reloading here, you can fetch by list+find.
  useEffect(() => { setLoading(false); }, []);

  const criteria = useMemo(() => garden?.criteria || {}, [garden]);

  const saveEdits = async () => {
    try {
      await updateFutureGarden(garden._id, {
        metadata: { ...(garden.metadata || {}), title, notes },
      });
      setGarden((g:any) => ({ ...g, metadata: { ...(g?.metadata || {}), title, notes } }));
      setEditMode(false);
    } catch (e:any) {
      console.error('Update failed:', e?.response?.data || e?.message);
      alert('Failed to save changes');
    }
  };

  if (loading || !garden) return <Text style={{ padding:16 }}>Loading…</Text>;

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text variant="headlineMedium">🌱 {title || garden.metadata?.title || 'My Garden'}</Text>
      <Text style={styles.sub}>
        By {garden.username} • {garden.createdAt ? new Date(garden.createdAt).toLocaleString() : ''}
      </Text>

      <Divider style={{ marginVertical: 8 }} />

      <Text variant="titleMedium">Criteria</Text>
      <div style={styles.rowWrap as any}>
        {Object.entries(criteria).map(([k, v]) => (
          <Chip key={k} style={{ margin: 4 }} compact>{k}: {String(v)}</Chip>
        ))}
      </div>

      <Text variant="titleMedium" style={{ marginTop: 12 }}>Recommended Plants</Text>
      {garden.plan?.plants?.map((p:any, i:number) => (
        <div key={i} style={styles.plantCard as any}>
          <Text style={styles.plantName}>{p.name} ({p.type})</Text>
          {p.soil && <Text>🪴 Soil: {p.soil}</Text>}
          {p.watering && <Text>💧 Watering: {p.watering}</Text>}
          {p.sunlightNeeds && <Text>🌞 Sun: {p.sunlightNeeds}</Text>}
          {p.maintenance && <Text>🧰 Maintenance: {p.maintenance}</Text>}
        </div>
      ))}

      {garden.plan?.additionalTips?.length ? (
        <>
          <Text variant="titleMedium" style={{ marginTop: 12 }}>Tips</Text>
          {garden.plan.additionalTips.map((t:string, i:number) => <Text key={i}>• {t}</Text>)}
        </>
      ) : null}

      <Divider style={{ marginVertical: 12 }} />

      <Text variant="titleMedium">Notes</Text>
      {editMode ? (
        <>
          <RNTextInput value={title} onChangeText={setTitle} placeholder="Title" style={styles.input}/>
          <RNTextInput value={notes} onChangeText={setNotes} placeholder="Notes" style={[styles.input,{height:100}]} multiline/>
          <Button mode="contained" onPress={saveEdits} style={{ marginTop: 8 }}>Save</Button>
          <Button onPress={()=>setEditMode(false)} style={{ marginTop: 8 }}>Cancel</Button>
        </>
      ) : (
        <>
          <Text style={{ marginTop: 6, fontWeight:'600' }}>{title || '—'}</Text>
          <Text>{notes || '—'}</Text>
          <Button mode="outlined" onPress={()=>setEditMode(true)} style={{ marginTop: 8 }}>Edit</Button>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sub:{ color:'#666', marginBottom:8 },
  rowWrap:{ flexDirection:'row', flexWrap:'wrap' },
  plantCard:{ backgroundColor:'#eef7ef', padding:10, borderRadius:8, marginTop:8 },
  plantName:{ fontWeight:'700', marginBottom:4 },
  input:{ borderWidth:1, borderColor:'#ccc', borderRadius:8, padding:10, marginTop:8 }
});
