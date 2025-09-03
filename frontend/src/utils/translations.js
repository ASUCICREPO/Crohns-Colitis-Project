// Get translation for current language, fallback to English
export const getTranslation = (key, language = 'en') => {
  console.log('🔄 DEBUG - getTranslation called with key:', key, 'language:', language);
  const translations = {
    en: {
      welcome: "Hi! This is Gutsy. How can I help you today?",
      exampleQuestions: [
        "What is Crohn's disease?",
      "What is ulcerative colitis?",
      "What can I eat with IBD?"
      ],
      chatInputPlaceholder: "Type your message here...",
      loading: "Loading...",
      errorMessage: "I'm sorry, I encountered an error. Please try again.",
      lowConfidenceMessage: "I apologize; I am not able to answer this question. Would you like to be connected to someone in our Help Center?",
      emailSuccessMessage: "Your request has been submitted. Someone from the Help Center will reach out to you within 48-72 hours. Thank you for using the Crohns-Colitis Project AI assistant. Take care and have a great day.",
      idleMessage: "Are you still there? Would you like to continue our conversation?",
      yes: "Yes",
      no: "No",
      closingIn: "Closing chat in",
      seconds: "seconds",
      idleYesResponse: "I am listening, please type your question below, and I will do my best to help.",
      idleNoResponse: "Nice chatting with you. I am here anytime you need assistance on anything IBD related. Have a wonderful day.",
      emptyStateMessage: "Start a conversation by typing a message below.",
      requestFollowUp: "REQUEST FOLLOW-UP",
      chatTitle: "Crohns & Colitis Bot",
      disclaimer: "Note: *This chatbot provides general information only. For medical concerns, please consult your healthcare professional.",
      helperText: "Cannot send empty message",
      speechRecognitionHelperText: "Stop speaking to send the message",
      languageSwitchTooltip: "Note: switching to another language will lose current conversation"
    },
    es: {
      welcome: "¡Hola! Soy Gutsy. ¿Cómo puedo ayudarte hoy?",
      exampleQuestions: [
        "¿Qué es la enfermedad de Crohn?", 
        "¿Qué es la colitis ulcerosa?", 
        "¿Qué puedo comer si tengo EII?"
      ],
      chatInputPlaceholder: "Escribe tu mensaje aquí...",
      loading: "Cargando...",
      errorMessage: "Lo siento, encontré un error. Por favor, inténtalo de nuevo.",
      lowConfidenceMessage: "Me disculpo; no puedo responder esta pregunta. ¿Te gustaría conectarte con alguien de nuestro Centro de Ayuda?",
      emailSuccessMessage: "Tu solicitud ha sido enviada. Alguien del Centro de Ayuda se comunicará contigo dentro de 48-72 horas. Gracias por usar el asistente de IA de Crohns-Colitis Project. Cuídate y que tengas un gran día.",
      idleMessage: "¿Sigues ahí? ¿Te gustaría continuar nuestra conversación?",
      yes: "Sí",
      no: "No",
      closingIn: "Cerrando chat en",
      seconds: "segundos",
      idleYesResponse: "Te escucho, por favor escribe tu pregunta a continuación y haré mi mejor esfuerzo para ayudarte.",
      idleNoResponse: "Fue un placer conversar contigo. Estoy aquí cuando necesites asistencia sobre cualquier tema relacionado con EII. Que tengas un día maravilloso.",
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