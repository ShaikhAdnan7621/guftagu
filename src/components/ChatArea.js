import { useState, useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatHeader from './chat/ChatHeader';
import MessagesList from './chat/MessagesList';
import MessageInput from './chat/MessageInput';
import MessageActionPanel from './chat/MessageActionPanel';

export default function ChatArea({ activeChat, messages, user, onSendMessage, onReplyMessage, onReactMessage, onEditMessage, onDeleteMessage, isLoading, onToggleSidebar, chats, onChatSelect, hasMoreMessages, loadingOlder, onLoadOlderMessages }) {
	const [newMessage, setNewMessage] = useState('');
	const [replyTo, setReplyTo] = useState(null);
	const [editingMessage, setEditingMessage] = useState(null);
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
	}, [messages.length]);



	const handleSend = () => {
		if (!newMessage.trim()) return;

		if (editingMessage) {
			onEditMessage(editingMessage._id, newMessage);
			setEditingMessage(null);
		} else if (replyTo) {
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
		setEditingMessage(message);
		setNewMessage(message.content);
		setSelectedMessage(null);
		setReplyTo(null);
	};

	const handleDelete = (message) => {
		if (window.confirm('Are you sure you want to delete this message?')) {
			onDeleteMessage(message._id);
		}
		setSelectedMessage(null);
	};

	const handleCancelEdit = () => {
		setEditingMessage(null);
		setNewMessage('');
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
				editingMessage={editingMessage}
				onCancelReply={handleCancelReply}
				onCancelEdit={handleCancelEdit}
				isLoading={isLoading}
			/>
		</div>
	);
}