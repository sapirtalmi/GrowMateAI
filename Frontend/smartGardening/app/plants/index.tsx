import { useNavigation, useRouter } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

type Plant = {
  name: string;
  deviceId: string;
  type: string;
};

export default function PlantListScreen() {
    const router = useRouter();
    const navigation = useNavigation();

    useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: 'My Plants' });
    }, [navigation]);

  // Dummy local state (we'll replace with persistent storage later)
  const [plants, setPlants] = useState<Plant[]>([]);

  return (
    <View style={styles.container}>
      {/* Header with title + New Plant button */}
      <View style={styles.header}>
        <Text style={styles.title}>🪴 My Plants</Text>
        <Pressable onPress={() => router.push('/plants/modal')}>
          <Text style={styles.newPlant}>New Plant</Text>
        </Pressable>
      </View>

      {/* Plant list */}
      {plants.length === 0 ? (
        <Text style={styles.empty}>No plants yet 🥲 </Text>
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.plantItem}>
              <Text style={styles.plantName}>🌱 {item.name}</Text>
              <Text style={styles.deviceId}>🔌 {item.deviceId}</Text>
              <Text style={styles.deviceId}>🌿 Type: {item.type}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  newPlant: {
    fontSize: 16,
    color: 'blue',
    fontWeight: '600',
  },
  empty: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    color: '#aaa',
  },
  plantItem: {
    backgroundColor: '#e0ffe0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deviceId: {
    fontSize: 14,
    color: '#555',
  },
});
