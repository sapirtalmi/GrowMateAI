import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  useTheme,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert('Validation Error', 'Username and password are required.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('https://smart-gardening-functions.azurewebsites.net/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.status === 409) {
        Alert.alert('Registration Failed', 'Username already exists.');
        return;
      }

      if (!res.ok) throw new Error('Unexpected error');

      Alert.alert('Success', 'Account created! You can now log in.');
      router.replace('/');
    } catch (err) {
      console.error('Register error:', err);
      Alert.alert('Error', 'Could not register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Icon name="account-plus" size={42} color={theme.colors.primary} style={{ marginBottom: 10 }} />
      <Text variant="headlineSmall" style={styles.title}>
        Create Account
      </Text>

      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        mode="outlined"
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
        style={styles.input}
      />

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <Button mode="contained" onPress={handleRegister} style={{ marginTop: 20 }}>
          Register
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { textAlign: 'center', marginBottom: 20 },
  input: { marginBottom: 12 },
});
