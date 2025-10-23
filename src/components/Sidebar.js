import { useState } from 'react';
import { Settings, LogOut, Copy, UserPlus, RefreshCw, Clock, X } from 'lucide-react';
import { getActivityStatus, getStatusColor } from '@/utils/activityUtils';

export default function Sidebar({ user, chats, onChatSelect, activeChat, onLogout, requests, onAcceptRequest, isOpen, onClose, onOpenKeyModal }) {

	return (
		<div className={`w-full sm:w-80 md:w-80 lg:w-80 xl:w-80 bg-gradient-to-b from-bg to-bg/95 backdrop-blur-sm border-r border-border/50 flex flex-col sm:relative absolute inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out shadow-xl sm:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
			}`}>
			{/* Header */}
			<div className="p-4 bg-gradient-to-r from-primary to-primary-light text-white flex justify-between items-center shadow-sm">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
						<span className="text-sm font-bold">G</span>
					</div>
					<h1 className="text-lg font-semibold">GuftaGu</h1>
				</div>
				<button
					onClick={onClose}
					className="sm:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
				>
					<X className="w-5 h-5" />
				</button>
			</div>



			{/* Requests Section */}
			{requests.length > 0 && (
				<div className="p-2 sm:p-3 bg-accent bg-opacity-20 border-b border-border">
					<p className="text-xs font-medium text-primary mb-2">Chat Requests</p>
					{requests.map(request => (
						<div key={request._id} className="flex items-center justify-between mb-2 p-2 bg-surface rounded-lg">
							<div>
								<p className="text-xs font-medium text-primary">{request.from.username}</p>
								<p className="text-xs text-text-secondary">{request.from.email}</p>
							</div>
							<button
								onClick={() => onAcceptRequest(request._id)}
								className="py-1 px-2 bg-primary text-white text-xs rounded-lg hover:bg-primary-light transition-colors"
							>
								Accept
							</button>
						</div>
					))}
				</div>
			)}

			{/* Chat List */}
			<div className="flex-1 overflow-y-auto">
				{chats.length === 0 ? (
					<div className="p-6 text-center text-text-secondary">
						<div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
							<UserPlus className="w-8 h-8 text-primary" />
						</div>
						<p className="text-sm font-medium text-primary">No chats yet</p>
						<p className="text-xs mt-1">Generate and share your key to start chatting</p>
					</div>
				) : (
					chats.map(chat => {
						const otherUser = chat.participants.find(p => p._id !== user._id);
						const activityStatus = getActivityStatus(otherUser?.lastActive);
						return (
							<div
								key={chat._id}
								onClick={() => {
									onChatSelect(chat);
									onClose();
								}}
								className={`p-4 border-b border-border/30 cursor-pointer transition-all hover:bg-surface/50 ${activeChat?._id === chat._id
										? 'bg-primary/5 border-l-4 border-l-primary shadow-sm'
										: ''
									}`}
								style={{ touchAction: 'manipulation' }}
							>
								<div className="flex items-center gap-3">
									<div className="relative">
										<div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center shadow-sm">
											<span className="text-white font-semibold">
												{(otherUser?.username || 'U').charAt(0).toUpperCase()}
											</span>
										</div>
										<div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full ${getStatusColor(activityStatus.status)}`}></div>
									</div>
									<div className="flex-1 min-w-0">
										<div className="font-semibold text-primary truncate">
											{otherUser?.username || 'Unknown User'}
										</div>
										<div className={`text-xs font-medium mt-0.5 ${activityStatus.status === 'online' ? 'text-green-600' : 'text-text-secondary'
											}`}>
											{activityStatus.text}
										</div>
									</div>
									<div className="text-xs text-text-secondary">
										<Clock className="w-3 h-3" />
									</div>
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Bottom Actions */}
			<div className="p-4 border-t border-border/30 bg-surface/30">
				<div className="flex gap-2">
					<button
						onClick={onOpenKeyModal}
						className="flex-1 flex items-center justify-center gap-2 p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all duration-200 hover:scale-105"
					>
						<Settings className="w-4 h-4" />
						<span className="text-sm font-medium">Settings</span>
					</button>
					<button
						onClick={onLogout}
						className="flex-1 flex items-center justify-center gap-2 p-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all duration-200 hover:scale-105"
					>
						<LogOut className="w-4 h-4" />
						<span className="text-sm font-medium">Logout</span>
					</button>
				</div>
			</div>
		</div>
	);
}