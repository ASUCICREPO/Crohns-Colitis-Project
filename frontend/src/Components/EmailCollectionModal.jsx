import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { useLanguage } from '../utilities/LanguageContext';
import { TEXT } from '../utilities/constants';

const EmailCollectionModal = ({ open, onClose, question = '', conversationId = '', chatHistory = [], onSubmit }) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 DEBUG - EmailCollectionModal props:', { 
      open, 
      question, 
      conversationId, 
      chatHistoryLength: chatHistory.length
    });
  }
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { currentLanguage } = useLanguage();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError(currentLanguage === 'ES' ? 'El correo electrónico es requerido' : 'Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError(currentLanguage === 'ES' ? 'Por favor ingresa una dirección de correo electrónico válida' : 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('🔍 DEBUG - EmailCollectionModal submitting:', {
        email,
        originalQuestion: question,
        conversationId,
        chatHistoryLength: chatHistory.length
      });
      
      await onSubmit(email, question, conversationId, chatHistory);
      setEmail('');
      onClose();
    } catch (error) {
      setError(currentLanguage === 'ES' ? 'Error al enviar la solicitud. Por favor intenta de nuevo.' : 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setEmail('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {TEXT[currentLanguage].EMAIL_MODAL_TITLE}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {TEXT[currentLanguage].EMAIL_MODAL_DESCRIPTION}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>{TEXT[currentLanguage].EMAIL_MODAL_QUESTION_LABEL}</strong> {question}
          </Typography>
        </Box>

        <TextField
          fullWidth
          label={TEXT[currentLanguage].EMAIL_MODAL_EMAIL_LABEL}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!error}
          helperText={error}
          disabled={isSubmitting}
          sx={{ mb: 2 }}
        />

        <Typography variant="caption" color="textSecondary">
          {TEXT[currentLanguage].EMAIL_MODAL_FOOTER_TEXT}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          {TEXT[currentLanguage].EMAIL_MODAL_CANCEL}
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
        >
          {isSubmitting ? TEXT[currentLanguage].EMAIL_MODAL_SUBMITTING : TEXT[currentLanguage].EMAIL_MODAL_SUBMIT}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailCollectionModal;