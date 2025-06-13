import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Header({ title, showBackButton = true }: { title: string; showBackButton?: boolean }) {
  const router = useRouter();

  const goBack = () => {
    try {
      router.back();
    } catch {
      router.replace('/menu'); // fallback if no back history
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/');
  };

  return (
    <View style={styles.header}>
      {showBackButton ? (
        <Pressable onPress={goBack}>
          <Text style={styles.back}>← Back</Text>
        </Pressable>
      ) : (
        <View style={{ width: 50 }} /> // keeps layout balanced
      )}
      <Text style={styles.title}>{title}</Text>
      <Pressable onPress={handleLogout}>
        <Text style={styles.logout}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  back: {
    color: '#4CAF50',
    fontSize: 16,
  },
  logout: {
    color: '#e53935',
    fontSize: 16,
  },
});
