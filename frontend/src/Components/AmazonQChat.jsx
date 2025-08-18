import React, { useState, useRef, useEffect } from 'react';
import { Grid, Avatar, Box, CircularProgress, Typography } from "@mui/material";
import UserAvatar from "../Assets/User Avatar.png";
import BotAvatar from "../Assets/Group 17.png";
import createMessageBlock from "../utils/createMessageBlock";
import ChatInput from "./ChatInput";
import AmazonQService from "../services/amazonQService";
import TranslationService from "../services/translationService";
import CONFIG from "../config";
import { useLanguage } from "../utils/LanguageContext";
import { TEXT } from "../utils/constants";
import { getTranslation } from "../utils/translations";

import BotResponse from "./BotResponse";

// Helper function to get welcome message in any language
const getWelcomeMessage = async (language) => {
  return getTranslation('welcome', language);
};

// Helper function to check if this is the first welcome message
const isWelcomeMessage = (message) => {
  const welcomeMessages = [
    "Hi! This is Coli. How can I help you today?",
    "¡Hola! Soy Coli. ¿Cómo puedo ayudarte hoy?",
    "Bonjour! Je suis Coli. Comment puis-je vous aider aujourd'hui?",
    "您好！我是Coli。今天我可以如何帮助您？"
  ];
  return welcomeMessages.includes(message);
};
import { CookieUtils } from "../utils/cookieUtils";
import { ConversationStorage } from "../utils/conversationStorage";
import { SessionCleanup } from "../utils/sessionCleanup";
import ConversationService from "../services/conversationService";

// Test cookie utilities immediately
console.log('🧪 TEST - CookieUtils imported:', typeof CookieUtils);
console.log('🧪 TEST - Testing cookie functionality...');
try {
  const testSessionId = CookieUtils.getSessionId();
  console.log('🧪 TEST - Cookie test successful, sessionId:', testSessionId);
} catch (error) {
  console.error('🧪 TEST - Cookie test failed:', error);
}

// Debug logging is controlled in config.js

