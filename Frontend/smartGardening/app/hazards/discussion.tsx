import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import signalRService, { Message } from '../../services/signalRService';

interface HazardData {
  _id: string;
  type: string;
  description: string;
  latitude: number;
  longitude: number;
  created_at: string;
  reported_by: string;
  distance_km: number;
}

export default function HazardDiscussionScreen() {
  const params = useLocalSearchParams();
  
  // Parse hazard data from params
  const hazardData: HazardData = {
    _id: params.id as string,
    type: params.type as string,
    description: params.description as string,
    latitude: parseFloat(params.latitude as string),
    longitude: parseFloat(params.longitude as string),
    created_at: params.created_at as string,
    reported_by: params.reported_by as string,
    distance_km: parseFloat(params.distance_km as string),
  };

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        
        // Get username from storage or generate one
        let storedUsername = await AsyncStorage.getItem('username');
        if (!storedUsername) {
          storedUsername = `User_${Math.random().toString(36).substr(2, 8)}`;
          await AsyncStorage.setItem('username', storedUsername);
        }
        setUsername(storedUsername);

        // Initialize SignalR connection
        await signalRService.initializeConnection();
        
        // Join the hazard discussion
        await signalRService.joinHazardDiscussion(hazardData._id, (message: Message) => {
          setMessages(prev => [...prev, message]);
          // Auto-scroll to bottom when new message arrives
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        });

        // Load existing messages
        const existingMessages = await signalRService.getMessages(hazardData._id);
        setMessages(existingMessages);

        // Set up connection state listener
        const unsubscribe = signalRService.onConnectionStateChanged(setConnected);
        setConnected(signalRService.getConnectionState() === 'connected');

        // Return cleanup function
        return unsubscribe;
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        Alert.alert('Error', 'Failed to connect to chat. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();
    
    return () => {
      // Cleanup when component unmounts
      signalRService.leaveHazardDiscussion(hazardData._id);
    };
  }, [hazardData._id]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending || !connected) {
      return;
    }

    try {
      setSending(true);
      await signalRService.sendMessage(hazardData._id, messageText.trim(), username);
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getHazardIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      frost: '❄️',
      heatwave: '🔥',
      flooding: '🌊',
      wind: '💨',
      hail: '🧊',
      aphids: '🐛',
      whiteflies: '🕷️',
      blight: '🍄',
      mildew: '☁️',
      weeds: '🌿',
      pesticide: '⚠️',
      water: '💧',
      pollution: '😷',
      contamination: '☢️',
      neighboring: '🏘️',
      other: '📝',
    };
    return iconMap[type] || '📝';
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Header title="Hazard Discussion" />
      
      {/* Hazard Info Header */}
      <View style={styles.hazardInfoContainer}>
        <View style={styles.hazardHeader}>
          <Text style={styles.hazardIcon}>{getHazardIcon(hazardData.type)}</Text>
          <View style={styles.hazardDetails}>
            <Text style={styles.hazardTitle}>
              {hazardData.type.charAt(0).toUpperCase() + hazardData.type.slice(1)} Hazard
            </Text>
            <Text style={styles.hazardDistance}>
              📍 {hazardData.distance_km.toFixed(1)}km away
            </Text>
          </View>
        </View>
        <Text style={styles.hazardDescription}>
          {hazardData.description}
        </Text>
        <Text style={styles.hazardMeta}>
          Reported by {hazardData.reported_by} • {new Date(hazardData.created_at).toLocaleDateString()}
        </Text>
      </View>

      {/* Chat Area */}
      <View style={styles.chatContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Icon name="loading" size={32} color="#388e3c" />
            <Text style={styles.loadingText}>Loading chat...</Text>
          </View>
        ) : (
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer} 
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
          >
            {messages.length === 0 ? (
              <View style={styles.emptyChat}>
                <Icon name="forum-outline" size={64} color="#c8e6c9" />
                <Text style={styles.emptyChatText}>No messages yet</Text>
                <Text style={styles.emptyChatSubtext}>
                  Start the discussion about this hazard
                </Text>
              </View>
            ) : (
              messages.map((message) => (
                <View key={message.id} style={styles.messageContainer}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.messageUsername}>{message.username}</Text>
                    <Text style={styles.messageTime}>
                      {formatTimestamp(message.timestamp)}
                    </Text>
                  </View>
                  <Text style={styles.messageText}>{message.message}</Text>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* Connection Status */}
        {!connected && (
          <View style={styles.connectionStatus}>
            <Icon name="wifi-off" size={16} color="#f44336" />
            <Text style={styles.connectionStatusText}>Disconnected - Reconnecting...</Text>
          </View>
        )}

        {/* Message Input */}
        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
            editable={connected && !sending}
          />
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (messageText.trim() && connected && !sending) ? styles.sendButtonActive : styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || !connected || sending}
          >
            {sending ? (
              <Icon name="loading" size={24} color="#fff" />
            ) : (
              <Icon 
                name="send" 
                size={24} 
                color={(messageText.trim() && connected) ? '#fff' : '#ccc'} 
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6fff6',
  },
  hazardInfoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  hazardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hazardIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  hazardDetails: {
    flex: 1,
  },
  hazardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  hazardDistance: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
  },
  hazardDescription: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 8,
  },
  hazardMeta: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#388e3c',
    marginTop: 12,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messagesContent: {
    flexGrow: 1,
  },
  messageContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  messageUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 20,
  },
  emptyChat: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    flex: 1,
  },
  emptyChatText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#388e3c',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyChatSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffebee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#ffcdd2',
  },
  connectionStatusText: {
    fontSize: 12,
    color: '#f44336',
    marginLeft: 6,
    fontWeight: '500',
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#c8e6c9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#388e3c',
  },
  sendButtonDisabled: {
    backgroundColor: '#f0f0f0',
  },
});
