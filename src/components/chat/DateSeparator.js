export default function DateSeparator({ date }) {
	const formatDateSeparator = (date) => {
		const today = new Date().toDateString();
		const yesterday = new Date(Date.now() - 86400000).toDateString();
		const messageDate = new Date(date).toDateString();

		if (messageDate === today) return 'Today';
		if (messageDate === yesterday) return 'Yesterday';
		return new Date(date).toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	return (
		<div className="flex justify-center my-4">
			<div className="bg-opacity-10 px-3 py-1 rounded-full">
				<p className="text-xs  font-thin text-primary">
					{formatDateSeparator(date)}
				</p>
			</div>
		</div>
	);
}