import React, { useState } from 'react';
import { Box, Button, Typography, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { useLanguage } from '../utils/LanguageContext';
import { useCookies } from 'react-cookie';
import { LANDING_PAGE_TEXT } from '../utils/constants';

const LandingPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('EN');
  const { setLanguage } = useLanguage();
  const [, setCookie] = useCookies(['language']);

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
  };

  const handleSaveLanguage = () => {
    setLanguage(selectedLanguage);
    setCookie('language', selectedLanguage, { path: '/' });
    window.location.reload();
  };

  const texts = LANDING_PAGE_TEXT[selectedLanguage];

  return (
    <Box height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center" p={4}>
      <Typography variant="h4" gutterBottom sx={{ color: '#004D77', mb: 4 }}>
        Disability Rights Texas Chat
      </Typography>
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <Typography variant="h5" gutterBottom>
          {texts.CHOOSE_LANGUAGE}
        </Typography>
        <RadioGroup value={selectedLanguage} onChange={handleLanguageChange}>
          <FormControlLabel value="EN" control={<Radio />} label={texts.ENGLISH} />
          <FormControlLabel value="ES" control={<Radio />} label={texts.SPANISH} />
        </RadioGroup>
        <Button variant="contained" onClick={handleSaveLanguage} sx={{ mt: 2, backgroundColor: '#004D77' }}>
          {texts.SAVE_CONTINUE}
        </Button>
      </Box>
    </Box>
  );
};

export default LandingPage;
