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
    backgroundColor: '#ffffff',
  },
  container: {
    height: 44, // Reduced from 56 to 44
    paddingHorizontal: 12, // Reduced from 16 to 12
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03, // Reduced shadow
    shadowRadius: 1,
    elevation: 1,
  },
  iconWrapper: {
    width: 32, // Reduced from 36 to 32
    height: 32, // Reduced from 36 to 32
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16, // Adjusted for new size
    backgroundColor: 'transparent',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: '#1a5d1a',
    fontSize: 17, // Reduced from 18 to 17
    fontWeight: '600', // Reduced from 700 to 600
    letterSpacing: 0.3, // Reduced from 0.5 to 0.3
  },
});
