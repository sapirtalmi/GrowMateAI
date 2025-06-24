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
  const [email, setEmail] = useState('');
  const [acceptEmailNotifications, setAcceptEmailNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  const handleRegister = async () => {
    if (!username || !password || !email) {
      Alert.alert('Validation Error', 'Username, password, and email are required.');
      return;
    }
    if (!acceptEmailNotifications) {
      Alert.alert('Consent Required', 'You must accept receiving notifications via email.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('https://smartgardeningfunctions.azurewebsites.net/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, acceptEmailNotifications }),
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

      <TextInput
        label="Email Address"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Icon
          name={acceptEmailNotifications ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={28}
          color={acceptEmailNotifications ? theme.colors.primary : '#888'}
          onPress={() => setAcceptEmailNotifications(!acceptEmailNotifications)}
          style={{ marginRight: 8 }}
        />
        <Text style={{ flex: 1 }} onPress={() => setAcceptEmailNotifications(!acceptEmailNotifications)}>
          I accept receiving notifications regarding my plants and garden via email
        </Text>
      </View>

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
