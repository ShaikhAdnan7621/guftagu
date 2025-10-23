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
		<div className="bg-surface border-t border-border p-3">
			{/* Selected Message Preview */}
			<div className="flex items-start gap-3 mb-3">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<span className="text-sm font-medium text-primary">
							{selectedMessage.sender?.username || 'Unknown'}
						</span>
						<span className="text-xs text-text-secondary">
							{new Date(selectedMessage.createdAt).toLocaleTimeString([], { 
								hour: '2-digit', 
								minute: '2-digit' 
							})}
						</span>
					</div>
					<p className="text-sm text-primary bg-bg p-2 rounded-lg truncate">
						{selectedMessage.content}
					</p>
				</div>
				<button
					onClick={onClose}
					className="p-1 hover:bg-bg rounded-full transition-colors"
				>
					<X className="w-4 h-4 text-text-secondary" />
				</button>
			</div>

			{/* Quick Reactions */}
			<div className="flex items-center gap-2 mb-3 overflow-x-auto">
				{reactions.map(emoji => (
					<button
						key={emoji}
						onClick={() => {
							onReact(selectedMessage._id, emoji);
							onClose();
						}}
						className="flex-shrink-0 p-2 hover:bg-bg rounded-full text-lg transition-all hover:scale-110"
					>
						{emoji}
					</button>
				))}
			</div>

			{/* Action Buttons */}
			<div className="flex items-center gap-2">
				<button
					onClick={() => {
						onReply(selectedMessage);
						onClose();
					}}
					className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
				>
					<Reply className="w-4 h-4" />
					Reply
				</button>

				{isOwn && (
					<>
						<button
							onClick={() => {
								onEdit(selectedMessage);
								onClose();
							}}
							className="flex items-center gap-2 px-3 py-2 bg-bg text-primary rounded-lg hover:bg-border transition-colors"
						>
							<Edit className="w-4 h-4" />
							Edit
						</button>
						<button
							onClick={() => {
								onDelete(selectedMessage);
								onClose();
							}}
							className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
						>
							<Trash2 className="w-4 h-4" />
							Delete
						</button>
					</>
				)}

				<button
					onClick={handleCopy}
					className="flex items-center gap-2 px-3 py-2 bg-bg text-primary rounded-lg hover:bg-border transition-colors"
				>
					<Copy className="w-4 h-4" />
					Copy
				</button>
			</div>
		</div>
	);
}