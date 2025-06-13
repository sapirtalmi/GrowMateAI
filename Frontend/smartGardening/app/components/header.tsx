import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';

export default function Header({
  title,
  showBackButton = true,
}: {
  title: string;
  showBackButton?: boolean;
}) {
  const router = useRouter();

  const goBack = () => {
    try {
      router.back();
    } catch {
      router.replace('/menu');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {showBackButton ? (
          <Pressable onPress={goBack} style={styles.iconWrapper}>
            <Icon name="chevron-left" size={24} color="#4CAF50" />
          </Pressable>
        ) : (
          <View style={styles.iconWrapper} />
        )}

        <Text style={styles.title}>{title}</Text>

        <Pressable onPress={handleLogout} style={styles.iconWrapper}>
          <Icon name="logout" size={20} color="#4CAF50" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f9fff9',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
  },
  container: {
    height: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrapper: {
    width: 40,
    alignItems: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: '#2e7d32',
    fontSize: 17,
    fontWeight: '600',
  },
});
