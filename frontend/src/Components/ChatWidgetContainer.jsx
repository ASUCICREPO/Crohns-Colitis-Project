import React from 'react';
import { Box } from '@mui/material';

const ChatWidgetContainer = ({ children }) => {
  return (
    <Box
      sx={{
        // Ensure widget doesn't interfere with page scroll
        position: 'relative',
        pointerEvents: 'none',
        zIndex: 1000,
        '& > *': {
          pointerEvents: 'auto'
        }
      }}
    >
      {children}
    </Box>
  );
};

export default ChatWidgetContainer;