import { useState, useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatHeader from './chat/ChatHeader';
import MessagesList from './chat/MessagesList';
import MessageInput from './chat/MessageInput';
import MessageActionPanel from './chat/MessageActionPanel';

export default function ChatArea({ activeChat, messages, user, onSendMessage, onReplyMessage, onReactMessage, isLoading, onToggleSidebar, chats, onChatSelect, hasMoreMessages, loadingOlder, onLoadOlderMessages }) {
	const [newMessage, setNewMessage] = useState('');
	const [replyTo, setReplyTo] = useState(null);
	const [selectedMessage, setSelectedMessage] = useState(null);
	const messagesEndRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({
			behavior: 'smooth',
			block: 'end'
		});
	};

	useEffect(() => {
		if (messages.length > 0) {
			setTimeout(scrollToBottom, 100);
		}
	}, [messages]);

	const handleSend = () => {
		if (!newMessage.trim()) return;

		if (replyTo) {
			onReplyMessage(newMessage, replyTo._id);
			setReplyTo(null);
		} else {
			onSendMessage(newMessage);
		}
		setNewMessage('');
		
		// Keep focus on input to prevent keyboard from disappearing
		setTimeout(() => {
			const input = document.querySelector('input[type="text"]');
			if (input) input.focus();
			scrollToBottom();
		}, 50);
	};

	const handleReply = (message) => {
		setReplyTo(message);
	};

	const handleReact = (messageId, emoji) => {
		if (onReactMessage) {
			onReactMessage(messageId, emoji);
		}
	};

	const handleCancelReply = () => {
		setReplyTo(null);
	};

	const handleShowReactionPanel = (message) => {
		setSelectedMessage(message);
	};

	const handleEdit = (message) => {
		// TODO: Implement edit functionality
		console.log('Edit message:', message);
		setSelectedMessage(null);
	};

	const handleDelete = (message) => {
		// TODO: Implement delete functionality
		console.log('Delete message:', message);
		setSelectedMessage(null);
	};

	if (!activeChat) {
		return (
			<div className="flex-1 flex flex-col bg-bg">
				<ChatHeader 
					activeChat={{ participants: [{ username: 'GuftaGu' }] }}
					chats={[]}
					user={user}
					onChatSelect={() => {}}
					onToggleSidebar={onToggleSidebar}
				/>

				<div className="flex-1 flex items-center justify-center px-4">
					<div className="text-center text-text-secondary">
						<MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50 flex-shrink-0" />
						<p className="text-heading-md text-primary">Welcome to GuftaGu</p>
						<p className="text-body-sm mt-1">Select a chat to start messaging</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div 
			className="flex-1 flex flex-col bg-bg w-full sm:w-auto relative"
			style={{ 
				height: '100dvh',
				maxHeight: '100dvh',
				overflowY: 'hidden'
			}}
		>
			<ChatHeader 
				activeChat={activeChat}
				chats={chats}
				user={user}
				onChatSelect={onChatSelect}
				onToggleSidebar={onToggleSidebar}
			/>

			<MessagesList 
				messages={messages}
				user={user}
				onReply={handleReply}
				onReact={handleReact}
				onEdit={handleEdit}
				onDelete={handleDelete}
				onShowReactionPanel={handleShowReactionPanel}
				messagesEndRef={messagesEndRef}
				hasMoreMessages={hasMoreMessages}
				loadingOlder={loadingOlder}
				onLoadOlderMessages={onLoadOlderMessages}
			/>

			{selectedMessage && (
				<MessageActionPanel
					selectedMessage={selectedMessage}
					isOwn={selectedMessage.sender._id === user._id}
					onReply={handleReply}
					onReact={handleReact}
					onEdit={handleEdit}
					onDelete={handleDelete}
					onClose={() => setSelectedMessage(null)}
				/>
			)}

			<MessageInput 
				value={newMessage}
				onChange={(e) => setNewMessage(e.target.value)}
				onSend={handleSend}
				replyTo={replyTo}
				onCancelReply={handleCancelReply}
				isLoading={isLoading}
			/>
		</div>
	);
}