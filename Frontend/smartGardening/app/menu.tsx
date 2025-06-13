import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, Text, useTheme } from 'react-native-paper';
import Header from './components/header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';




const menuItems = [
  { title: 'Plan Your Garden', icon: 'shovel', route: '/plants/plan' },
  { title: 'My Plants', icon: 'leaf', route: '/plants' },
  { title: 'Add Plant', icon: 'plus-box', route: '/plants/modal' },
  { title: 'Get Sensor Data', icon: 'access-point', route: '/sensor' },
  { title: 'Diagnose Plant Problem', icon: 'brain', route: '/diagnose' },
  { title: 'Community', icon: 'account-group', route: '/community' },
  { title: 'Settings', icon: 'cog', route: '/settings' },
];


export default function MenuScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Main Menu" />
      <Text variant="headlineMedium" style={styles.title}>GrowMateAI Menu</Text>

      {menuItems.map(({ title, icon, route }) => (
        <Card
          key={route}
          style={styles.card}
          onPress={() => router.push(route as any)}
        >
          <Card.Title
            title={title}
            left={(props) => <Icon name={icon} size={28} color="#388e3c" style={{ marginRight: 10 }} />}
          />
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f6fff6',
  },
  title: {
    marginVertical: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#e0f5e9', 
  },
});
