import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router=useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const handleLogin = async () => {
    setIsLoading(true); // Start loading
    try {
      console.log("starting");
      
      const response = await axios.post('https://smart-gardening-functions.azurewebsites.net/api/login', {
        username,
        password,
      });
      console.log("here");
      const token = response.data.token; // or however the backend sends it
  
      // Optional: Save the token for future requests
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('username', username);

  
      // Navigate to home screen
      router.replace('/home');
    } catch (error: any) {
      if (error.response && (error.response.status === 400 || error.response.status === 401)) {
        Alert.alert('Login Failed', 'Invalid username or password.');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again later.');
      }
    } finally {
      setIsLoading(false); // Stop loading regardless of success/failure
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
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
    {isLoading ? (<ActivityIndicator size="large" color="#0000ff" />) : (<Button title="Login" onPress={handleLogin} />
    )}
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
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});