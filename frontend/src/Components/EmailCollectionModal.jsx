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
import { useLanguage } from '../utils/LanguageContext';
import { TEXT } from '../utils/constants';

const EmailCollectionModal = ({ open, onClose, question = '', conversationId = '', chatHistory = [], onSubmit, isExpanded = false }) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 DEBUG - EmailCollectionModal props:', { 
      open, 
      question, 
      conversationId, 
      chatHistoryLength: chatHistory.length
    });
  }
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { currentLanguage } = useLanguage();
  const langCode = currentLanguage.toUpperCase(); // Convert to uppercase to match TEXT keys

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      const errorMsg = langCode === 'ES' ? 'El correo electrónico es requerido' : 
                      langCode === 'ZH' ? '电子邮件是必需的' : 'Email is required';
      setError(errorMsg);
      return;
    }

    if (!firstName.trim()) {
      const errorMsg = langCode === 'ES' ? 'El nombre es requerido' : 
                      langCode === 'ZH' ? '名字是必需的' : 'First name is required';
      setError(errorMsg);
      return;
    }

    if (!lastName.trim()) {
      const errorMsg = langCode === 'ES' ? 'El apellido es requerido' : 
                      langCode === 'ZH' ? '姓氏是必需的' : 'Last name is required';
      setError(errorMsg);
      return;
    }

    if (!validateEmail(email)) {
      const errorMsg = langCode === 'ES' ? 'Por favor ingresa una dirección de correo electrónico válida' : 
                      langCode === 'ZH' ? '请输入有效的电子邮件地址' : 'Please enter a valid email address';
      setError(errorMsg);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      console.log('🔍 DEBUG - EmailCollectionModal submitting:', {
        email,
        firstName,
        lastName,
        phone,
        originalQuestion: question,
        conversationId,
        chatHistoryLength: chatHistory.length
      });
      
      await onSubmit({ email, firstName, lastName, phone }, question, conversationId, chatHistory);
      setEmail('');
      setFirstName('');
      setLastName('');
      setPhone('');
      onClose();
    } catch (error) {
      const errorMsg = langCode === 'ES' ? 'Error al enviar la solicitud. Por favor intenta de nuevo.' : 
                      langCode === 'ZH' ? '提交请求失败。请重试。' : 'Failed to submit request. Please try again.';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setEmail('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      sx={isExpanded ? {
        position: 'absolute',
        '& .MuiDialog-container': {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center'
        }
      } : {}}
    >
      <DialogTitle>
        {TEXT[langCode]?.EMAIL_MODAL_TITLE || TEXT.EN.EMAIL_MODAL_TITLE}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {TEXT[langCode]?.EMAIL_MODAL_DESCRIPTION || TEXT.EN.EMAIL_MODAL_DESCRIPTION}
        </Typography>
        
        {/* <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>{TEXT[langCode]?.EMAIL_MODAL_QUESTION_LABEL || TEXT.EN.EMAIL_MODAL_QUESTION_LABEL}</strong> {question}
          </Typography>
        </Box> */}

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label={TEXT[langCode]?.EMAIL_MODAL_FIRST_NAME || TEXT.EN.EMAIL_MODAL_FIRST_NAME}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isSubmitting}
          />
          <TextField
            fullWidth
            label={TEXT[langCode]?.EMAIL_MODAL_LAST_NAME || TEXT.EN.EMAIL_MODAL_LAST_NAME}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isSubmitting}
          />
        </Box>

        <TextField
          fullWidth
          label={TEXT[langCode]?.EMAIL_MODAL_EMAIL_LABEL || TEXT.EN.EMAIL_MODAL_EMAIL_LABEL}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label={TEXT[langCode]?.EMAIL_MODAL_PHONE || TEXT.EN.EMAIL_MODAL_PHONE}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isSubmitting}
          sx={{ mb: 2 }}
        />

        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Typography variant="caption" color="textSecondary">
          {TEXT[langCode]?.EMAIL_MODAL_FOOTER_TEXT || TEXT.EN.EMAIL_MODAL_FOOTER_TEXT}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          {TEXT[langCode]?.EMAIL_MODAL_CANCEL || TEXT.EN.EMAIL_MODAL_CANCEL}
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
        >
          {isSubmitting ? (TEXT[langCode]?.EMAIL_MODAL_SUBMITTING || TEXT.EN.EMAIL_MODAL_SUBMITTING) : (TEXT[langCode]?.EMAIL_MODAL_SUBMIT || TEXT.EN.EMAIL_MODAL_SUBMIT)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailCollectionModal;