import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

type Post = {
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

useEffect(() => {
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const headers = filter === 'mine' ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(
        'https://smart-gardening-functions.azurewebsites.net/api/getCommunityPosts',
        { headers }
      );

      setPosts(res.data || []);
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
    <TouchableOpacity
      style={styles.postCard}
      onPress={() => router.push({ pathname: '/community/[id]', params: { id: item._id } })}
    >
      <Text style={styles.postTitle}>🪴 {item.title}</Text>
      <Text style={styles.plantName}>🌿 {item.plantName}</Text>
      <Text style={styles.postContent}>{item.content.slice(0, 100)}...</Text>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    
    <View style={styles.container}>
      <Text style={styles.header}>🌐 Community Posts</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, filter === 'all' && styles.activeButton]}
              onPress={() => setFilter('all')}
            >
              <Text style={styles.toggleText}>🌍 Public</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, filter === 'mine' && styles.activeButton]}
              onPress={() => setFilter('mine')}
            >
              <Text style={styles.toggleText}>🙋 My Posts</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={posts}
            keyExtractor={(item) => item._id}
            renderItem={renderPost}
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        </>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 16 },
  postCard: {
    backgroundColor: '#e8f5e9',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  postTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  plantName: { fontSize: 14, fontStyle: 'italic', marginBottom: 4, color: '#388e3c' },
  postContent: { fontSize: 14, color: '#333' },
  timestamp: { fontSize: 12, color: '#999', marginTop: 6 },
  toggleContainer: {
  flexDirection: 'row',
  justifyContent: 'space-evenly',
  marginBottom: 12,
},
toggleButton: {
  paddingVertical: 6,
  paddingHorizontal: 16,
  borderRadius: 20,
  backgroundColor: '#ccc',
},
activeButton: {
  backgroundColor: '#4CAF50',
},
toggleText: {
  color: '#fff',
  fontWeight: 'bold',
}

});
