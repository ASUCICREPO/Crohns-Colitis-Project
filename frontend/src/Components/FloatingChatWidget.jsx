import React, { useState, useEffect } from 'react';
import { Box, IconButton, Fab, Paper, Typography, Button, Drawer, useMediaQuery, useTheme } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import BotAvatar from '../Assets/BotAvatar.png';
import ChatbotIcon from '../Assets/Group 17.png';

import AmazonQChat from './AmazonQChat';
import MarketingSidebar from './MarketingSidebar';
import LanguageSelector from './LanguageSelector';
import { SessionCleanup } from '../utils/sessionCleanup';
import { useLanguage } from '../utils/LanguageContext';
import { detectUserLanguage } from '../utils/languageConfig';
import { getTranslation } from '../utils/translations';
import { BOT_HEADING_COLOR } from '../utils/constants';
import SpeechBubble from './SpeechBubble';


const FloatingChatWidget = () => {
  // Load chat state from sessionStorage on initialization
  const [isOpen, setIsOpen] = useState(() => {
    const saved = sessionStorage.getItem('chatWidget_isOpen');
    return saved ? JSON.parse(saved) : false;
  });
  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = sessionStorage.getItem('chatWidget_isExpanded');
    return saved ? JSON.parse(saved) : false;
  });
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const { currentLanguage, setCurrentLanguage } = useLanguage();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Auto-detect language on first load
  useEffect(() => {
    if (!localStorage.getItem('userLanguage')) {
      const detectedLang = detectUserLanguage();
      setCurrentLanguage(detectedLang);
      localStorage.setItem('userLanguage', detectedLang);
    }

  }, [setCurrentLanguage, currentLanguage]);

  // Setup session persistence - don't auto-cleanup on page navigation
  useEffect(() => {
    console.log('🔄 DEBUG - FloatingChatWidget mounted, preserving session across pages');
    
    // Don't setup auto cleanup that clears session on page navigation
    // Only clear when user explicitly closes chat
    
    return () => {
      console.log('🔄 DEBUG - FloatingChatWidget unmounting');
      // Don't clear session on unmount - preserve for next page
    };
  }, []);
  
  // Debug logging for persistence
  useEffect(() => {
    if (window.CHAT_CONFIG?.debugMode) {
      console.log('🔄 DEBUG - Chat state:', {
        isOpen,
        isExpanded,
        currentPage: window.location.pathname,
        sessionStorage: {
          isOpen: sessionStorage.getItem('chatWidget_isOpen'),
          isExpanded: sessionStorage.getItem('chatWidget_isExpanded')
        }
      });
    }
  }, [isOpen, isExpanded]);
  


  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    // Save chat state to sessionStorage for persistence
    sessionStorage.setItem('chatWidget_isOpen', JSON.stringify(newIsOpen));
    
    // Only clear session when explicitly closing (X button), not when navigating
    if (!newIsOpen) {
      console.log('🧹 DEBUG - Chat closing via X button, clearing session and conversation');
      SessionCleanup.clearCurrentSession();
      // Clear persistence when explicitly closed
      sessionStorage.removeItem('chatWidget_isOpen');
      sessionStorage.removeItem('chatWidget_isExpanded');
      // Also clear any conversation state
      sessionStorage.removeItem('chatbot_session');
    }
    
    // Notify parent window about chat state change
    if (window.parent !== window) {
      window.parent.postMessage({
        type: newIsOpen ? 'CHAT_OPENED' : 'CHAT_CLOSED'
      }, '*');
    }
  };
  
  const toggleExpand = () => {
    const newIsExpanded = !isExpanded;
    setIsExpanded(newIsExpanded);
    
    // Save expand state to sessionStorage
    sessionStorage.setItem('chatWidget_isExpanded', JSON.stringify(newIsExpanded));
    
    // Notify parent window about expand state change
    if (window.parent !== window) {
      window.parent.postMessage({
        type: newIsExpanded ? 'CHAT_EXPANDED' : 'CHAT_COLLAPSED'
      }, '*');
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
          {/* Speech Bubble */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: '80px', 
            right: '10px',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(10px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' }
            },
            animation: 'fadeIn 0.5s ease-in-out'
          }}>
            <SpeechBubble message="How can I help?" />
          </Box>
          
          {/* Chat Button */}
          <Fab
            color="primary"
            onClick={toggleChat}
            sx={{
              pointerEvents: 'auto',
              width: { xs: 64, sm: 72 },
              height: { xs: 64, sm: 72 },
              backgroundColor: '#004D77',
              boxShadow: '0 4px 20px rgba(0, 77, 119, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { 
                backgroundColor: '#003A5C',
                transform: 'scale(1.05)',
                boxShadow: '0 6px 24px rgba(0, 77, 119, 0.4)'
              }
            }}
          >
            <img 
              src={ChatbotIcon} 
              alt="Chat" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </Fab>
        </Box>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            pointerEvents: 'auto',
            width: isMobile 
              ? 'calc(100vw - 40px)'
              : isExpanded 
                ? { sm: 'calc(100vw - 40px)', md: 'min(1150px, calc(100vw - 40px))', lg: 'min(1350px, calc(100vw - 40px))' }
                : '400px',
            height: isMobile
              ? '70vh'
              : isExpanded 
                ? { sm: 'calc(100vh - 40px)', md: 'min(850px, calc(100vh - 40px))' }
                : '550px',
            maxWidth: isMobile ? 'calc(100vw - 40px)' : 'calc(100vw - 40px)',
            maxHeight: isMobile ? '70vh' : 'calc(100vh - 40px)',
            minWidth: '320px',
            minHeight: '400px',
            borderRadius: '12px',
            overflow: 'hidden',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }}
        >
          {/* Header */}
          <Box
            sx={{
              backgroundColor: BOT_HEADING_COLOR,
              color: 'white',
              p: { xs: 1.5, sm: 2 },
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              minHeight: '56px',
              flexShrink: 0
            }}
          >
            <LanguageSelector 
              currentLanguage={currentLanguage}
              onLanguageChange={(langCode) => {
                if (langCode !== currentLanguage) {
                  setCurrentLanguage(langCode);
                  localStorage.setItem('userLanguage', langCode);

                  
                  // Clear all conversation storage completely
                  console.log('🔄 DEBUG - Language change - clearing all storage');
                  const sessionId = window.CookieUtils?.getSessionId();
                  console.log('🔄 DEBUG - SessionId for cleanup:', sessionId);
                  
                  if (sessionId) {
                    localStorage.removeItem(`chat_session_${sessionId}`);
                    localStorage.removeItem(`chat_${sessionId}`);
                    console.log('🔄 DEBUG - Removed chat storage for session:', sessionId);
                  }
                  sessionStorage.removeItem('chatbot_session');
                  
                  // Clear all localStorage keys that start with 'chat_'
                  Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('chat_')) {
                      localStorage.removeItem(key);
                      console.log('🔄 DEBUG - Removed storage key:', key);
                    }
                  });
                  
                  // Clear session cleanup
                  if (window.SessionCleanup) {
                    window.SessionCleanup.clearCurrentSession();
                  }
                  
                  console.log('🔄 DEBUG - Storage cleanup completed');
                  
                  // Small delay to ensure storage is cleared before restart
                  setTimeout(() => {
                    if (window.restartChatbot) {
                      console.log('🔄 DEBUG - Calling restartChatbot with language:', langCode);
                      window.restartChatbot(langCode);
                    }
                  }, 50);
                }
              }}
            />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {/* Mobile sidebar toggle - only show on small screens when expanded */}
              {isMobile && isExpanded && (
                <IconButton
                  size="small"
                  onClick={() => setShowMobileSidebar(true)}
                  sx={{ 
                    color: 'white', 
                    p: 1,
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              )}
              {/* Expand/collapse button - hide on mobile */}
              {!isMobile && (
                <IconButton
                  size="small"
                  onClick={toggleExpand}
                  sx={{ 
                    color: 'white', 
                    p: 1,
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  {isExpanded ? <FullscreenExitIcon /> : <FullscreenIcon />}
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={toggleChat}
                sx={{ 
                  color: 'white',
                  p: 1,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>





          {/* Chat Content */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'row',
            minHeight: 0
          }}>
            {/* Marketing Sidebar - only show when expanded and on larger screens */}
            {isExpanded && !isMobile && (
              <Box>
                <MarketingSidebar 
                  currentLanguage={currentLanguage}
                  onLanguageToggle={(lang) => {
                    if (lang !== currentLanguage) {
                      setCurrentLanguage(lang);
                    }
                  }}
                />
              </Box>
            )}
            
            {/* Main Chat Area */}
            <Box sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              minWidth: 0
            }}>
              {/* Chat Title - only show when expanded */}
              {isExpanded && (
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1.5,
                  backgroundColor: '#f8f9fa',
                  borderBottom: '1px solid #e0e0e0',
                  flexShrink: 0
                }}>
                  <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    mr: 1.5
                  }}>
                    <img 
                      src={BotAvatar} 
                      alt="Chatbot" 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                  <Box sx={{
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: '#0e277b'
                  }}>
                    {getTranslation('chatTitle', currentLanguage)}
                  </Box>
                </Box>
              )}
              <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
                <AmazonQChat isExpanded={isExpanded} onClose={toggleChat} />
              </Box>
            </Box>
          </Box>
        </Paper>
      )}
      
      {/* Mobile Sidebar Drawer */}
      <Drawer
        anchor="right"
        open={showMobileSidebar}
        onClose={() => setShowMobileSidebar(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '280px',
            maxWidth: '80vw'
          }
        }}
      >
        <MarketingSidebar 
          currentLanguage={currentLanguage}
          onLanguageToggle={(lang) => {
            if (lang !== currentLanguage) {
              setCurrentLanguage(lang);
            }
            setShowMobileSidebar(false);
          }}
        />
      </Drawer>
    </>
  );
};

export default FloatingChatWidget;