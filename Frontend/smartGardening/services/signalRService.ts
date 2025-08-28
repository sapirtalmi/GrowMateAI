import { HubConnectionBuilder, LogLevel, HubConnection } from '@microsoft/signalr';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Message {
  id: string;
  hazardId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

class SignalRService {
  private connection: HubConnection | null = null;
  private connectionState: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  private messageCallbacks: Map<string, (message: Message) => void> = new Map();
  private connectionCallbacks: Set<(connected: boolean) => void> = new Set();

  async initializeConnection(): Promise<void> {
    if (this.connection && this.connectionState !== 'disconnected') {
      return;
    }

    try {
      this.connectionState = 'connecting';
      
      // Get auth token
      const token = await AsyncStorage.getItem('authToken');
      
      // First, get the SignalR connection info from the negotiate endpoint
      const negotiateResponse = await fetch('https://smartgardeningfunctions.azurewebsites.net/api/negotiate-basic', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!negotiateResponse.ok) {
        const errorText = await negotiateResponse.text();
        console.error('❌ Negotiate response error:', {
          status: negotiateResponse.status,
          statusText: negotiateResponse.statusText,
          body: errorText
        });
        throw new Error(`Negotiate failed: ${negotiateResponse.status} ${negotiateResponse.statusText} - ${errorText}`);
      }

      const connectionInfo = await negotiateResponse.json();
      console.log('📡 SignalR connection info received:', {
        url: connectionInfo.url,
        hasAccessToken: !!connectionInfo.accessToken,
        tokenLength: connectionInfo.accessToken?.length
      });

      // Build connection using the negotiated URL and access token
      this.connection = new HubConnectionBuilder()
        .withUrl(connectionInfo.url, {
          accessTokenFactory: () => {
            console.log('🔑 AccessToken factory called');
            return connectionInfo.accessToken || '';
          },
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      // Set up event handlers
      this.connection.on('newMessage', (message: Message) => {
        console.log('📨 Received SignalR message:', message);
        const callback = this.messageCallbacks.get(message.hazardId);
        if (callback) {
          callback(message);
        }
      });

      this.connection.onclose(() => {
        console.log('🔌 SignalR connection closed');
        this.connectionState = 'disconnected';
        this.notifyConnectionCallbacks(false);
      });

      this.connection.onreconnecting(() => {
        console.log('🔄 SignalR reconnecting...');
        this.connectionState = 'connecting';
        this.notifyConnectionCallbacks(false);
      });

      this.connection.onreconnected(() => {
        console.log('✅ SignalR reconnected');
        this.connectionState = 'connected';
        this.notifyConnectionCallbacks(true);
      });

      // Start connection
      await this.connection.start();
      this.connectionState = 'connected';
      this.notifyConnectionCallbacks(true);
      
      console.log('✅ SignalR connection established');
    } catch (error) {
      console.error('❌ SignalR connection failed:', error);
      this.connectionState = 'disconnected';
      this.notifyConnectionCallbacks(false);
      throw error;
    }
  }

  async joinHazardDiscussion(hazardId: string, onMessageReceived: (message: Message) => void): Promise<void> {
    if (!this.connection || this.connectionState !== 'connected') {
      await this.initializeConnection();
    }

    try {
      // Register message callback
      this.messageCallbacks.set(hazardId, onMessageReceived);

      // Join SignalR group via Azure Functions SignalR group management
      // Note: The connection ID is managed automatically by the SignalR service
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('https://smartgardeningfunctions.azurewebsites.net/api/joinhazarddiscussion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          hazardId,
          connectionId: this.connection?.connectionId || 'auto',
          action: 'join'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to join discussion: ${response.statusText} - ${errorText}`);
      }

      console.log(`✅ Joined hazard discussion: ${hazardId}`);
    } catch (error) {
      console.error('❌ Failed to join hazard discussion:', error);
      throw error;
    }
  }

  async leaveHazardDiscussion(hazardId: string): Promise<void> {
    if (!this.connection || this.connectionState !== 'connected') {
      return;
    }

    try {
      // Remove message callback
      this.messageCallbacks.delete(hazardId);

      // Leave SignalR group via API
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('https://smartgardeningfunctions.azurewebsites.net/api/joinhazarddiscussion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          hazardId,
          connectionId: this.connection?.connectionId,
          action: 'leave'
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to leave discussion: ${response.statusText}`);
      }

      console.log(`✅ Left hazard discussion: ${hazardId}`);
    } catch (error) {
      console.error('❌ Failed to leave hazard discussion:', error);
    }
  }

  async sendMessage(hazardId: string, message: string, username: string): Promise<void> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch('https://smartgardeningfunctions.azurewebsites.net/api/sendhazardmessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          hazardId,
          message,
          username
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  }

  async getMessages(hazardId: string): Promise<Message[]> {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await fetch(`https://smartgardeningfunctions.azurewebsites.net/api/gethazardmessages/${hazardId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get messages: ${response.statusText}`);
      }

      const data = await response.json();
      return data.messages || [];
    } catch (error) {
      console.error('❌ Failed to get messages:', error);
      throw error;
    }
  }

  onConnectionStateChanged(callback: (connected: boolean) => void): () => void {
    this.connectionCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  private notifyConnectionCallbacks(connected: boolean): void {
    this.connectionCallbacks.forEach(callback => callback(connected));
  }

  getConnectionState(): 'disconnected' | 'connecting' | 'connected' {
    return this.connectionState;
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.connectionState = 'disconnected';
      this.messageCallbacks.clear();
      this.notifyConnectionCallbacks(false);
    }
  }
}

export default new SignalRService();
export type { Message };
