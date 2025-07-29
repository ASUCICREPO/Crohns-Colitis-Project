import React, { useState } from 'react';
import { Box, IconButton, Fab, Paper } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import AmazonQChat from './AmazonQChat';

const FloatingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleChat = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
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
        <Fab
          color="primary"
          onClick={toggleChat}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            width: { xs: 56, sm: 64 },
            height: { xs: 56, sm: 64 },
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
          <ChatIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }} />
        </Fab>
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
            width: isExpanded 
              ? { xs: 'calc(100vw - 40px)', sm: '700px', md: '900px', lg: '1100px' }
              : { xs: 'calc(100vw - 40px)', sm: '400px' },
            height: isExpanded 
              ? { xs: 'calc(100vh - 80px)', sm: '700px', md: '800px' }
              : { xs: '500px', sm: '550px' },
            maxWidth: isExpanded ? '1200px' : '450px',
            maxHeight: isExpanded ? '900px' : '600px',
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
              backgroundColor: '#004D77',
              color: 'white',
              p: { xs: 1.5, sm: 2 },
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              minHeight: '56px',
              flexShrink: 0
            }}
          >
            <Box sx={{ 
              fontSize: { xs: '0.9rem', sm: '1rem' }, 
              fontWeight: 'bold',
              lineHeight: 1.2
            }}>
              Crohns-Colitis Foundation Chat
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={toggleExpand}
                sx={{ 
                  color: 'white', 
                  p: { xs: 0.5, sm: 1 },
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                {isExpanded ? <FullscreenExitIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
              </IconButton>
              <IconButton
                size="small"
                onClick={toggleChat}
                sx={{ 
                  color: 'white',
                  p: { xs: 0.5, sm: 1 },
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Welcome Message - only show in collapsed mode */}
          {!isExpanded && (
            <Box
              sx={{
                p: 2,
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #e9ecef',
                flexShrink: 0
              }}
            >
              <Box sx={{
                fontSize: '0.9rem',
                color: '#495057',
                textAlign: 'center',
                fontWeight: 500
              }}>
                Hi! This is Crohns-Colitis Foundation bot! How can I help you today?
              </Box>
            </Box>
          )}

          {/* Chat Content */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }}>
            <AmazonQChat />
          </Box>
        </Paper>
      )}
    </>
  );
};

export default FloatingChatWidget;