import { useRef } from 'react';
import DateSeparator from './DateSeparator';
import MessageActions from './MessageActions';

export default function MessagesList({
	messages,
	user,
	onReply,
	onReact,
	onEdit,
	onDelete,
	onShowReactionPanel,
	messagesEndRef,
	hasMoreMessages,
	loadingOlder,
	onLoadOlderMessages
}) {
	const messagesContainerRef = useRef(null);

	const handleScroll = () => {
		if (!messagesContainerRef.current || loadingOlder || !hasMoreMessages) return;
		
		if (messagesContainerRef.current.scrollTop === 0) {
			onLoadOlderMessages();
		}
	};
	const getMessageStyle = (message, index, allMessages) => {
		const isOwn = message.sender?._id === user?._id;
		const prevMsg = allMessages[index - 1];
		const nextMsg = allMessages[index + 1];

		const isSameSenderPrev = prevMsg && prevMsg.sender._id === message.sender._id;
		const isSameSenderNext = nextMsg && nextMsg.sender._id === message.sender._id;

		const prevTime = prevMsg ? new Date(prevMsg.createdAt).getTime() : 0;
		const currentTime = new Date(message.createdAt).getTime();
		const nextTime = nextMsg ? new Date(nextMsg.createdAt).getTime() : 0;

		const isGroupedWithPrev = isSameSenderPrev && (currentTime - prevTime) < 300000;
		const isGroupedWithNext = isSameSenderNext && (nextTime - currentTime) < 300000;

		return {
			marginBottom: isGroupedWithNext ? '3px' : '12px',
			showTimestamp: !isGroupedWithPrev,
			borderRadius: isOwn
				? (isGroupedWithPrev && isGroupedWithNext ? '18px 6px 6px 18px'
					: isGroupedWithPrev ? '18px 6px 18px 18px'
						: isGroupedWithNext ? '18px 18px 6px 18px'
							: '18px')
				: (isGroupedWithPrev && isGroupedWithNext ? '6px 18px 18px 6px'
					: isGroupedWithPrev ? '6px 18px 18px 18px'
						: isGroupedWithNext ? '18px 18px 18px 6px'
							: '18px')
		};
	};

	const shouldShowDateSeparator = (message, index, allMessages) => {
		if (index === 0) return true;
		const prevMsg = allMessages[index - 1];
		const currentDate = new Date(message.createdAt).toDateString();
		const prevDate = new Date(prevMsg.createdAt).toDateString();
		return currentDate !== prevDate;
	};

	return (
		<div
			ref={messagesContainerRef}
			className="flex-1 overflow-y-auto px-2 py-4"
			onScroll={handleScroll}
			style={{
				minHeight: 0,
				paddingBottom: 'env(keyboard-inset-height, 0px)'
			}}
		>
			{loadingOlder && (
				<div className="text-center py-2">
					<div className="text-text-secondary text-sm">Loading older messages...</div>
				</div>
			)}
			
			{!Array.isArray(messages) || messages.length === 0 ? (
				<div className="text-center text-text-secondary mt-12">
					<p className="text-heading-sm">No messages yet</p>
					<p className="text-caption mt-1">Start the conversation!</p>
				</div>
			) : (
				messages.map((message, index) => {
					const messageStyle = getMessageStyle(message, index, messages);
					const isOwn = message.sender?._id === user?._id;
					const showDateSeparator = shouldShowDateSeparator(message, index, messages);

					return (
						<div key={`${message._id}-${index}`}>
							{showDateSeparator && <DateSeparator date={message.createdAt} />}

							<div
								className={`group flex ${isOwn ? 'justify-end' : 'justify-start'}`}
								style={{ marginBottom: messageStyle.marginBottom }}
							>
								<div className="relative max-w-[75%] sm:max-w-[70%]">
									{messageStyle.showTimestamp && (
										<p className={`message-timestamp text-text-secondary opacity-75 mb-1 text-xs ${
											isOwn ? 'text-right' : 'text-left'
										}`}>
											{message._id.startsWith('temp-')
												? 'Sending...'
												: new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
											}
										</p>
									)}
									{/* Message Bubble */}
									<div
										className={`px-3 py-2 relative cursor-pointer ${isOwn
											? message._id.startsWith('temp-')
												? 'bg-primary-light text-white opacity-70'
												: 'bg-primary text-white'
											: 'bg-surface text-primary shadow-sm'
											}`}
										style={{ borderRadius: messageStyle.borderRadius }}
										onDoubleClick={() => onShowReactionPanel && onShowReactionPanel(message)}
									>
										{/* Reply Context */}
										{message.replyTo && (
											<div className={`mb-2 p-2 rounded-lg border-l-2 text-xs ${isOwn
												? 'bg-white bg-opacity-20 border-white border-opacity-40'
												: 'bg-bg border-primary border-opacity-30'
												}`}>
												<p className="text-caption font-medium opacity-90">{message.replyTo.sender?.username}</p>
												<p className="text-caption opacity-75 truncate mt-0.5">{message.replyTo.content}</p>
											</div>
										)}

										{/* Message Content with inline reactions */}
											<div className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
											<p className="message-content break-words select-text flex-1">{message.content}</p>
											{/* Reactions on opposite side */}
											{message.reactions && message.reactions.length > 0 && (
												<div className="flex gap-1 flex-shrink-0">
													{message.reactions.map((reaction, idx) => (
														<button
															key={`${reaction.emoji}-${idx}`}
															onClick={() => onReact(message._id, reaction.emoji)}
															className={`inline-flex items-center px-1.5 py-0.5 text-xs rounded-full transition-all ${
																reaction.users.some(u => u._id === user?._id)
																	? (isOwn ? 'bg-gray-200 text-gray-800' : 'bg-primary-light text-white')
																	: (isOwn ? 'bg-gray-100 text-gray-600' : 'bg-gray-200 text-gray-700')
															}`}
														>
															<span className="text-xs">{reaction.emoji}</span>
															{reaction.users.length > 1 && (
																<span className="ml-1 text-xs">{reaction.users.length}</span>
															)}
														</button>
													))}
												</div>
											)}
										</div>


									</div>
								</div>
							</div>
						</div>
					);
				})
			)}
			<div ref={messagesEndRef} />
		</div>
	);
}