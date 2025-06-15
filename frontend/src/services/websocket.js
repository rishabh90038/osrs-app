class WebSocketService {
  constructor() {
    this.ws = null;
    this.subscribers = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.isConnecting = false;
    this.connectionTimeout = null;
    this.baseUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';
    this.heartbeatInterval = null;
  }

  connect() {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      console.log('WebSocket already connected or connecting');
      return;
    }

    this.isConnecting = true;

    try {
      console.log(`Attempting to connect to WebSocket at ${this.baseUrl}`);
      this.ws = new WebSocket(this.baseUrl);

      // Set connection timeout
      this.connectionTimeout = setTimeout(() => {
        if (this.ws.readyState !== WebSocket.OPEN) {
          console.warn('WebSocket connection timeout');
          this.handleConnectionFailure();
        }
      }, 5000);

      this.ws.onopen = () => {
        console.log('WebSocket connected successfully');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        clearTimeout(this.connectionTimeout);
        this.notifySubscribers({
          type: 'connection_status',
          status: 'connected'
        });

        // Start heartbeat
        this.startHeartbeat();
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.isConnecting = false;
        clearTimeout(this.connectionTimeout);
        this.stopHeartbeat();
        this.notifySubscribers({
          type: 'connection_status',
          status: 'disconnected',
          code: event.code,
          reason: event.reason
        });
        this.handleConnectionFailure();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
        clearTimeout(this.connectionTimeout);
        this.stopHeartbeat();
        this.notifySubscribers({
          type: 'connection_status',
          status: 'error',
          error: error.message || 'Unknown error'
        });
        this.handleConnectionFailure();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'heartbeat') {
            // Respond to heartbeat
            this.ws.send(JSON.stringify({ type: 'pong' }));
          } else {
            this.notifySubscribers(data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      this.isConnecting = false;
      this.stopHeartbeat();
      this.notifySubscribers({
        type: 'connection_status',
        status: 'error',
        error: error.message || 'Failed to create WebSocket connection'
      });
      this.handleConnectionFailure();
    }
  }

  startHeartbeat() {
    this.stopHeartbeat(); // Clear any existing heartbeat
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  handleConnectionFailure() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1), this.maxReconnectDelay);
      
      console.log(`Attempting to reconnect in ${delay/1000} seconds (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      this.notifySubscribers({
        type: 'connection_status',
        status: 'reconnecting',
        attempt: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
        nextAttemptIn: delay/1000
      });
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.notifySubscribers({
        type: 'connection_status',
        status: 'failed',
        message: 'Failed to establish WebSocket connection. Please refresh the page.'
      });
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    clearTimeout(this.connectionTimeout);
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    
    // Connect if not already connected
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.connect();
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0) {
        this.disconnect();
      }
    };
  }

  notifySubscribers(data) {
    this.subscribers.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  // Method to manually trigger reconnection
  reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    this.connect();
  }
}

export const websocketService = new WebSocketService(); 