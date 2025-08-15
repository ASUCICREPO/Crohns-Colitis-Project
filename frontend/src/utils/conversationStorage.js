/**
 * Conversation storage utilities
 */
export const ConversationStorage = {
  /**
   * Save conversation to localStorage
   */
  saveConversation(sessionId, messageList, conversationId, lastSystemMessageId) {
    console.log('💾 DEBUG - Saving conversation for sessionId:', sessionId);
    console.log('💾 DEBUG - Message count:', messageList.length);
    console.log('💾 DEBUG - ConversationId:', conversationId);
    console.log('💾 DEBUG - LastSystemMessageId:', lastSystemMessageId);
    
    const data = {
      messageList,
      conversationId,
      lastSystemMessageId,
      timestamp: Date.now()
    };
    
    const storageKey = `chat_${sessionId}`;
    console.log('💾 DEBUG - Storage key:', storageKey);
    
    localStorage.setItem(storageKey, JSON.stringify(data));
    console.log('💾 DEBUG - Conversation saved to localStorage');
  },

  /**
   * Load conversation from localStorage
   */
  loadConversation(sessionId) {
    console.log('💾 DEBUG - Loading conversation for sessionId:', sessionId);
    
    const storageKey = `chat_${sessionId}`;
    console.log('💾 DEBUG - Storage key:', storageKey);
    
    const data = localStorage.getItem(storageKey);
    console.log('💾 DEBUG - Raw data from localStorage:', data);
    
    const result = data ? JSON.parse(data) : null;
    console.log('💾 DEBUG - Parsed conversation data:', result);
    
    return result;
  },

  /**
   * Clear conversation
   */
  clearConversation(sessionId) {
    console.log('💾 DEBUG - Clearing conversation for sessionId:', sessionId);
    
    const storageKey = `chat_${sessionId}`;
    localStorage.removeItem(storageKey);
    
    console.log('💾 DEBUG - Conversation cleared from localStorage');
  },

  /**
   * Clear all conversations (for session cleanup)
   */
  clearAllConversations() {
    console.log('💾 DEBUG - Clearing all conversations');
    
    // Find all chat-related keys
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chat_')) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all chat conversations
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('💾 DEBUG - Removed conversation:', key);
    });
    
    console.log('💾 DEBUG - All conversations cleared');
  },

  /**
   * Get saved transcripts for a session
   */
  getTranscripts(sessionId) {
    const transcripts = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`transcript_${sessionId}_`)) {
        const transcript = localStorage.getItem(key);
        const timestamp = key.split('_').pop();
        transcripts.push({ key, transcript, timestamp });
      }
    }
    return transcripts.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }
};