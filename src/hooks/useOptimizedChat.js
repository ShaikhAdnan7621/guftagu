import { useState, useEffect, useCallback } from 'react';
import { syncManager } from '@/utils/syncManager';
import { activityTracker } from '@/utils/activityTracker';

export function useOptimizedChat() {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initial data fetch
  useEffect(() => {
    fetchUserData();
    fetchChats();
    fetchRequests();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  // Optimized batch sync
  const syncActiveChats = useCallback(async () => {
    const activeChats = activityTracker.getActiveChats();
    if (activeChats.length === 0) return;

    const chatRequests = activeChats
      .filter(chatId => syncManager.shouldSync(chatId))
      .map(chatId => {
        const state = syncManager.getChatState(chatId);
        return {
          chatId,
          lastSync: state.lastSync,
          lastMessageId: state.lastMessageId
        };
      });

    if (chatRequests.length === 0) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/chat/batch-updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ chats: chatRequests })
      });

      const data = await response.json();
      
      // Update local state with new messages for active chat only
      if (activeChat && data.updates[activeChat._id]) {
        const update = data.updates[activeChat._id];
        if (update.messages.length > 0) {
          setMessages(prev => {
            const currentMessages = Array.isArray(prev) ? prev : [];
            const existingIds = new Set(currentMessages.map(m => m._id));
            const newMessages = update.messages.filter(m => !existingIds.has(m._id));
            return [...currentMessages, ...newMessages];
          });
        }
        syncManager.markSynced(activeChat._id, update.lastSync);
      }

    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Setup polling for active chats only
  useEffect(() => {
    const interval = setInterval(syncActiveChats, 4000);
    return () => clearInterval(interval);
  }, [syncActiveChats]);

  // Send message
  const sendMessage = useCallback(async (content) => {
    if (!activeChat || !content.trim() || !user) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/batch-updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          chats: [],
          actions: [{
            type: 'send',
            chatId: activeChat._id,
            content
          }]
        })
      });

      if (response.ok) {
        // Reload messages after sending
        const messagesResponse = await fetch(`/api/chat/messages/${activeChat._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const messagesData = await messagesResponse.json();
        setMessages(messagesData.messages || []);
        fetchChats();
      }
    } catch (error) {
      console.error('Send message error:', error);
    }
  }, [activeChat, user, fetchChats]);

  const selectChat = useCallback((chat) => {
    setActiveChat(chat);
    activityTracker.setActiveChat(chat._id);
    
    // Load messages for selected chat
    const loadMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/chat/messages/${chat._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
      }
    };
    
    loadMessages();
  }, []);

  const acceptRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/chat/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId })
      });
      
      if (response.ok) {
        fetchRequests();
        fetchChats();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    window.location.href = '/login';
  };

  return {
    user,
    chats,
    messages,
    requests,
    activeChat,
    isLoading,
    sendMessage,
    selectChat,
    acceptRequest,
    logout
  };
}