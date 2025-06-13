import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert('Validation Error', 'Username and password are required.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post('https://smart-gardening-functions.azurewebsites.net/api/register', {
        username,
        password,
      });

      Alert.alert('Success', 'Account created successfully! You can now log in.');
      router.replace('/');
    } catch (err: any) {
      if (err.response?.status === 409) {
        Alert.alert('Registration Failed', 'Username already exists.');
      } else {
        Alert.alert('Error', 'Could not register. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholderTextColor="#9FE2BF"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        placeholderTextColor="#9FE2BF"
      />

      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Register" onPress={handleRegister} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});
