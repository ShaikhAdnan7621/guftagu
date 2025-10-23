import { Reply, Edit, Trash2, Copy, MoreHorizontal, X } from 'lucide-react';

export default function MessageActionPanel({
	selectedMessage,
	isOwn,
	onReply,
	onReact,
	onEdit,
	onDelete,
	onClose
}) {
	const reactions = ['❤️', '👍', '😂', '😮', '😢', '👎', '🔥', '🎉'];

	if (!selectedMessage) return null;

	const handleCopy = () => {
		navigator.clipboard.writeText(selectedMessage.content);
		onClose();
	};

	return (
		<div className="bg-surface border-t border-border/20 px-2 py-2.5 shadow-sm backdrop-blur-sm">
			{/* Selected Message Preview */}
			<div className="flex items-start gap-2 mb-2.5">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-1.5 mb-1.5">
						<div className="h-6 w-6 bg-primary/10 rounded-lg flex items-center justify-center">
							<span className="text-xs font-medium text-primary">
								{(selectedMessage.sender?.username || 'U').charAt(0).toUpperCase()}
							</span>
						</div>
						<div className="flex items-baseline gap-1.5">
							<span className="text-xs font-medium text-primary">
								{selectedMessage.sender?.username || 'Unknown'}
							</span>
							<span className="text-[10px] text-text-secondary/75">
								{new Date(selectedMessage.createdAt).toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit'
								})}
							</span>
						</div>
					</div>
					<p className="text-xs text-primary/90 bg-bg/50 px-2.5 py-2 rounded-lg">
						{selectedMessage.content}
					</p>
				</div>
				<button
					onClick={onClose}
					className="p-1.5 hover:bg-bg/50 rounded-lg transition-all duration-200"
				>
					<X className="w-3.5 h-3.5 text-text-secondary/75 hover:text-primary/90" />
				</button>
			</div>

			{/* Quick Reactions & Actions */}
			<div className="flex items-center justify-between gap-1.5 px-0.5">
				<div className="flex items-center gap-0.5 overflow-x-auto scrollbar-none">
					{reactions.map(emoji => (
						<button
							key={emoji}
							onClick={() => {
								onReact(selectedMessage._id, emoji);
								onClose();
							}}
							className="flex-shrink-0 p-1.5 hover:bg-bg/50 rounded-lg text-sm transition-all duration-200 hover:scale-110"
						>
							{emoji}
						</button>
					))}
				</div>

				<div className="flex items-center gap-1">
					<button
						onClick={() => {
							onReply(selectedMessage);
							onClose();
						}}
						className="p-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-all duration-200"
					>
						<Reply className="w-3.5 h-3.5" />
					</button>

					{isOwn && (
						<>
							<button
								onClick={() => {
									onEdit(selectedMessage);
									onClose();
								}}
								className="p-1.5 bg-bg/50 hover:bg-bg text-primary/75 hover:text-primary rounded-lg transition-all duration-200"
							>
								<Edit className="w-3.5 h-3.5" />
							</button>
							<button
								onClick={() => {
									if (window.confirm('Delete this message?')) {
										onDelete(selectedMessage);
										onClose();
									}
								}}
								className="p-1.5 bg-red-50/50 hover:bg-red-50 text-red-500/75 hover:text-red-500 rounded-lg transition-all duration-200"
							>
								<Trash2 className="w-3.5 h-3.5" />
							</button>
						</>
					)}

					<button
						onClick={handleCopy}
						className="p-1.5 bg-bg/50 hover:bg-bg text-primary/75 hover:text-primary rounded-lg transition-all duration-200"
					>
						<Copy className="w-3.5 h-3.5" />
					</button>
				</div>
			</div>
		</div>
	);
}