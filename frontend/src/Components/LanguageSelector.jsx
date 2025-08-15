import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, TextField, List, ListItem, ListItemText, Popover, Chip, InputAdornment } from '@mui/material';
import { Search, Language, ExpandMore } from '@mui/icons-material';
import { CHATBOT_LANGUAGES as SUPPORTED_LANGUAGES, getPopularLanguages, searchLanguages } from '../utils/chatbotLanguageConfig';
import { getTranslation } from '../utils/translations';

const LanguageSelector = ({ currentLanguage, onLanguageChange }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLanguages, setFilteredLanguages] = useState(SUPPORTED_LANGUAGES);
  const buttonRef = useRef(null);

  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  const popularLanguages = getPopularLanguages();

  useEffect(() => {
    setFilteredLanguages(searchLanguages(searchQuery));
  }, [searchQuery]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchQuery('');
  };

  const handleLanguageSelect = (langCode) => {
    console.log('🔄 DEBUG - Language selected:', langCode, 'current:', currentLanguage);
    if (langCode !== currentLanguage) {
      console.log('🔄 DEBUG - Language change detected, calling onLanguageChange');
      onLanguageChange(langCode);
      
      console.log('🔄 DEBUG - Clearing session storage');
      sessionStorage.removeItem('chatbot_session');
      
      console.log('🔄 DEBUG - Checking for restartChatbot function:', typeof window.restartChatbot);
      if (window.restartChatbot) {
        console.log('🔄 DEBUG - Calling restartChatbot with:', langCode);
        window.restartChatbot(langCode);
      } else {
        console.log('🔄 DEBUG - restartChatbot function not found!');
      }
    }
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Button
        ref={buttonRef}
        variant="outlined"
        onClick={handleClick}
        startIcon={<Language />}
        endIcon={<ExpandMore />}

        sx={{
          minWidth: 120,
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          color: '#666',
          fontSize: '0.8rem',
          textTransform: 'none',
          '&:hover': {
            backgroundColor: '#f5f5f5',
            border: '1px solid #ccc'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <span>{currentLang.flag}</span>
          <span>{currentLang.code.toUpperCase()}</span>
        </Box>
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 400,
            mt: 1
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search languages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />
          
          {/* Language Switch Note */}
          <Box sx={{ fontSize: '0.75rem', color: '#666', mb: 2, fontStyle: 'italic' }}>
            *{getTranslation('languageSwitchTooltip', currentLanguage)}
          </Box>

          {/* Popular Languages */}
          {!searchQuery && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ fontSize: '0.8rem', color: '#666', mb: 1 }}>Popular</Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {popularLanguages.map((lang) => (
                  <Chip
                    key={lang.code}
                    label={`${lang.flag} ${lang.name}`}
                    size="small"
                    variant={currentLanguage === lang.code ? 'filled' : 'outlined'}
                    onClick={() => handleLanguageSelect(lang.code)}
                    sx={{
                      fontSize: '0.7rem',
                      height: 24,
                      backgroundColor: currentLanguage === lang.code ? '#004D77' : 'transparent',
                      color: currentLanguage === lang.code ? 'white' : '#666',
                      '&:hover': {
                        backgroundColor: currentLanguage === lang.code ? '#003A5C' : '#f0f0f0'
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* All Languages */}
          <Box sx={{ fontSize: '0.8rem', color: '#666', mb: 1 }}>
            {searchQuery ? `Results (${filteredLanguages.length})` : 'All Languages'}
          </Box>
          <List sx={{ maxHeight: 200, overflow: 'auto', p: 0 }}>
            {filteredLanguages.map((lang) => (
              <ListItem
                key={lang.code}
                button
                onClick={() => handleLanguageSelect(lang.code)}
                selected={currentLanguage === lang.code}
                sx={{
                  py: 0.5,
                  px: 1,
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: '#004D77',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#003A5C'
                    }
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                  <Box sx={{ flex: 1 }}>
                    <ListItemText
                      primary={lang.name}
                      secondary={lang.nativeName !== lang.name ? lang.nativeName : null}
                      primaryTypographyProps={{ fontSize: '0.85rem' }}
                      secondaryTypographyProps={{ 
                        fontSize: '0.75rem',
                        color: currentLanguage === lang.code ? 'rgba(255,255,255,0.7)' : '#999'
                      }}
                    />
                  </Box>
                  <Box sx={{ fontSize: '0.7rem', color: currentLanguage === lang.code ? 'rgba(255,255,255,0.7)' : '#999' }}>
                    {lang.code.toUpperCase()}
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </Box>
      </Popover>
    </>
  );
};

export default LanguageSelector;