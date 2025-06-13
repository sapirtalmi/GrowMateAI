import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import Header from './components/header'; 





export default function MenuScreen() {
  const router = useRouter();

  const MenuButton = ({ title, icon, route }: { title: string; icon: string; route: string }) => (
    <Pressable style={styles.menuButton} onPress={() => router.push(route as any)}>
      <Text style={styles.menuText}>
        {icon} {title}
      </Text>
    </Pressable>
  );

  return (
    
    <View style={styles.container}>
      <Header title="Main Menu" />
      <Text style={styles.title}>🌱 Garden Menu</Text>

      <MenuButton title="Plan Your Garden" icon="🛠️" route="/plants/plan" />
      <MenuButton title="My Plants" icon="🪴" route="/plants" />
      <MenuButton title="Add Plant" icon="➕" route="/plants/modal" />
      <MenuButton title="Get Sensor Data" icon="📡" route="/sensor" />
      <MenuButton title="Diagnose Plant Problem" icon="🧠" route="/diagnose" />
      <MenuButton title="Community" icon="🌐" route="/community" />
      <MenuButton title="Settings" icon="⚙️" route="/settings" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  menuButton: {
    backgroundColor: '#e0ffe0',
    padding: 18,
    marginBottom: 15,
    borderRadius: 10,
  },
  menuText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
