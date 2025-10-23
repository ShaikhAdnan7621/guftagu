"use client"

import { useState } from 'react';
import { useOptimizedChat } from '@/hooks/useOptimizedChat';
import Sidebar from '@/components/Sidebar';
import ChatArea from '@/components/ChatArea';
import KeyModal from '@/components/KeyModal';

export default function Chat() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [showKeyModal, setShowKeyModal] = useState(false);

	const {
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
	} = useOptimizedChat();


	const handleChatSelect = (chat) => {
		selectChat(chat);
		setSidebarOpen(false); // Close sidebar on mobile when chat is selected
	};

	if (!user) {
		return (
			<div className="h-screen flex items-center justify-center bg-[#F4F3EE]">
				<div className="text-[#463F3A] text-lg">Loading...</div>
			</div>
		);
	}

	return (
		<div className="h-dvh flex bg-[#BCB8B1] relative overflow-hidden">
			{/* Mobile overlay */}
			{sidebarOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-20 sm:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			)}

			<Sidebar
				user={user}
				chats={chats}
				requests={requests}
				onChatSelect={handleChatSelect}
				activeChat={activeChat}
				onLogout={logout}
				onAcceptRequest={acceptRequest}
				isLoading={isLoading}
				isOpen={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				onOpenKeyModal={() => setShowKeyModal(true)}
			/>
			<ChatArea
				activeChat={activeChat}
				messages={messages}
				user={user}
				chats={chats}
				onSendMessage={sendMessage}
				onReplyMessage={replyMessage}
				onReactMessage={reactMessage}
				onEditMessage={editMessage}
				onDeleteMessage={deleteMessage}
				onChatSelect={selectChat}
				isLoading={isLoading}
				hasMoreMessages={hasMoreMessages}
				loadingOlder={loadingOlder}
				onLoadOlderMessages={loadOlderMessages}
				onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
			/>

			<KeyModal
				user={user}
				isOpen={showKeyModal}
				onClose={() => setShowKeyModal(false)}
			/>
		</div>
	);
}