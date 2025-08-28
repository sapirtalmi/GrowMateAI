import { useLocalSearchParams } from 'expo-router';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
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
  username?: string;
  profileType?: string;
  badges?: string[];
  upvotes?: number;
  downvotes?: number;
};

type Post = {
  title: string;
  content: string;
  plantName: string;
  timestamp: string;
  userID: string;
  _id: string;
  username?: string;
  profileType?: string;
  badges?: string[];
  upvotes?: number;
  downvotes?: number;
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
          `https://smartgardeningfunctions.azurewebsites.net/api/getcommunitypostbyid?id=${id}`
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
        `https://smartgardeningfunctions.azurewebsites.net/api/getcommentsbypostid?postID=${encodeURIComponent(postId)}`
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
        'https://smartgardeningfunctions.azurewebsites.net/api/createcomment',
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

  const voteOnContent = async (contentID: string, vote: 'up' | 'down', type: 'post' | 'comment') => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      await axios.post(
        'https://smartgardeningfunctions.azurewebsites.net/api/votecontent',
        { contentID, vote, type },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Success', 'Vote recorded!');
      if (type === 'post') {
        const res = await axios.get(
          `https://smartgardeningfunctions.azurewebsites.net/api/getcommunitypostbyid?id=${id}`
        );
        setPost(res.data);
      } else {
        fetchComments();
      }
    } catch (err) {
      console.error('Voting failed', err);
      Alert.alert('Error', 'Could not vote.');
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

      <View style={styles.userInfo}>
        <Text>👤 {post.username || 'Unknown'} ({post.profileType})</Text>
        {post.badges?.length ? (
          <Text>🎖 {post.badges.join(', ')}</Text>
        ) : null}

        <View style={styles.votes}>
          <Icon name="thumb-up" size={16} color="green" />
          <Text style={styles.voteText}>{post.upvotes || 0}</Text>
          <Icon name="thumb-down" size={16} color="red" style={{ marginLeft: 12 }} />
          <Text style={styles.voteText}>{post.downvotes || 0}</Text>
        </View>
        <View style={styles.voteButtons}>
          <IconButton icon="thumb-up-outline" onPress={() => voteOnContent(post._id, 'up', 'post')} />
          <IconButton icon="thumb-down-outline" onPress={() => voteOnContent(post._id, 'down', 'post')} />
        </View>
      </View>

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
                  <Text style={styles.commentTime}>
                    {new Date(c.timestamp).toLocaleString()}
                  </Text>
                  <Text>👤 {c.username || 'Unknown'} ({c.profileType})</Text>
                  {post.badges?.length ? (
                    <Text>🎖 {post.badges.join(', ')}</Text>
                  ) : null}

                  <View style={styles.votes}>
                    <Icon name="thumb-up" size={14} color="green" />
                    <Text style={styles.voteText}>{c.upvotes || 0}</Text>
                    <Icon name="thumb-down" size={14} color="red" style={{ marginLeft: 10 }} />
                    <Text style={styles.voteText}>{c.downvotes || 0}</Text>
                  </View>
                  <View style={styles.voteButtons}>
                    <IconButton icon="thumb-up-outline" size={18} onPress={() => voteOnContent(c._id, 'up', 'comment')} />
                    <IconButton icon="thumb-down-outline" size={18} onPress={() => voteOnContent(c._id, 'down', 'comment')} />
                  </View>
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
  userInfo: { marginTop: 12 },
  badges: { marginTop: 4, fontSize: 12, color: '#666' },
  votes: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  voteText: { marginLeft: 4, fontSize: 14, color: '#444' },
  voteButtons: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
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
