export const getActivityStatus = (lastActive, isOnline = false) => {
	if (isOnline) {
		return { status: 'online', text: 'Online' };
	}

	if (!lastActive) return { status: 'offline', text: 'Last seen a while ago' };

	const now = new Date();
	const lastActiveDate = new Date(lastActive);
	const diffMinutes = Math.floor((now - lastActiveDate) / (1000 * 60));

	// If user was active in last 2 minutes, show as online
	if (diffMinutes <= 2) {
		return { status: 'online', text: 'Online' };
	}

	// Show Instagram-like last seen format
	if (diffMinutes < 60) {
		return {
			status: 'away',
			text: diffMinutes <= 5 ? 'Last seen recently' : `Last seen ${diffMinutes}m ago`
		};
	} else if (diffMinutes < 1440) { // Less than 24 hours
		const hours = Math.floor(diffMinutes / 60);
		return {
			status: 'away',
			text: `Last seen ${hours}h ago`
		};
	} else if (diffMinutes < 10080) { // Less than 7 days
		const days = Math.floor(diffMinutes / 1440);
		return {
			status: 'offline',
			text: `Last seen ${days}d ago`
		};
	} else {
		return {
			status: 'offline',
			text: 'Last seen a while ago'
		};
	}
};

export const getStatusColor = (status) => {
	switch (status) {
		case 'online': return 'bg-green-500';
		case 'away': return 'bg-yellow-500';
		case 'offline': return 'bg-gray-400';
		default: return 'bg-gray-400';
	}
};