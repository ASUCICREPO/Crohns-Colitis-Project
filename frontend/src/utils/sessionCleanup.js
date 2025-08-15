/**
 * Session cleanup utilities
 * Handles clearing cookies and conversations when user session ends
 */
import { CookieUtils } from './cookieUtils';
import { ConversationStorage } from './conversationStorage';

export const SessionCleanup = {
  /**
   * Clear current session data
   */
  clearCurrentSession() {
    console.log('🧹 DEBUG - Clearing current session');
    
    // Get current session ID before clearing
    const currentSessionId = CookieUtils.getCookie('chatSessionId');
    
    if (currentSessionId) {
      // Clear the specific conversation
      ConversationStorage.clearConversation(currentSessionId);
      console.log('🧹 DEBUG - Cleared conversation for session:', currentSessionId);
    }
    
    // Clear session cookie
    CookieUtils.clearSession();
    
    // Clear any sessionStorage items related to chat
    sessionStorage.removeItem('chatWidget_isOpen');
    sessionStorage.removeItem('chatWidget_isExpanded');
    sessionStorage.removeItem('chatbot_session');
    
    console.log('🧹 DEBUG - Session and UI state cleared');
  },

  /**
   * Clear all session data (nuclear option)
   */
  clearAllSessions() {
    console.log('🧹 DEBUG - Clearing all sessions');
    
    // Clear all conversations
    ConversationStorage.clearAllConversations();
    
    // Clear session cookie
    CookieUtils.clearSession();
    
    console.log('🧹 DEBUG - All sessions cleared');
  },

  /**
   * Setup automatic session cleanup on page/tab close
   * NOTE: This is disabled for cross-page persistence
   */
  setupAutoCleanup() {
    console.log('🧹 DEBUG - Auto-cleanup disabled for cross-page persistence');
    
    // Don't setup beforeunload handler to preserve session across pages
    // Only clear session when user explicitly closes chat
    
    // Return empty cleanup function
    return () => {
      console.log('🧹 DEBUG - Auto-cleanup cleanup function called (no-op)');
    };
  }
};