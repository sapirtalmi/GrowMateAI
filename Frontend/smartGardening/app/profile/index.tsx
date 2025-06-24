import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  ActivityIndicator,
  Card,
  Text,
  useTheme,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../components/header';

type UserProfile = {
  username: string;
  profileType: string;
  reputationScore: number;
  postsCount: number;
  commentsCount: number;
  votesReceived: number;
  badges: string[];
};

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) throw new Error('Missing token');

        const res = await axios.get(
          'https://smart-gardening-functions.azurewebsites.net/api/getUserProfile',
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setProfile(res.data);
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <ActivityIndicator
        animating={true}
        size="large"
        style={{ marginTop: 50 }}
        color={theme.colors.primary}
      />
    );
  }

  if (!profile) {
    return <Text style={styles.empty}>Profile data unavailable.</Text>;
  }

  return (
    <View style={styles.container}>
      <Header title="Main Menu" />
      <Text variant="headlineMedium" style={styles.title}>
        <Icon name="account-circle" size={26} /> My Profile
      </Text>

      <Card style={styles.card}>
        <Card.Title
          title={profile.username}
          subtitle={`Profile Type: ${profile.profileType}`}
          left={() => (
            <Icon name="account" size={30} color={theme.colors.primary} />
          )}
        />
        <Card.Content>
          <View style={styles.row}>
            <Icon name="star-circle" size={20} color="#FFD700" />
            <Text> Reputation: {profile.reputationScore}</Text>
          </View>
          <View style={styles.row}>
            <Icon name="post" size={20} color="#555" />
            <Text> Posts: {profile.postsCount}</Text>
          </View>
          <View style={styles.row}>
            <Icon name="comment-text-multiple" size={20} color="#555" />
            <Text> Comments: {profile.commentsCount}</Text>
          </View>
          <View style={styles.row}>
            <Icon name="thumb-up" size={20} color="green" />
            <Text> Votes Received: {profile.votesReceived}</Text>
          </View>

          {profile.badges.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.badgeHeader}>🎖 Badges</Text>
              {profile.badges.map((badge, i) => (
                <Text key={i} style={styles.badgeText}>• {badge}</Text>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f6fff6' },
  title: { marginBottom: 20, textAlign: 'center' },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' },
  card: { padding: 10, backgroundColor: '#e0f7e9' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  badgeHeader: {
    fontWeight: '600',
    marginBottom: 4,
  },
  badgeText: {
    marginLeft: 8,
    color: '#333',
  },
});
