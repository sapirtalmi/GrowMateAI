import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const loadUsername = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      setUsername(storedUsername);
    };

    loadUsername();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('username');
    router.replace('/');
  };


  const goToPlants = () => {
    router.push('/plants'); // 👈 Navigate to the plants screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{username ? `Welcome Home, ${username}!` : 'Welcome Home!'}</Text>

      <TouchableOpacity style={styles.plantsBox} onPress={goToPlants}>
        <Text style={styles.plantsText}>My Plants</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 30 }}>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  plantsBox: {
    backgroundColor: '#c1f0c1',
    padding: 20,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  plantsText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
