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
  profileType?: string;
  badges?: string[];
  upvotes?: number;
  downvotes?: number;
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
        left={() => (
          <Icon
            name="sprout"
            size={24}
            color={theme.colors.primary}
            style={{ marginRight: 10 }}
          />
        )}
      />
      <Card.Content>
        <Text variant="bodyMedium">
          {item.content.length > 100 ? item.content.slice(0, 100) + '...' : item.content}
        </Text>

        <View style={styles.userInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
            <Icon name="account-circle" size={16} color={theme.colors.primary} />
            <Text style={{ marginLeft: 6 }}>
              {item.username || 'Unknown'} ({item.profileType})
            </Text>
          </View>

          {item.badges?.length ? (
            <Text>🎖 {item.badges.join(', ')}</Text>
          ) : null}

          <View style={styles.votes}>
            <Icon name="thumb-up" size={16} color="green" />
            <Text style={styles.voteText}>{item.upvotes || 0}</Text>
            <Icon name="thumb-down" size={16} color="red" style={{ marginLeft: 12 }} />
            <Text style={styles.voteText}>{item.downvotes || 0}</Text>
          </View>
        </View>

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
  userInfo: {
    marginTop: 8,
  },
  badges: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  votes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  voteText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#444',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#e0f5e9',
  },
});
