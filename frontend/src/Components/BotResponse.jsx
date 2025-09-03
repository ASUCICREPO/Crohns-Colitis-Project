import React, { useState, useEffect } from "react";
import { Grid, Avatar, Typography, Box, Link, Button } from "@mui/material";
import BotAvatar from "../Assets/gutsybotsize.png";
import { ALLOW_MARKDOWN_BOT, TEXT } from "../utils/constants";
import ReactMarkdown from "react-markdown";
import EmailCollectionModal from "./EmailCollectionModal";
import { useLanguage } from "../utils/LanguageContext";
import createMessageBlock from "../utils/createMessageBlock";
import { getTranslation } from "../utils/translations";
import { FOLLOWUP_BUTTON_BACKGROUND } from "../utils/constants";

const BotResponse = ({ message, citations = [], state = "RECEIVED", confidenceScore = 100, originalQuestion = "", conversationId = "", chatHistory = [], showLanguageButtons = false, onLanguageSelect, showExampleQuestions = false, onExampleQuestionClick, isExpanded = false }) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const { currentLanguage } = useLanguage();
  const langCode = currentLanguage.toUpperCase();
  // Ensure message is a string
  const safeMessage = message || "";
  
  // Check if this is a low confidence response that should trigger the follow-up modal
  const isLowConfidenceMessage = safeMessage.includes("I'm not confident in this answer. Would you like to share your email for a follow-up?");
  
  // Only log in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 DEBUG - BotResponse:', {
      message: safeMessage.substring(0, 100) + (safeMessage.length > 100 ? '...' : ''),
      confidenceScore,
      isLowConfidenceMessage,
      state,
      conversationId
    });
  }
  
  // For low confidence messages, show the original message
  let processedMessage = safeMessage;
  
  // Handle line breaks
  const formattedMessage = processedMessage.replace(/\n/g, '<br>');
  
  // Filter out duplicate sources based on title
  const uniqueCitations = citations ? Array.from(
    new Map(citations.map(citation => [citation.title, citation])).values()
  ) : [];
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Citations processing:', {
      originalCount: citations?.length || 0,
      uniqueCount: uniqueCitations.length,
      titles: uniqueCitations.map(c => c.title)
    });
  }
  


  // Check if the bot is currently thinking
  const isThinking = state === "PROCESSING";
  
  // Check if this is a system message (like a success message)
  const isSystemMessage = message && (
    message.includes("Thank you! Your request has been submitted successfully") ||
    message.includes("¡Gracias! Tu solicitud ha sido enviada exitosamente")
  );
  
  // Check if this should show the low confidence follow-up
  const isLowConfidence = !isSystemMessage && !isThinking && (confidenceScore < 80 || isLowConfidenceMessage);
  
  // Only log in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 DEBUG - Low confidence decision:', {
      isSystemMessage,
      confidenceScore,
      isLowConfidenceMessage,
      isLowConfidence
    });
  }
  
  // Function to test the API endpoint directly
  const testApiEndpoint = async () => {
    const emailEndpoint = process.env.REACT_APP_EMAIL_ENDPOINT;
    console.log('Testing API endpoint:', emailEndpoint);
    
    try {
      const response = await fetch(emailEndpoint, {
        method: 'OPTIONS'
      });
      console.log('API test result:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
    } catch (error) {
      console.error('API test failed:', error);
    }
  };
  
  // Call the test function when the component mounts
  React.useEffect(() => {
    testApiEndpoint();
  }, []);
  
  const handleEmailSubmit = async (userInfo, question, conversationId, chatHistory) => {
    try {
      // DEBUG: Log chat history details
      console.log('🔍 DEBUG - Chat History Details:', {
        chatHistoryLength: chatHistory?.length || 0,
        chatHistory: chatHistory,
        userInfo,
        question,
        conversationId
      });
      
      // DEBUG: Log each message in chat history
      if (chatHistory && chatHistory.length > 0) {
        console.log('🔍 DEBUG - Chat History Messages:');
        chatHistory.forEach((msg, index) => {
          console.log(`  ${index + 1}. ${msg.sentBy}: ${msg.message?.substring(0, 100)}${msg.message?.length > 100 ? '...' : ''}`);
        });
      }
      
      try {
        // Check if we're in development mode
        const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        // Validate email format before sending
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userInfo.email)) {
          throw new Error('Invalid email format');
        }
        
        const requestBody = {
          email: userInfo.email,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          phone: userInfo.phone,
          question,
          conversationId,
          chatHistory,
          ccEmail: userInfo.email
        };
        
        console.log('🔍 DEBUG - Request body:', requestBody);
        
        // Always use the actual API endpoint, even in development mode
        console.log('Using actual API endpoint for email submission');
        
        // Use the email endpoint from config
        const emailEndpoint = process.env.REACT_APP_EMAIL_ENDPOINT;
        console.log('🔍 DEBUG - Sending email to:', emailEndpoint);
        
        // Test the API endpoint directly with a simple fetch
        try {
          const testResponse = await fetch(emailEndpoint, {
            method: 'OPTIONS'
          });
          console.log('OPTIONS request response:', {
            status: testResponse.status,
            statusText: testResponse.statusText,
            ok: testResponse.ok
          });
        } catch (optionsError) {
          console.error('OPTIONS request failed:', optionsError);
        }
        
        // Now try the actual POST request
        const response = await fetch(emailEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors',
          body: JSON.stringify(requestBody)
        });
        
        console.log('POST request response:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
      
      if (!response.ok) {
        console.error('Response not OK:', response.status, response.statusText);
        
        // Try to get response text first
        const responseText = await response.text().catch(e => 'Could not get response text: ' + e.message);
        console.log('Response text:', responseText);
        
        // Try to parse as JSON if possible
        try {
          const errorData = JSON.parse(responseText);
          console.error('Email submission error:', errorData);
          throw new Error(errorData.error || `Failed with status ${response.status}: ${response.statusText}`);
        } catch (jsonError) {
          console.error('Could not parse error response as JSON:', jsonError);
          throw new Error(`Failed with status ${response.status}: ${response.statusText}\nResponse: ${responseText}`);
        }
      }
      
      // Try to get response body
      const responseText = await response.text().catch(e => 'Could not get response text: ' + e.message);
      console.log('Success response text:', responseText);
      
      try {
        const responseData = JSON.parse(responseText);
        console.log('Success response data:', responseData);
      } catch (jsonError) {
        console.log('Could not parse success response as JSON:', jsonError);
      }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        console.log('API call failed - reporting error to user');
        throw fetchError;
      }
      
      console.log('Email request submitted successfully');
      
      // Create a success message directly
      const successMessage = createMessageBlock(
        getTranslation('emailSuccessMessage', currentLanguage),
        'BOT',
        'TEXT',
        'RECEIVED',
        '',
        '',
        [],
        '',
        '',
        '',
        100, // High confidence for success message
        ''
      );
      
      // Add the success message to the message list
      if (window.addMessageToList) {
        window.addMessageToList(successMessage);
      } else {
        // Fallback - just show an alert
        alert(getTranslation('emailSuccessMessage', currentLanguage));
      }
    } catch (error) {
      console.error('Error submitting email request:', error);
      throw error;
    }
  };

  if (isThinking) {
    return (
      <Grid container direction="row" justifyContent="flex-start" alignItems="flex-end">
        <Grid item>
          <Avatar alt="Bot Avatar" src={BotAvatar} />
        </Grid>
        <Grid item className="botMessage" sx={{ 
          backgroundColor: (theme) => theme.palette.background.botMessage,
          borderRadius: 2,
          p: 2,
          maxWidth: '80%',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Thinking
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Box sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              animation: 'typing 1s infinite ease-in-out',
              '&:nth-of-type(1)': { animationDelay: '0.2s' },
              '&:nth-of-type(2)': { animationDelay: '0.4s' },
              '&:nth-of-type(3)': { animationDelay: '0.6s' }
            }} />
            <Box sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              animation: 'typing 1s infinite ease-in-out',
              '&:nth-of-type(1)': { animationDelay: '0.2s' },
              '&:nth-of-type(2)': { animationDelay: '0.4s' },
              '&:nth-of-type(3)': { animationDelay: '0.6s' }
            }} />
            <Box sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              animation: 'typing 1s infinite ease-in-out',
              '&:nth-of-type(1)': { animationDelay: '0.2s' },
              '&:nth-of-type(2)': { animationDelay: '0.4s' },
              '&:nth-of-type(3)': { animationDelay: '0.6s' }
            }} />
          </Box>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container direction="row" justifyContent="flex-start" alignItems="flex-end">
      <Grid item sx={{ mr: 1, ml: 2 }}>
        <Avatar alt="Bot Avatar" src={BotAvatar} />
      </Grid>
      <Grid item className="botMessage" sx={{ 
        backgroundColor: (theme) => theme.palette.background.botMessage,
        borderRadius: 2,
        p: 2,
        maxWidth: '80%'
      }}>
        {ALLOW_MARKDOWN_BOT ? (
          <ReactMarkdown>{safeMessage}</ReactMarkdown>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: formattedMessage }} />
        )}
        
        {/* Language selection buttons */}
        {showLanguageButtons && (
          <Box mt={2} display="flex" gap={1}>
            <Button 
              variant="contained" 
              size="small"
              onClick={() => onLanguageSelect && onLanguageSelect('English')}
              sx={{ 
                backgroundColor: '#004D77',
                '&:hover': { backgroundColor: '#003A5C' }
              }}
            >
              English
            </Button>
            <Button 
              variant="contained" 
              size="small"
              onClick={() => onLanguageSelect && onLanguageSelect('Spanish')}
              sx={{ 
                backgroundColor: '#004D77',
                '&:hover': { backgroundColor: '#003A5C' }
              }}
            >
              Español
            </Button>
          </Box>
        )}
        
        {/* Citations - only show if not low confidence */}
        {uniqueCitations && uniqueCitations.length > 0 && !isLowConfidence && (
          <Box mt={1}>
            <Typography 
              variant="caption" 
              color="textSecondary"
              sx={{ fontSize: '0.9rem' }}
            >
              Sources:
            </Typography>
            {uniqueCitations.map((citation, index) => (
              <Box key={index}>
                <Link 
                  href={citation.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ 
                    fontSize: '0.9rem',
                    color: '#0066cc',
                    textDecoration: 'underline',
                    '&:hover': {
                      color: '#004499'
                    }
                  }}
                >
                  {citation.title}
                </Link>
              </Box>
            ))}
          </Box>
        )}
        
        {/* Example questions for welcome message */}
        {showExampleQuestions && (
          <Box mt={2}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Try asking:
            </Typography>
            {getTranslation('exampleQuestions', currentLanguage).map((question, index) => (
              <Button
                key={index}
                variant="outlined"
                size="small"
                onClick={() => onExampleQuestionClick && onExampleQuestionClick(question)}
                sx={{
                  display: 'block',
                  mb: 1,
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  textTransform: 'none'
                }}
              >
                {question}
              </Button>
            ))}
          </Box>
        )}
        
        {/* Low confidence follow-up option */}
        {isLowConfidence && (
          <Box mt={2}>
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => setShowEmailModal(true)}
              sx={{ backgroundColor: FOLLOWUP_BUTTON_BACKGROUND }}
            >
              {getTranslation('requestFollowUp', currentLanguage)}
            </Button>
          </Box>
        )}
        
        <EmailCollectionModal
          open={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          question={originalQuestion}
          conversationId={conversationId}
          chatHistory={chatHistory}
          onSubmit={handleEmailSubmit}
          isExpanded={isExpanded}
        />
        
      </Grid>
    </Grid>
  );
};

export default BotResponse;