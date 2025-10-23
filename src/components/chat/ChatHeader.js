import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { getActivityStatus, getStatusColor } from '@/utils/activityUtils';

export default function ChatHeader({ activeChat, chats, user, onChatSelect, onToggleSidebar }) {
	const otherUser = activeChat.participants.find(p => p._id !== user._id);
	const activityStatus = getActivityStatus(otherUser?.lastActive);

	return (
		<div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-surface to-surface/95 backdrop-blur-sm border-b border-border/50 shadow-sm">
			<div className="flex items-center gap-4">
				<button
					onClick={onToggleSidebar}
					className="sm:hidden p-2.5 text-primary hover:bg-primary/10 rounded-xl transition-all duration-200 hover:scale-105"
				>
					<Menu className="w-5 h-5" />
				</button>

				{chats.length > 1 && (
					<button
						onClick={() => {
							const currentIndex = chats.findIndex(c => c._id === activeChat._id);
							const prevIndex = currentIndex > 0 ? currentIndex - 1 : chats.length - 1;
							onChatSelect(chats[prevIndex]);
						}}
						className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-200"
					>
						<ChevronLeft className="w-4 h-4" />
					</button>
				)}

				<div className="flex items-center gap-3 flex-1">
					<div className="relative">
						<div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center shadow-md">
							<span className="text-white font-semibold text-sm">
								{(otherUser?.username || 'U').charAt(0).toUpperCase()}
							</span>
						</div>
						<div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${getStatusColor(activityStatus.status)}`}></div>
					</div>

					<div className="flex-1">
						<h2 className="font-semibold text-primary text-base sm:text-lg leading-tight">
							{otherUser?.username || 'Unknown User'}
						</h2>
						<div className="flex items-center gap-2 mt-0.5">
							<div className={`w-2 h-2 rounded-full ${getStatusColor(activityStatus.status)}`}></div>
							<p className="text-xs text-text-secondary font-medium">{activityStatus.text}</p>
							{chats.length > 1 && (
								<span className="text-xs text-text-secondary">• Chat {chats.findIndex(c => c._id === activeChat._id) + 1} of {chats.length}</span>
							)}
						</div>
					</div>
				</div>

				{chats.length > 1 && (
					<button
						onClick={() => {
							const currentIndex = chats.findIndex(c => c._id === activeChat._id);
							const nextIndex = currentIndex < chats.length - 1 ? currentIndex + 1 : 0;
							onChatSelect(chats[nextIndex]);
						}}
						className="p-2 text-text-secondary hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-200"
					>
						<ChevronRight className="w-4 h-4" />
					</button>
				)}
			</div>
		</div>
	);
}