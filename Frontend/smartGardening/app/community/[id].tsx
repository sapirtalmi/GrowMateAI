import { useLocalSearchParams } from 'expo-router';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  useTheme,
  IconButton,
} from 'react-native-paper';
import axios from 'axios';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
  const theme = useTheme();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
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

  const fetchComments = async () => {
    const postId = Array.isArray(id) ? id[0] : id;
    if (!postId || typeof postId !== "string") return;

    try {
      setCommentsLoading(true);
      const res = await axios.get(
        `https://smart-gardening-functions.azurewebsites.net/api/getcommentsbypostid?postID=${encodeURIComponent(postId)}`
      );
      setComments(res.data);
      setShowComments(true);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const submitComment = async () => {
    const postId = Array.isArray(id) ? id[0] : id;
    if (!newComment.trim() || !postId) return;
    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('authToken');
      await axios.post(
        'https://smart-gardening-functions.azurewebsites.net/api/createcomment',
        { postID: postId, content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error("Submit comment failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
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
    <ScrollView style={styles.container}>
      <Header title="Main Menu" />
      <Text variant="titleLarge">{post.title}</Text>
      <Text style={styles.plantName}>
        <Icon name="leaf" size={16} /> {post.plantName}
      </Text>
      <Text style={styles.timestamp}>
        <Icon name="calendar" size={16} /> {new Date(post.timestamp).toLocaleString()}
      </Text>
      <Text style={styles.content}>{post.content}</Text>

      <Button
        icon="comment-text"
        mode="outlined"
        onPress={fetchComments}
        style={{ marginTop: 10 }}
      >
        View Comments
      </Button>

      {commentsLoading && <ActivityIndicator style={{ marginTop: 10 }} />}

      {showComments && (
        <>
          {comments.length > 0 ? (
            <View style={{ marginTop: 20 }}>
              {comments.map((c, i) => (
                <View key={i} style={styles.comment}>
                  <Text>{c.content}</Text>
                  <Text style={styles.commentTime}>{new Date(c.timestamp).toLocaleString()}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ marginTop: 10, color: '#888' }}>No comments yet.</Text>
          )}

          <TextInput
            label="Add a comment"
            value={newComment}
            onChangeText={setNewComment}
            mode="outlined"
            style={{ marginTop: 20 }}
          />
          <Button
            mode="contained"
            icon="send"
            onPress={submitComment}
            disabled={submitting || !newComment.trim()}
            style={{ marginTop: 10 }}
          >
            Submit
          </Button>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  plantName: { marginTop: 6, fontStyle: 'italic', color: 'green' },
  timestamp: { color: '#888', marginBottom: 10 },
  content: { fontSize: 16, marginBottom: 20 },
  comment: {
    paddingVertical: 8,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  commentTime: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
});
