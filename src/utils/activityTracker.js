class ActivityTracker {
	constructor() {
		this.activeChats = new Set();
		this.lastActivity = new Map();
		this.isClient = typeof window !== 'undefined';
		if (this.isClient) {
			this.setupTracking();
		}
	}

	setupTracking() {
		['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
			document.addEventListener(event, () => {
				this.updateActivity();
			});
		});

		document.addEventListener('visibilitychange', () => {
			if (document.hidden) {
				this.activeChats.clear();
			}
		});
	}

	setActiveChat(chatId) {
		this.activeChats.add(chatId);
		this.lastActivity.set(chatId, Date.now());
	}

	removeActiveChat(chatId) {
		this.activeChats.delete(chatId);
	}

	getActiveChats() {
		const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
		const active = [];

		for (const [chatId, lastTime] of this.lastActivity) {
			if (lastTime > fiveMinutesAgo) {
				active.push(chatId);
			}
		}

		return active;
	}

	updateActivity() {
		const now = Date.now();
		for (const chatId of this.activeChats) {
			this.lastActivity.set(chatId, now);
		}
	}
}

export const activityTracker = new ActivityTracker();