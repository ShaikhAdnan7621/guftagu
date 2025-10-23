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
	const [hasMoreMessages, setHasMoreMessages] = useState(true);
	const [loadingOlder, setLoadingOlder] = useState(false);

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
			const chatList = data.chats || [];
			setChats(chatList);

			// Auto-select first chat if no active chat and chats exist
			if (!activeChat && chatList.length > 0) {
				const firstChat = chatList[0];
				setActiveChat(firstChat);
				activityTracker.setActiveChat(firstChat._id);

				// Load messages for first chat
				const messagesResponse = await fetch(`/api/chat/messages/${firstChat._id}`, {
					headers: { Authorization: `Bearer ${token}` }
				});
				const messagesData = await messagesResponse.json();
				setMessages(messagesData.messages || []);
				setHasMoreMessages(messagesData.hasMore || false);
			}
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
						// Combine and sort by createdAt to maintain chronological order
						const allMessages = [...currentMessages, ...newMessages];
						return allMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
					});
				}
				syncManager.markSynced(activeChat._id, update.lastSync);
			}

		} catch (error) {
			console.error('Sync failed:', error);
		} finally {
			setIsLoading(false);
		}
	}, [activeChat]);

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
				const data = await response.json();
				console.log('Frontend received:', data);
				const actionResult = data.actionResults[0];
				console.log('Action result:', actionResult);

				if (actionResult?.success) {
					console.log('Adding message to state:', actionResult.message);
					setMessages(prev => {
						const currentMessages = Array.isArray(prev) ? prev : [];
						const existingIds = new Set(currentMessages.map(m => m._id));
						if (!existingIds.has(actionResult.message._id)) {
							const newMessages = [...currentMessages, actionResult.message];
							// Sort by createdAt to maintain chronological order
							const sortedMessages = newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
							return sortedMessages;
						}
						return currentMessages;
					});
				}
				fetchChats();
			}
		} catch (error) {
			console.error('Send message error:', error);
		}
	}, [activeChat, user, fetchChats]);

	// Reply to message
	const replyMessage = useCallback(async (content, replyToId) => {
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
						type: 'reply',
						chatId: activeChat._id,
						content,
						replyTo: replyToId
					}]
				})
			});

			if (response.ok) {
				const data = await response.json();
				const actionResult = data.actionResults[0];

				if (actionResult?.success) {
					setMessages(prev => {
						const currentMessages = Array.isArray(prev) ? prev : [];
						const existingIds = new Set(currentMessages.map(m => m._id));
						if (!existingIds.has(actionResult.message._id)) {
							const newMessages = [...currentMessages, actionResult.message];
							return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
						}
						return currentMessages;
					});
				}
				fetchChats();
			}
		} catch (error) {
			console.error('Reply message error:', error);
		}
	}, [activeChat, user, fetchChats]);

	// React to message
	const reactMessage = useCallback(async (messageId, emoji) => {
		if (!activeChat || !user) return;

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
						type: 'react',
						messageId,
						emoji
					}]
				})
			});

			if (response.ok) {
				const data = await response.json();
				const actionResult = Object.values(data.actionResults)[0];

				if (actionResult?.success) {
					setMessages(prev =>
						prev.map(msg =>
							msg._id === messageId ? {
								...msg,
								reactions: actionResult.message.reactions
							} : msg
						)
					);
				}
			}
		} catch (error) {
			console.error('React message error:', error);
		}
	}, [activeChat, user]);

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
				setHasMoreMessages(data.hasMore || false);
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

	const loadOlderMessages = useCallback(async () => {
		if (!activeChat || loadingOlder || !hasMoreMessages) return;

		try {
			setLoadingOlder(true);
			const token = localStorage.getItem('token');
			const offset = messages.length;

			const response = await fetch(`/api/chat/messages/${activeChat._id}?offset=${offset}&limit=30`, {
				headers: { Authorization: `Bearer ${token}` }
			});

			if (response.ok) {
				const data = await response.json();
				if (data.messages.length > 0) {
					setMessages(prev => {
						const combined = [...data.messages, ...prev];
						return combined.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
					});
				}
				setHasMoreMessages(data.hasMore || false);
			}
		} catch (error) {
			console.error('Error loading older messages:', error);
		} finally {
			setLoadingOlder(false);
		}
	}, [activeChat, messages.length, loadingOlder, hasMoreMessages]);

	// Edit message
	const editMessage = useCallback(async (messageId, content) => {
		if (!content.trim() || !user) return;

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
						type: 'edit',
						messageId,
						content
					}]
				})
			});

			if (response.ok) {
				const data = await response.json();
				const actionResult = data.actionResults[0];

				if (actionResult?.success) {
					setMessages(prev =>
						prev.map(msg =>
							msg._id === messageId ? {
								...msg,
								content: actionResult.message.content
							} : msg
						)
					);
				}
			}
		} catch (error) {
			console.error('Edit message error:', error);
		}
	}, [user]);

	// Delete message
	const deleteMessage = useCallback(async (messageId) => {
		if (!user) return;

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
						type: 'delete',
						messageId
					}]
				})
			});

			if (response.ok) {
				const data = await response.json();
				const actionResult = data.actionResults[0];

				if (actionResult?.success) {
					setMessages(prev => prev.filter(msg => msg._id !== messageId));
				}
			}
		} catch (error) {
			console.error('Delete message error:', error);
		}
	}, [user]);



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
		hasMoreMessages,
		loadingOlder,
		sendMessage,
		replyMessage,
		reactMessage,
		editMessage,
		deleteMessage,
		selectChat,
		acceptRequest,
		loadOlderMessages,
		logout
	};
}