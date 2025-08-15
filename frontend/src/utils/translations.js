import { useTranslation } from 'react-i18next';

// Hook for using translations
export const useAppTranslation = () => {
  const { t, i18n } = useTranslation();
  return { t, i18n };
};

// Get translation for current language, fallback to English
export const getTranslation = (key, language = 'en') => {
  console.log('🔄 DEBUG - getTranslation called with key:', key, 'language:', language);
  const translations = {
    en: {
      welcome: "Hi! This is Coli. How can I help you today?",
      exampleQuestions: [
        "What is IBD?",
        "What is Crohn's disease?",
        "What is UC (Ulcerative colitis)?"
      ],
      chatInputPlaceholder: "Type your message here...",
      loading: "Loading...",
      errorMessage: "I'm sorry, I encountered an error. Please try again.",
      lowConfidenceMessage: "I apologize; I am not able to answer this question. Would you like to be connected to someone in our Help Center?",
      emailSuccessMessage: "Your request has been submitted. Someone from the Help Center will reach out to you within 48-72 hours. Thank you for using the Disability Rights Texas AI assistant. Take care and have a great day.",
      emptyStateMessage: "Start a conversation by typing a message below.",
      requestFollowUp: "REQUEST FOLLOW-UP",
      chatTitle: "Crohns & Colitis Bot",
      disclaimer: "Note: *This chatbot provides general information only. For medical concerns, please consult your healthcare professional.",
      helperText: "Cannot send empty message",
      speechRecognitionHelperText: "Stop speaking to send the message",
      languageSwitchTooltip: "Note: switching to another language will lose current conversation"
    },
    es: {
      welcome: "¡Hola! Soy Coli. ¿Cómo puedo ayudarte hoy?",
      exampleQuestions: [
        "¿Qué es la EII?",
        "¿Qué es la enfermedad de Crohn?",
        "¿Qué es la CU (Colitis ulcerosa)?"
      ],
      chatInputPlaceholder: "Escribe tu mensaje aquí...",
      loading: "Cargando...",
      errorMessage: "Lo siento, encontré un error. Por favor, inténtalo de nuevo.",
      lowConfidenceMessage: "Me disculpo; no puedo responder esta pregunta. ¿Te gustaría conectarte con alguien de nuestro Centro de Ayuda?",
      emailSuccessMessage: "Tu solicitud ha sido enviada. Alguien del Centro de Ayuda se comunicará contigo dentro de 48-72 horas. Gracias por usar el asistente de IA de Disability Rights Texas. Cuídate y que tengas un gran día.",
      emptyStateMessage: "Inicia una conversación escribiendo un mensaje abajo.",
      requestFollowUp: "SOLICITAR SEGUIMIENTO",
      chatTitle: "Bot de Crohns & Colitis Foundation",
      disclaimer: "Nota: *Este chatbot proporciona solo información general. Para preocupaciones médicas, consulte a su profesional de la salud.",
      helperText: "No se puede enviar un mensaje vacío",
      speechRecognitionHelperText: "Deja de hablar para enviar el mensaje",
      languageSwitchTooltip: "Nota: cambiar a otro idioma perderá la conversación actual"
    }
  };
  const result = translations[language]?.[key] || translations.en[key] || key;
  console.log('🔄 DEBUG - getTranslation result:', result);
  return result;
};