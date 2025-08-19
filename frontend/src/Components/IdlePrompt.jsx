import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { getTranslation } from '../utils/translations';

const IdlePrompt = ({ language, onContinue, onClose }) => {
  const [countdown, setCountdown] = useState(15);
  const [showCountdown, setShowCountdown] = useState(false);

  useEffect(() => {
    let timer;
    if (showCountdown && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (showCountdown && countdown === 0) {
      onClose();
    }
    return () => clearTimeout(timer);
  }, [countdown, showCountdown, onClose]);

  const handleNo = () => {
    setShowCountdown(true);
  };

  const handleYes = () => {
    onContinue();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: 2
      }}
    >
      <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
        {getTranslation('idleMessage', language)}
      </Typography>
      
      {!showCountdown ? (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleYes}
            sx={{
              backgroundColor: '#004D77',
              '&:hover': { backgroundColor: '#003A5C' }
            }}
          >
            {getTranslation('yes', language)}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleNo}
            sx={{
              borderColor: '#004D77',
              color: '#004D77',
              '&:hover': { borderColor: '#003A5C', color: '#003A5C' }
            }}
          >
            {getTranslation('no', language)}
          </Button>
        </Box>
      ) : (
        <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
          {getTranslation('closingIn', language)} {countdown} {getTranslation('seconds', language)}...
        </Typography>
      )}
    </Paper>
  );
};

export default IdlePrompt;