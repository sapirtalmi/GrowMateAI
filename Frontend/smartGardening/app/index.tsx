import React, { useState } from 'react';
import { View, StyleSheet, Alert, Pressable } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        'https://smart-gardening-functions.azurewebsites.net/api/login',
        { username, password }
      );

      const token = response.data.token;
      const user_id = response.data.user_id;

      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('userID', user_id);

      router.replace('/menu');
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.status === 401) {
        Alert.alert('Login Failed', 'Invalid username or password.');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Icon name="leaf" size={48} color={theme.colors.primary} style={{ marginBottom: 10 }} />
      <Text variant="headlineMedium" style={styles.title}>Sign In</Text>

      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
      />

      {isLoading ? (
        <ActivityIndicator animating={true} style={{ marginTop: 20 }} />
      ) : (
        <Button mode="contained" onPress={handleLogin} style={{ marginTop: 10 }}>
          Login
        </Button>
      )}

      <Pressable onPress={() => router.push('/register')}>
        <Text style={styles.registerText}>
          Don't have an account? <Text style={{ color: theme.colors.primary }}>Register here</Text>
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  registerText: {
    marginTop: 20,
    textAlign: 'center',
  },
});