function AmazonQChat({ isExpanded = false }) {
  const [messageList, setMessageList] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [lastSystemMessageId, setLastSystemMessageId] = useState(null);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [isLanguageRestart, setIsLanguageRestart] = useState(false);
  const [sessionId] = useState(() => {
    console.log('🔄 DEBUG - AmazonQChat initializing sessionId...');
    const id = CookieUtils.getSessionId();
    console.log('🔄 DEBUG - AmazonQChat sessionId initialized:', id);
    return id;
  });
  const messagesEndRef = useRef(null);
  const { currentLanguage, setCurrentLanguage } = useLanguage();
  
  // Add a function to add messages from other components
  const addMessageToList = (message) => {
    setMessageList(prevList => [...prevList, message]);
  };
  
  // Expose the function globally
  window.addMessageToList = addMessageToList;
  
  // Expose restart function globally
  window.restartChatbot = async (newLanguage) => {
    console.log('🔄 DEBUG - restartChatbot called with language:', newLanguage);
    console.log('🔄 DEBUG - Current state before restart:', { messageListLength: messageList.length, hasShownWelcome, isLanguageRestart });
    
    // Set flag to prevent loading old conversation
    setIsLanguageRestart(true);
    
    // Update the current language state first
    setCurrentLanguage(newLanguage);
    
    // Complete conversation reset - clear everything immediately
    console.log('🔄 DEBUG - Clearing all conversation data');
    setMessageList([]);
    setConversationId(null);
    setLastSystemMessageId(null);
    setHasShownWelcome(false);
    setProcessing(false);
    
    // Clear any stored conversation data immediately
    const sessionId = CookieUtils.getSessionId();
    ConversationStorage.clearConversation(sessionId);
    console.log('🔄 DEBUG - Cleared conversation storage for session:', sessionId);
    
    // Add fresh welcome message in new language
    setTimeout(async () => {
      console.log('🔄 DEBUG - Adding welcome message for language:', newLanguage);
      const welcomeText = await getWelcomeMessage(newLanguage);
      const welcomeMessage = {
        ...createMessageBlock(
          welcomeText,
          "BOT",
          "TEXT",
          "RECEIVED"
        )
      };
      
      console.log('🔄 DEBUG - Setting fresh messageList with welcome message');
      setMessageList([welcomeMessage]);
      setHasShownWelcome(true);
      setIsLanguageRestart(false);
      console.log('🔄 DEBUG - Language restart completed');
    }, 100);
  };
  
  // Load conversation on mount and setup cleanup handlers
  useEffect(() => {
    console.log('🔄 DEBUG - useEffect triggered with:', { sessionId, hasShownWelcome, isLanguageRestart, messageListLength: messageList.length });
    
    const loadConversation = async () => {
      console.log('🔄 DEBUG - Starting conversation load process...');
      
      // Skip loading if this is a language restart
      if (isLanguageRestart) {
        console.log('🔄 DEBUG - Skipping conversation load - language restart in progress');
        return;
      }
      
      // Skip if we already have messages (from language restart)
      if (messageList.length > 0) {
        console.log('🔄 DEBUG - Skipping conversation load - messages already exist');
        return;
      }
      
      // Try localStorage first
      let savedConversation = ConversationStorage.loadConversation(sessionId);
      console.log('🔄 DEBUG - LocalStorage result:', savedConversation);
      
      // If not found locally, try backend
      if (!savedConversation) {
        console.log('🔄 DEBUG - No local conversation found, trying backend...');
        const backendConversation = await ConversationService.getConversation(sessionId);
        console.log('🔄 DEBUG - Backend conversation result:', backendConversation);
        
        if (backendConversation && backendConversation.chatHistory) {
          console.log('🔄 DEBUG - Converting backend chat history to message format');
          
          // Convert backend chat history to frontend message format
          const convertedMessages = backendConversation.chatHistory.map((item, index) => {
            if (item.type === 'USER') {
              return {
                message: item.message,
                sentBy: 'USER',
                type: 'TEXT',
                state: 'SENT',
                messageId: `user_${item.timestamp}_${index}`,
                timestamp: item.timestamp
              };
            } else {
              return {
                message: item.message,
                sentBy: 'BOT',
                type: 'TEXT',
                state: 'RECEIVED',
                messageId: item.systemMessageId || `bot_${item.timestamp}_${index}`,
                conversationId: item.conversationId,
                timestamp: item.timestamp,
                citations: [],
                confidenceScore: 100
              };
            }
          });
          
          console.log('🔄 DEBUG - Setting conversation data from backend with', convertedMessages.length, 'messages');
          setMessageList(convertedMessages);
          setConversationId(backendConversation.conversationId);
          setLastSystemMessageId(backendConversation.lastSystemMessageId);
        } else {
          console.log('🔄 DEBUG - No conversation found in backend either');
        }
      } else {
        console.log('🔄 DEBUG - Loading conversation from localStorage');
        console.log('🔄 DEBUG - Message count:', savedConversation.messageList?.length || 0);
        setMessageList(savedConversation.messageList || []);
        setConversationId(savedConversation.conversationId);
        setLastSystemMessageId(savedConversation.lastSystemMessageId);
      }
    };
    
    loadConversation();
    
    // Add welcome message with language selection if no existing conversation and not during language restart
    if (!hasShownWelcome && !isLanguageRestart) {
      setTimeout(async () => {
        const welcomeText = await getWelcomeMessage(currentLanguage);
        const welcomeMessage = {
          ...createMessageBlock(
            welcomeText,
            "BOT",
            "TEXT",
            "RECEIVED"
          )
        };
        setMessageList(prevList => {
          if (prevList.length === 0) {
            setHasShownWelcome(true);
            return [welcomeMessage];
          }
          return prevList;
        });
      }, 500);
    }
  }, [sessionId, hasShownWelcome, isLanguageRestart]);

  // Save conversation when it changes
  useEffect(() => {
    console.log('🔄 DEBUG - Conversation state changed, checking if save needed...');
    console.log('🔄 DEBUG - Message count:', messageList.length);
    console.log('🔄 DEBUG - SessionId:', sessionId);
    
    if (messageList.length > 0) {
      console.log('🔄 DEBUG - Saving conversation due to state change');
      ConversationStorage.saveConversation(sessionId, messageList, conversationId, lastSystemMessageId);
    } else {
      console.log('🔄 DEBUG - No messages to save yet');
    }
  }, [sessionId, messageList, conversationId, lastSystemMessageId]);



  useEffect(() => {
    scrollToBottom();
    // Log conversation state on mount and updates
    console.log('🔄 DEBUG - AmazonQChat state updated:', { 
      conversationId, 
      lastSystemMessageId,
      messageCount: messageList.length,
      currentLanguage: currentLanguage,
      messages: messageList.map(m => ({ sentBy: m.sentBy, message: m.message.substring(0, 50) + '...' }))
    });
  }, [messageList, conversationId, lastSystemMessageId, currentLanguage]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSendMessage = async (inputText) => {
    console.log(`Sending message in ${currentLanguage}:`, inputText);
    setProcessing(true);
    
    // Check if this is a language selection
    const isLanguageSelection = inputText.toLowerCase().match(/^(english|spanish|español|1|2)$/);
    
    // Add user message to UI
    const userMessageBlock = createMessageBlock(inputText, "USER", "TEXT", "SENT");
    setMessageList(prevList => [...prevList, userMessageBlock]);
    
    // Handle language selection
    if (isLanguageSelection && messageList.length <= 1) {
      const selectedLang = inputText.toLowerCase();
      let newLanguage = currentLanguage;
      let responseMessage = "";
      
      // This logic is no longer needed as language is selected via dropdown
      return;
      
      // Set language if different
      if (newLanguage !== currentLanguage) {
        setCurrentLanguage(newLanguage);
      }
      
      // Add bot response
      const botResponse = createMessageBlock(responseMessage, "BOT", "TEXT", "RECEIVED");
      setMessageList(prevList => [...prevList, botResponse]);
      setProcessing(false);
      return;
    }
    
    try {
      console.log("Current Language", currentLanguage);
      console.log("Original Input Text:", inputText);
      
      // Translate user input to English if needed
      let englishInput = inputText;
      if (currentLanguage !== 'en') {
        try {
          englishInput = await TranslationService.translate(inputText, 'en');
          console.log("Translated Input to English:", englishInput);
        } catch (error) {
          console.error('Input translation failed:', error);
        }
      }
      
      // Call Amazon Q Business API (always in English)
      const data = await AmazonQService.sendMessage(englishInput, 'EN', conversationId, lastSystemMessageId, sessionId);
      
      // Log the raw API response
      console.log('Raw API Response in handleSendMessage:', JSON.stringify(data, null, 2));
      
      // Store conversation IDs
      if (data.conversationId) {
        console.log('New conversation ID:', data.conversationId);
        setConversationId(data.conversationId);
      }
      
      if (data.systemMessageId) {
        console.log('New system message ID:', data.systemMessageId);
        setLastSystemMessageId(data.systemMessageId);
      }
      
      // Get response message
      let messageToDisplay = data.systemMessage || CONFIG.ui.noAnswerMessage[currentLanguage] || "No response received";
      
      // DEBUG: Log the raw response data
      console.log('🔍 DEBUG - Raw API Response:', {
        systemMessage: data.systemMessage,
        confidenceScore: data.confidenceScore,
        sourceAttributions: data.sourceAttributions?.length || 0,
        fullData: data
      });
      
      // Check if API response contains low confidence text or if confidence score is low
      const containsLowConfidenceText = messageToDisplay.includes("I'm not confident in this answer. Would you like to share your email for a follow-up?");
      const isLowConfidenceScore = (data.confidenceScore || 100) < 80;
      const isNoResponseReceived = messageToDisplay === "No response received";
      const isSystemMessageNone = data.systemMessage === "none" || data.systemMessage === "";

      
      // DEBUG: Log confidence detection
      console.log('🔍 DEBUG - Confidence Detection:', {
        messageToDisplay,
        systemMessage: data.systemMessage,
        containsLowConfidenceText,
        confidenceScore: data.confidenceScore,
        isLowConfidenceScore,
        isNoResponseReceived,
        isSystemMessageNone,
        willTriggerLowConfidence: containsLowConfidenceText || isLowConfidenceScore || isNoResponseReceived || isSystemMessageNone
      });
      
      // If low confidence, show the standard message
      if (containsLowConfidenceText || isLowConfidenceScore || isNoResponseReceived || isSystemMessageNone) {
        console.log('🔍 DEBUG - Triggering low confidence response');
        messageToDisplay = getTranslation('lowConfidenceMessage', 'en'); // Start with English, will be translated below
        // Remove sources for low confidence responses
        data.sourceAttributions = [];
      }
      
      // Translate response to user's language if needed
      if (currentLanguage !== 'en') {
        console.log(`Translating response to ${currentLanguage}`);
        try {
          messageToDisplay = await TranslationService.translate(messageToDisplay, currentLanguage);
        } catch (error) {
          console.error('Translation failed:', error);
        }
      }
      
      // Determine if we should show citations based on confidence score
      const showCitations = (data.confidenceScore || 100) >= 80 && !containsLowConfidenceText && !isLowConfidenceScore && !isNoResponseReceived && !isSystemMessageNone;
      
      // Create bot response message block
      const finalConfidenceScore = containsLowConfidenceText || isLowConfidenceScore || isNoResponseReceived || isSystemMessageNone ? 50 : (data.confidenceScore || 100);
      
      // DEBUG: Log message block creation
      console.log('🔍 DEBUG - Creating message block:', {
        messageToDisplay,
        showCitations,
        finalConfidenceScore,
        citations: showCitations ? (data.sourceAttributions || []).length : 0
      });
      
      const botMessageBlock = createMessageBlock(
        messageToDisplay, 
        "BOT", 
        "TEXT", 
        "RECEIVED", 
        "", 
        "", 
        showCitations ? (data.sourceAttributions || []) : [],
        data.systemMessageId || "",
        "",
        data.conversationId,
        finalConfidenceScore,
        inputText // Pass the original question
      );
      
      console.log('🔍 DEBUG - Created bot message with confidence score:', finalConfidenceScore);
      
      // Debug log the message block
      console.log('Created message block:', {
        messageId: botMessageBlock.messageId,
        conversationId: botMessageBlock.conversationId,
        state: botMessageBlock.state,
        isNoAnswerFound: botMessageBlock.isNoAnswerFound,
        hasCitations: botMessageBlock.citations && botMessageBlock.citations.length > 0,
        fullBlock: botMessageBlock
      });
      
      setMessageList(prevList => {
        const newList = [...prevList, botMessageBlock];
        console.log('Updated message list:', newList.map(msg => ({
          sentBy: msg.sentBy,
          messageId: msg.messageId,
          conversationId: msg.conversationId,
          state: msg.state,
          isNoAnswerFound: msg.isNoAnswerFound
        })));
        return newList;
      });
      
    } catch (error) {
      console.error("Error in chat interaction:", error);
      const errorMessage = createMessageBlock(
        getTranslation('errorMessage', currentLanguage),
        "BOT",
        "TEXT",
        "RECEIVED"
      );
      setMessageList(prevList => [...prevList, errorMessage]);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" justifyContent="space-between" className="appHeight100 appWidth100">

      
      <Box flex={1} overflow="auto" className="chatScrollContainer">
        {messageList.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <div>{getTranslation('emptyStateMessage', currentLanguage)}</div>
          </Box>
        ) : (
          (() => { console.log('Rendering messageList:', messageList); return null; })(),
          messageList.map((msg, index) => {
            console.log('Rendering msg:', msg);
            return (
              <Box key={index} mb={2} mt={index === 0 ? 2 : 0}>
                {msg.sentBy === "USER" ? (
                  <UserMessage message={msg.message} />
                ) : (
                  (() => {
                    const chatHistoryForThisMessage = messageList.slice(0, index + 1);
                    console.log(`🔍 DEBUG - AmazonQChat passing chat history to BotResponse ${index}:`, {
                      messageIndex: index,
                      chatHistoryLength: chatHistoryForThisMessage.length,
                      chatHistory: chatHistoryForThisMessage
                    });
                    return (
                      <BotResponse 
                        message={msg.message} 
                        citations={msg.citations}
                        messageId={msg.messageId}
                        conversationId={msg.conversationId}
                        state={msg.state}
                        isNoAnswerFound={msg.isNoAnswerFound}
                        confidenceScore={msg.confidenceScore || 50}
                        originalQuestion={msg.originalQuestion || ''}
                        chatHistory={chatHistoryForThisMessage}
                        showLanguageButtons={msg.showLanguageButtons}
                        onLanguageSelect={handleSendMessage}
                        showExampleQuestions={isWelcomeMessage(msg.message) && messageList.length === 1}
                        onExampleQuestionClick={handleSendMessage}
                        isExpanded={isExpanded}
                      />
                    );
                  })()
                )}
              </Box>
            );
          })
        )}
        {processing && (
          <Box mb={2}>
            <Grid container direction="row" justifyContent="flex-start" alignItems="flex-end">
              <Grid item>
                <Avatar src={BotAvatar} sx={{ width: 40, height: 40 }} />
              </Grid>
              <Grid item className="botMessage" sx={{ backgroundColor: (theme) => theme.palette.background.botMessage, ml: 1 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">{getTranslation('loading', currentLanguage)}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      <Box sx={{ px: 2, pb: 2 }}>
        <ChatInput 
          onSendMessage={handleSendMessage} 
          processing={processing} 
          placeholder={getTranslation('chatInputPlaceholder', currentLanguage)}
        />
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block',
            textAlign: 'center',
            color: '#666',
            fontSize: '0.7rem',
            mt: 1,
            lineHeight: 1.2,
            px: 1,
            // Responsive text layout
            '@media (max-width: 500px)': {
              fontSize: '0.65rem'
            }
          }}
        >
          {getTranslation('disclaimer', currentLanguage)}
        </Typography>
      </Box>
    </Box>
  );
}

function UserMessage({ message }) {
  return (
    <Grid container direction="row" justifyContent="flex-end" alignItems="flex-end">
      <Grid item className="userMessage" sx={{ backgroundColor: (theme) => theme.palette.background.userMessage }}>
        <div>{message}</div>
      </Grid>
      <Grid item>
        <Avatar alt={"User Profile Pic"} src={UserAvatar} />
      </Grid>
    </Grid>
  );
}

export default AmazonQChat;