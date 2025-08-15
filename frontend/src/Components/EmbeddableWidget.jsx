import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { LanguageProvider } from '../utils/LanguageContext';
import { TranscriptProvider } from '../utils/TranscriptContext';
import FloatingChatWidget from './FloatingChatWidget';
import theme from '../theme';

const EmbeddableWidget = () => {
  return (
    <ThemeProvider theme={theme}>
      <LanguageProvider>
        <TranscriptProvider>
          <FloatingChatWidget />
        </TranscriptProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default EmbeddableWidget;