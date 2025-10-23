export default function MessageActions({ message, onReact, user }) {
	return (
		<div>
			{/* Reactions Display */}
			{message.reactions && message.reactions.length > 0 && (
				<div className="flex flex-wrap gap-1 mt-1" >
					{message.reactions.map((reaction, idx) => (
						<button
							key={`${reaction.emoji}-${idx}`}
							onClick={() => onReact(message._id, reaction.emoji)}
							className={`inline-flex items-center px-2 py-1 text-xs rounded-full transition-all ${reaction.users.some(u => u._id === user?._id)
									? 'bg-primary text-white ml-auto'
									: 'bg-surface text-primary border mr-auto'
								}`}
						>
							<span className="mr-1">{reaction.emoji}</span>
							{reaction.users.length > 1 && (
								<span className="text-xs">{reaction.users.length}</span>
							)}
						</button>
					))}
				</div>
			)}
		</div>
	);
}