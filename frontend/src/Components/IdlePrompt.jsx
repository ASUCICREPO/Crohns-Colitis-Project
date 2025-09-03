import React, { useState, useEffect } from 'react';
import { Grid, Avatar, Box, Typography, Button } from '@mui/material';
import BotAvatar from '../Assets/gutsybotsize.png';
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

  // Auto-trigger countdown after 15 seconds if no response
  useEffect(() => {
    const autoTimer = setTimeout(() => {
      setShowCountdown(true);
    }, 15000);
    
    return () => clearTimeout(autoTimer);
  }, []);

  const handleNo = () => {
    setShowCountdown(true);
  };

  const handleYes = () => {
    onContinue();
  };

  return (
    <Box mb={2}>
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
          <Typography variant="body2" sx={{ mb: 2 }}>
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default IdlePrompt;