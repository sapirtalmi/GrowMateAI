import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator, Button } from 'react-native';
import axios from 'axios';
import { useEffect, useState } from 'react';

type Comment = {
  content: string;
  timestamp: string;
  userID: string;
  postID: string;
  _id: string;
};

type Post = {
  title: string;
  content: string;
  plantName: string;
  timestamp: string;
  userID: string;
  _id: string;
};

export default function CommunityPostDetails() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    console.log("Post ID from URL:", id);

    const fetchPost = async () => {
      try {
        const res = await axios.get(
          `https://smart-gardening-functions.azurewebsites.net/api/getcommunitypostbyid?id=${id}`
        );
        setPost(res.data);
      } catch (error) {
        console.error('Failed to fetch post', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  useEffect(() => {
    console.log("🧠 useLocalSearchParams ID:", id);
  }, [id]);


 const fetchComments = async () => {
  const rawId = id;
  const postId = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!postId || typeof postId !== "string") {
    console.warn("❌ Invalid post ID:", rawId);
    return;
  }

  const url = `https://smart-gardening-functions.azurewebsites.net/api/getcommentsbypostid?postID=${encodeURIComponent(postId)}`;
  console.log("📡 Fetching from URL:", url);

  try {
    setCommentsLoading(true);
    const res = await axios.get(url);
    console.log("✅ Comments response:", res.data);
    setComments(res.data);
    setShowComments(true);
  } catch (err) {
    console.error("❌ Failed to fetch comments", err);
  } finally {
    setCommentsLoading(false);
  }
};


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <Text>Post not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🪴 {post.title}</Text>
      <Text style={styles.plant}>🌿 {post.plantName}</Text>
      <Text style={styles.content}>{post.content}</Text>
      <Text style={styles.timestamp}>
        📅 {new Date(post.timestamp).toLocaleString()}
      </Text>

      <Button title="View Comments" onPress={fetchComments} />

      {commentsLoading && <ActivityIndicator size="small" color="gray" style={{ marginTop: 10 }} />}

      {showComments && comments.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold' }}>🗨️ Comments:</Text>
          {comments.map((c, i) => (
            <View key={i} style={{ marginTop: 10 }}>
              <Text>{c.content}</Text>
              <Text style={{ fontSize: 12, color: '#777' }}>{new Date(c.timestamp).toLocaleString()}</Text>
            </View>
          ))}
        </View>
      )}

      {showComments && !commentsLoading && comments.length === 0 && (
        <Text style={{ marginTop: 10 }}>No comments yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  plant: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 10,
    color: 'green',
  },
  content: {
    fontSize: 16,
    marginBottom: 10,
  },
  timestamp: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
});
