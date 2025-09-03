import React from 'react';
import { Box, Typography } from '@mui/material';

const SpeechBubble = ({ message = "How can I help?" }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        backgroundColor: '#001A70',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 500,
        maxWidth: '120px',
        textAlign: 'center',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-6px',
          left: '20px',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: '6px solid #001A70',
        }
      }}
    >
      <Typography variant="caption" sx={{ color: 'white', fontSize: '11px' }}>
        {message}
      </Typography>
    </Box>
  );
};

export default SpeechBubble;