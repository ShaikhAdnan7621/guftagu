class SyncManager {
  constructor() {
    this.chatStates = new Map();
  }

  getChatState(chatId) {
    if (!this.chatStates.has(chatId)) {
      this.chatStates.set(chatId, {
        lastSync: 0,
        lastMessageId: null,
        messages: [],
        pendingActions: []
      });
    }
    return this.chatStates.get(chatId);
  }

  shouldSync(chatId) {
    const state = this.getChatState(chatId);
    const timeSinceSync = Date.now() - state.lastSync;
    return timeSinceSync > 4000 || state.pendingActions.length > 0;
  }

  markSynced(chatId, timestamp = Date.now()) {
    const state = this.getChatState(chatId);
    state.lastSync = timestamp;
    this.saveToStorage(chatId, state);
  }

  saveToStorage(chatId, state) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`chat_${chatId}`, JSON.stringify({
        lastSync: state.lastSync,
        lastMessageId: state.lastMessageId
      }));
    }
  }

  loadFromStorage(chatId) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`chat_${chatId}`);
      if (stored) {
        const data = JSON.parse(stored);
        const state = this.getChatState(chatId);
        state.lastSync = data.lastSync;
        state.lastMessageId = data.lastMessageId;
      }
    }
  }
}

export const syncManager = new SyncManager();