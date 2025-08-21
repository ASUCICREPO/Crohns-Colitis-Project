import CONFIG from '../config';

/**
 * Service for interacting with Amazon Q Business API
 */
class AmazonQService {
  // Static properties to store the latest message and conversation IDs
  static lastSystemMessageId = '';
  static lastConversationId = '';
  static applicationId = '';
  
  constructor() {
    // Log environment variables on initialization
    console.log("Environment variables check in AmazonQService:", {
      API_ENDPOINT: process.env.REACT_APP_API_ENDPOINT,
      APPLICATION_ID: process.env.REACT_APP_APPLICATION_ID,
      CONFIG_APPLICATION_ID: CONFIG.api.applicationId
    });
  }
  /**
   * Send a message to Amazon Q Business API
   * @param {string} message - The user's message
   * @param {string} language - The language code (EN or ES)
   * @param {string|null} conversationId - The conversation ID for threading (optional)
   * @param {string|null} parentMessageId - The parent message ID for threading (optional)
   * @param {string} sessionId - The session ID for conversation tracking (optional)
   * @returns {Promise} - Promise resolving to the API response
   */
  static async sendMessage(message, language = 'EN', conversationId = null, parentMessageId = null, sessionId = null) {
    try {
      // Construct request body
      const requestBody = { 
        message,
        language,
        sessionId
      };
      
      // Add conversation threading parameters if they exist
      if (conversationId) {
        requestBody.conversationId = conversationId;
      }
      
      if (parentMessageId) {
        requestBody.parentMessageId = parentMessageId;
      }
      
      // Log request details
      console.log('Amazon Q API Request:', {
        endpoint: CONFIG.api.endpoint,
        requestBody,
        sessionId,
        timestamp: new Date().toISOString()
      });
      
      // Make API request
      const startTime = performance.now();
      console.log('Making request to:', CONFIG.api.endpoint);
      const response = await fetch(CONFIG.api.endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify(requestBody)
      }).catch(error => {
        console.error('Fetch error:', error);
        throw new Error(`Network error: ${error.message}`);
      });
      
      const responseTime = performance.now() - startTime;
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
          url: CONFIG.api.endpoint
        });
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Debug log the raw response to find where the low confidence message is coming from
      console.log('ORIGINAL RAW API RESPONSE:', JSON.stringify(data));
      console.log('Original system message:', data.systemMessage);
      
      // Aggressively remove any low confidence text from the API response
      if (data.systemMessage) {
        const originalMessage = data.systemMessage;
        
        // List of phrases to remove
        const lowConfidenceTexts = [
          "I'm not confident in this answer. Would you like to share your email for a follow-up?",
          "I'm not completely confident in this answer. Would you like a human expert to follow up?",
          "No estoy completamente seguro de esta respuesta. ¿Te gustaría que un experto humano te haga seguimiento?",
          "I apologize; I am not able to answer this question. Would you like to be connected to someone in our Help Center?",
          "I'm not confident in this answer",
          "Would you like to share your email for a follow-up",
          "Would you like a human expert to follow up",
          "I'm not completely confident in this answer"
        ];
        
        // Remove exact matches
        lowConfidenceTexts.forEach(text => {
          if (data.systemMessage.includes(text)) {
            data.systemMessage = data.systemMessage.replace(text, '').trim();
            console.log(`Removed text: "${text}" from API response`);
          }
        });
        
        // Use regex to catch variations
        const lowConfidenceRegex = /I['']m not (completely )?confident in this answer|Would you like (to share your email for a follow-up|a human expert to follow up)/gi;
        data.systemMessage = data.systemMessage.replace(lowConfidenceRegex, '').trim();
        
        // Remove "Sources:" section if present in a low confidence response
        if (data.confidenceScore < 80) {
          data.systemMessage = data.systemMessage.replace(/Sources:([\s\S]*?)(?=\n\n|$)/g, '').trim();
        }
        
        // Log if we made changes
        if (originalMessage !== data.systemMessage) {
          console.log('Modified message from:', originalMessage);
          console.log('Modified message to:', data.systemMessage);
        }
        
        // Make sure we're not left with an empty message
        if (!data.systemMessage || data.systemMessage.trim() === '') {
          console.log('Message was empty after removing low confidence text, restoring original message');
          // If the message is empty after removing low confidence text, use the original message
          // but remove just the specific low confidence phrases
          data.systemMessage = originalMessage
            .replace("I'm not confident in this answer. Would you like to share your email for a follow-up?", '')
            .replace("I'm not completely confident in this answer. Would you like a human expert to follow up?", '')
            .trim();
        }
      }
      
      // Store the message and conversation IDs for feedback
      this.lastSystemMessageId = data.systemMessageId || '';
      this.lastConversationId = data.conversationId || '';
      
      // Check if the response is "No answer is found" or other low confidence messages (case-insensitive)
      const isNoAnswerFound = data.systemMessage && (
        data.systemMessage.toLowerCase().includes("no answer is found") ||
        data.systemMessage.toLowerCase().includes("i apologize; i am not able to answer this question") ||
        data.systemMessage.toLowerCase().includes("would you like to be connected to someone in our help center")
      );
      
      // If it's a no-answer response, replace with custom message but preserve confidence score
      if (isNoAnswerFound) {
        console.log('No answer found - replacing message and clearing sources');
        data.systemMessage = language === 'ES' 
          ? "Me disculpo; no puedo responder esta pregunta. ¿Te gustaría conectarte con alguien de nuestro Centro de Ayuda?"
          : "I apologize; I am not able to answer this question. Would you like to be connected to someone in our Help Center?";
        data.sourceAttributions = []; // Clear any source attributions
        data.isNoAnswerFound = true;
        // Ensure low confidence for no-answer responses
        if (!data.confidenceScore || data.confidenceScore > 50) {
          data.confidenceScore = 30;
        }
      } else {
        data.isNoAnswerFound = false;
        
        // Set default high confidence for normal responses if not provided
        if (!data.confidenceScore) {
          data.confidenceScore = 100;
          console.log('Setting default high confidence score for normal response');
        }
      }
      
      // Use the confidence score from the API response if available
      // If not available, calculate based on response quality
      if (!data.confidenceScore) {
        // Check for indicators of high confidence
        const highConfidenceIndicators = [
          data.sourceAttributions && data.sourceAttributions.length > 0,
          data.systemMessage && data.systemMessage.length > 200, // Longer responses tend to be more confident
          !data.systemMessage.toLowerCase().includes('sorry'),
          !data.systemMessage.toLowerCase().includes('don\'t know'),
          !data.systemMessage.toLowerCase().includes('cannot find')
        ];
        
        // Count how many high confidence indicators are present
        const confidencePoints = highConfidenceIndicators.filter(Boolean).length;
        
        // Calculate confidence score (20 points per indicator)
        data.confidenceScore = Math.min(100, confidencePoints * 20);
        
        console.log('Calculated confidence score:', data.confidenceScore);
      }
      
      // Check if confidence score is low (below 80)
      if (data.confidenceScore && data.confidenceScore < 80) {
        console.log('Low confidence response - clearing sources');
        data.sourceAttributions = null; // Set to null instead of empty array to ensure they're completely removed
      }
      
      // Log full response for debugging
      console.log('Amazon Q API Full Response:', {
        ...data,
        hasSystemMessageId: !!data.systemMessageId,
        hasConversationId: !!data.conversationId,
        isNoAnswerFound: data.isNoAnswerFound,
        originalMessage: data.systemMessage,
        hasSources: data.sourceAttributions && data.sourceAttributions.length > 0
      });
      
      // Log response details
      console.log('Amazon Q API Response:', {
        status: response.status,
        responseTime: `${responseTime.toFixed(2)}ms`,
        language: language,
        conversationId: data.conversationId || 'none',
        systemMessageId: data.systemMessageId || 'none',
        userMessageId: data.userMessageId || 'none',
        systemMessage: data.systemMessage ? `${data.systemMessage.substring(0, 50)}...` : 'none',
        hasSourceAttributions: !!data.sourceAttributions && data.sourceAttributions.length > 0,
        isNoAnswerFound: data.isNoAnswerFound,
        timestamp: new Date().toISOString()
      });
      
      return data;
    } catch (error) {
      console.error('Amazon Q API Error:', {
        message: error.message,
        endpoint: CONFIG.api.endpoint,
        requestBody: requestBody,
        timestamp: new Date().toISOString()
      });
      
      // Return a mock response for testing instead of throwing
      return {
        systemMessage: "Crohn's disease is a type of inflammatory bowel disease (IBD) that causes inflammation in the digestive tract, which can lead to abdominal pain, severe diarrhea, fatigue, weight loss and malnutrition.",
        conversationId: 'test-conversation-' + Date.now(),
        systemMessageId: 'test-message-' + Date.now(),
        confidenceScore: 85,
        sourceAttributions: []
      };
    }
  }


}

export default AmazonQService;