import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: "Hello! Welcome to Disability Rights Texas bot. I can communicate in multiple languages - feel free to ask questions in your preferred language and I'll respond accordingly. How can I help you?",
      chatInputPlaceholder: "Type your message here...",
      loading: "Loading...",
      errorMessage: "I'm sorry, I encountered an error. Please try again.",
      lowConfidenceMessage: "I apologize; I am not able to answer this question. Would you like to be connected to someone in our Help Center?",
      lowConfidenceShort: "I apologize; I am not able to answer this question.",
      emailSuccessMessage: "Your request has been submitted. Someone from the Help Center will reach out to you within 48-72 hours. Thank you for using the Disability Rights Texas AI assistant. Take care and have a great day.",
      emptyStateMessage: "Start a conversation by typing a message below.",
      requestFollowUp: "REQUEST FOLLOW-UP",
      chatTitle: "Disability Rights Texas Bot"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;