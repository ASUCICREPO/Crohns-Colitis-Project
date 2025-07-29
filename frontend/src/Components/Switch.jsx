import React from 'react';
import { useLanguage } from '../utilities/LanguageContext'; // Adjust the import path
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import { Box } from '@mui/material';
import { SWITCH_TEXT } from '../utilities/constants';

export default function Switch() {
  const { currentLanguage, toggleLanguage } = useLanguage();

  const handleLanguageChange = (newLanguage) => {
    if (newLanguage !== currentLanguage) {
      toggleLanguage();
    }
  };

  return (
    <Box>
      <ButtonGroup variant="contained" aria-label="Language button group">
        <Tooltip title={SWITCH_TEXT.SWITCH_TOOLTIP_ENGLISH} arrow>
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleLanguageChange('EN');
            }}
            variant={currentLanguage === 'EN' ? 'contained' : 'outlined'}
          >
            {SWITCH_TEXT.SWITCH_LANGUAGE_ENGLISH}
          </Button>
        </Tooltip>
        <Tooltip title={SWITCH_TEXT.SWITCH_TOOLTIP_SPANISH} arrow>
          <Button
            data-testid="language-toggle"
            onClick={(e) => {
              e.preventDefault();
              handleLanguageChange('ES');
            }}
            variant={currentLanguage === 'ES' ? 'contained' : 'outlined'}
          >
            {SWITCH_TEXT.SWITCH_LANGUAGE_SPANISH}
          </Button>
        </Tooltip>
      </ButtonGroup>
    </Box>
  );
}
