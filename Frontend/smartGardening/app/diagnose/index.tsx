import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import axios from 'axios';

export default function DiagnoseScreen() {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const diagnosePlant = async () => {
    try {
      setLoading(true);
      const res = await axios.post('https://your-api.azurewebsites.net/api/diagnosePlantProblem', {
        plantID: 'examplePlantId', // Replace or make dynamic
      });
      setResult(res.data?.diagnosis || 'No diagnosis returned.');
    } catch (err) {
      console.error('Diagnosis failed', err);
      setResult('Error during diagnosis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧠 Diagnose Plant</Text>
      <Button title="Run Diagnosis" onPress={diagnosePlant} />
      {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
      {result && <Text style={styles.result}>{result}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  result: { marginTop: 20, fontSize: 16, color: 'green' },
});
