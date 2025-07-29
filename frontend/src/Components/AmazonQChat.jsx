import React, { useState, useRef, useEffect } from 'react';
import { Grid, Avatar, Box, CircularProgress, Typography } from "@mui/material";
import UserAvatar from "../Assets/UserAvatar.svg";
import createMessageBlock from "../utilities/createMessageBlock";
import ChatInput from "./ChatInput";
import AmazonQService from "../services/amazonQService";
import TranslationService from "../services/translationService";
import CONFIG from "../config";
import { useLanguage } from "../utilities/LanguageContext";
import { TEXT } from "../utilities/constants";
import Switch from "./Switch";
import BotResponse from "./BotResponse";
import { CookieUtils } from "../utilities/cookieUtils";
import { ConversationStorage } from "../utilities/conversationStorage";
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

function AmazonQChat() {
  const [messageList, setMessageList] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [lastSystemMessageId, setLastSystemMessageId] = useState(null);
  const [sessionId] = useState(() => {
    console.log('🔄 DEBUG - AmazonQChat initializing sessionId...');
    const id = CookieUtils.getSessionId();
    console.log('🔄 DEBUG - AmazonQChat sessionId initialized:', id);
    return id;
  });
  const messagesEndRef = useRef(null);
  const { currentLanguage } = useLanguage();
  
  // Add a function to add messages from other components
  const addMessageToList = (message) => {
    setMessageList(prevList => [...prevList, message]);
  };
  
  // Expose the function globally
  window.addMessageToList = addMessageToList;
  
  // Load conversation on mount
  useEffect(() => {
    console.log('🔄 DEBUG - Loading conversation on mount for sessionId:', sessionId);
    
    const loadConversation = async () => {
      console.log('🔄 DEBUG - Starting conversation load process...');
      
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
  }, [sessionId]);

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

  // Reset conversation when language changes to ensure consistent language in responses
  useEffect(() => {
    // Only reset if there's an existing conversation
    if (conversationId) {
      console.log('Language changed, resetting conversation');
      setConversationId(null);
      setLastSystemMessageId(null);
      ConversationStorage.clearConversation(sessionId);
    }
  }, [currentLanguage, conversationId, sessionId]);

  useEffect(() => {
    scrollToBottom();
    // Log conversation state on mount and updates
    console.log('AmazonQChat state:', { 
      conversationId, 
      lastSystemMessageId,
      messageCount: messageList.length,
      currentLanguage: currentLanguage
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
    
    // Add user message to UI
    const userMessageBlock = createMessageBlock(inputText, "USER", "TEXT", "SENT");
    setMessageList(prevList => [...prevList, userMessageBlock]);
    
    try {
      // Modify input text for Spanish language
      const modifiedInput = currentLanguage === 'EN' ?  inputText : `${inputText} in spanish`;
      console.log("Current Language", currentLanguage);
      console.log("Modified Input ",modifiedInput);
      
      // Call Amazon Q Business API
      const data = await AmazonQService.sendMessage(modifiedInput, currentLanguage, conversationId, lastSystemMessageId, sessionId);
      
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
        messageToDisplay = "I'm not confident in this answer. Would you like to share your email for a follow-up?";
        // Remove sources for low confidence responses
        data.sourceAttributions = [];
      }
      
      // Check if translation is needed and translate
      if (TranslationService.needsTranslation(messageToDisplay, currentLanguage)) {
        console.log(`Translating response to ${currentLanguage}`);
        try {
          messageToDisplay = await TranslationService.translate(messageToDisplay, currentLanguage);
          // Add translation indicator
          messageToDisplay = `${messageToDisplay}\n\n[${currentLanguage === 'ES' ? 'Traducción automática' : 'Automatic translation'}]`;
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
        CONFIG.ui.errorMessage[currentLanguage],
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
      <Box display="flex" justifyContent="space-between" alignItems="center" p={2} borderBottom="1px solid #e0e0e0">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Switch />
        </div>
      </Box>
      
      <Box flex={1} overflow="auto" className="chatScrollContainer">
        {messageList.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <div>{CONFIG.ui.emptyStateMessage[currentLanguage]}</div>
          </Box>
        ) : (
          (() => { console.log('Rendering messageList:', messageList); return null; })(),
          messageList.map((msg, index) => {
            console.log('Rendering msg:', msg);
            return (
              <Box key={index} mb={2}>
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
                      />
                    );
                  })()
                )}
              </Box>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      <Box sx={{ width: "100%" }}>
        {processing && (
          <Box display="flex" justifyContent="center" my={1}>
            <CircularProgress size={24} />
          </Box>
        )}
        <ChatInput 
          onSendMessage={handleSendMessage} 
          processing={processing} 
          placeholder={TEXT[currentLanguage].CHAT_INPUT_PLACEHOLDER}
        />
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