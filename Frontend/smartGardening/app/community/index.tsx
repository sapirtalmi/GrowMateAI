import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  Card,
  Chip,
  ActivityIndicator,
  FAB,
  useTheme,
} from 'react-native-paper';
import Header from '../components/header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Post = {
  username: string | null;
  _id: string;
  title: string;
  content: string;
  plantName: string;
  userID: string;
  visibility: string;
  timestamp: string;
};

export default function CommunityScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('authToken');
        const userID = await AsyncStorage.getItem('userID');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await axios.get(
          'https://smart-gardening-functions.azurewebsites.net/api/getCommunityPosts',
          { headers }
        );

        const allPosts: Post[] = res.data || [];

        const filtered = filter === 'mine'
          ? allPosts.filter((p) => p.userID === userID)
          : allPosts.filter((p) => p.visibility === 'public');

        setPosts(filtered);
      } catch (err) {
        console.error('Failed to fetch posts', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [filter]);

  const renderPost = ({ item }: { item: Post }) => (
    <Card
      style={styles.card}
      onPress={() =>
        router.push({ pathname: '/community/[id]', params: { id: item._id } })
      }
    >
      <Card.Title
        title={item.title}
        subtitle={`Plant: ${item.plantName}`}
        left={(props) => <Icon name="sprout" size={24} color={theme.colors.primary} />}
      />
      <Card.Content>
        <Text variant="bodyMedium">
          {item.content.slice(0, 100)}...
        </Text>
        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header title="Main Menu" />
      <Text variant="titleLarge" style={styles.title}>
        <Icon name="account-group-outline" size={22} /> Community Posts
      </Text>

      {/* Toggle Filter Chips */}
      <View style={styles.chipRow}>
        <Chip
          icon="earth"
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          style={styles.chip}
        >
          Public
        </Chip>
        <Chip
          icon="account"
          selected={filter === 'mine'}
          onPress={() => setFilter('mine')}
          style={styles.chip}
        >
          My Posts
        </Chip>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={renderPost}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      {/* FAB: New Post */}
      <FAB
        icon="plus"
        label="New Post"
        onPress={() => router.push('/community/create')}
        style={styles.fab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { marginBottom: 16, fontWeight: 'bold' },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 12,
  },
  chip: {
    marginHorizontal: 4,
    backgroundColor: '#e0f5e9',
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#f1f8f4',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 8,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#e0f5e9',
  },
});
