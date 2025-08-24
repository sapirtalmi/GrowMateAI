import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  Card,
  Chip,
  ActivityIndicator,
  FAB,
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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('authToken');
        const userID = await AsyncStorage.getItem('userID');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await axios.get(
          'https://smartgardeningfunctions.azurewebsites.net/api/getCommunityPosts',
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
      style={styles.postCard}
      mode="elevated"
      onPress={() =>
        router.push({ pathname: '/community/[id]', params: { id: item._id } })
      }
    >
      <Card.Content>
        {/* Header with plant icon and title */}
        <View style={styles.postHeader}>
          <View style={styles.iconContainer}>
            <Icon name="sprout" size={24} color="#2E7D32" />
          </View>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium" style={styles.postTitle}>
              {item.title}
            </Text>
            <Text variant="bodySmall" style={styles.plantName}>
              🌱 {item.plantName}
            </Text>
          </View>
        </View>

        {/* Content preview */}
        <Text variant="bodyMedium" style={styles.contentPreview}>
          {item.content.length > 120 ? item.content.slice(0, 120) + '...' : item.content}
        </Text>

        {/* User info section */}
        <View style={styles.userSection}>
          <View style={styles.userInfo}>
            <Icon name="account-circle" size={18} color="#4CAF50" />
            <Text style={styles.username}>
              {item.username || 'Anonymous'} 
            </Text>
            {item.profileType && (
              <View style={styles.profileTypeBadge}>
                <Text style={styles.profileTypeText}>
                  {item.profileType}
                </Text>
              </View>
            )}
          </View>

          {/* Badges */}
          {item.badges?.length ? (
            <View style={styles.badgesContainer}>
              {item.badges.slice(0, 2).map((badge, index) => (
                <View key={index} style={styles.badge}>
                  <Text style={styles.badgeText}>🎖️ {badge}</Text>
                </View>
              ))}
              {item.badges.length > 2 && (
                <Text style={styles.moreBadges}>+{item.badges.length - 2} more</Text>
              )}
            </View>
          ) : null}
        </View>

        {/* Footer with votes and timestamp */}
        <View style={styles.postFooter}>
          <View style={styles.votesContainer}>
            <View style={styles.voteItem}>
              <Icon name="thumb-up" size={16} color="#4CAF50" />
              <Text style={styles.voteText}>{item.upvotes || 0}</Text>
            </View>
            <View style={styles.voteItem}>
              <Icon name="thumb-down" size={16} color="#F44336" />
              <Text style={styles.voteText}>{item.downvotes || 0}</Text>
            </View>
          </View>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Header title="Community" />
      
      {/* Modern header with gradient background */}
      <View style={styles.headerSection}>
        <View style={styles.titleRow}>
          <Icon name="account-group" size={28} color="#2E7D32" />
          <Text variant="headlineSmall" style={styles.pageTitle}>
            Community Garden
          </Text>
        </View>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Share your gardening journey with fellow growers
        </Text>
      </View>

      {/* Filter chips */}
      <View style={styles.filterSection}>
        <Chip
          icon="earth"
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          style={[styles.filterChip, filter === 'all' && styles.selectedChip]}
          textStyle={[styles.chipText, filter === 'all' && styles.selectedChipText]}
        >
          Public Posts
        </Chip>
        <Chip
          icon="account"
          selected={filter === 'mine'}
          onPress={() => setFilter('mine')}
          style={[styles.filterChip, filter === 'mine' && styles.selectedChip]}
          textStyle={[styles.chipText, filter === 'mine' && styles.selectedChipText]}
        >
          My Posts
        </Chip>
      </View>

      {/* Posts list */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading community posts...</Text>
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="sprout-outline" size={64} color="#CCCCCC" />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            No posts yet
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
            {filter === 'mine' 
              ? "You haven't created any posts yet. Share your gardening experience!"
              : "Be the first to share your gardening journey with the community!"
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={renderPost}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        label="New Post"
        onPress={() => router.push('/community/create')}
        style={styles.fab}
        color="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FFF9',
  },
  
  // Header Section
  headerSection: {
    backgroundColor: 'linear-gradient(135deg, #E8F5E8 0%, #F0F8F0 100%)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pageTitle: {
    marginLeft: 12,
    fontWeight: '700',
    color: '#1B5E20',
  },
  subtitle: {
    color: '#388E3C',
    fontStyle: 'italic',
  },

  // Filter Section
  filterSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 16,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedChip: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  chipText: {
    color: '#666666',
    fontWeight: '500',
  },
  selectedChipText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Post Cards
  postCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  postTitle: {
    fontWeight: '600',
    color: '#1B5E20',
    marginBottom: 4,
  },
  plantName: {
    color: '#388E3C',
    fontWeight: '500',
  },
  contentPreview: {
    color: '#424242',
    lineHeight: 20,
    marginBottom: 16,
  },

  // User Section
  userSection: {
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    marginLeft: 6,
    fontWeight: '500',
    color: '#2E7D32',
    flex: 1,
  },
  profileTypeBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  profileTypeText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFB74D',
  },
  badgeText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '500',
  },
  moreBadges: {
    fontSize: 12,
    color: '#757575',
    fontStyle: 'italic',
    alignSelf: 'center',
  },

  // Post Footer
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  votesContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  voteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  voteText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
  },
  timestamp: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '400',
  },

  // Loading and Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    color: '#757575',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    color: '#424242',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
  },

  // List Container
  listContainer: {
    paddingBottom: 100,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#4CAF50',
    elevation: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  // Legacy styles to remove
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
  votes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  badges: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
});
