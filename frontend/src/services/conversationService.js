import CONFIG from '../config';

/**
 * Service for conversation management
 */
class ConversationService {
  /**
   * Retrieve conversation from backend
   */
  static async getConversation(sessionId) {
    try {
      const endpoint = CONFIG.api.conversationEndpoint;
      const response = await fetch(`${endpoint}?sessionId=${sessionId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.conversation;
    } catch (error) {
      console.error('Conversation retrieval error:', error);
      return null;
    }
  }
}

export default ConversationService;