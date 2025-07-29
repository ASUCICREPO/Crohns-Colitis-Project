import CONFIG from '../config';

// --------------------------------------------------------------------------------------------------------//
// Primary color constants for the theme
export const PRIMARY_MAIN = "#444E56"; // The main primary color used for buttons, highlights, etc.
export const primary_50 = "#004D77"; // The 50 variant of the primary color

// Background color constants
export const SECONDARY_MAIN = "#D3D3D3"; // The main secondary color used for less prominent elements

// Chat component background colors
export const CHAT_BODY_BACKGROUND = "#FFFFFF"; // Background color for the chat body area
export const CHAT_LEFT_PANEL_BACKGROUND = "#11126F"; // Background color for the left panel in the chat
export const ABOUT_US_HEADER_BACKGROUND = "#FFFFFF"; // Background color for the About Us section in the left panel
export const FAQ_HEADER_BACKGROUND = "#FFFFFF"; // Background color for the FAQ section in the left panel
export const ABOUT_US_TEXT = "#FFFFFF"; // Text color for the About Us section in the left panel
export const FAQ_TEXT = "#FFFFFF"; // Text color for the FAQ section in the left panel
export const HEADER_BACKGROUND = "#FFFFFF"; // Background color for the header
export const HEADER_TEXT_GRADIENT = "#11126F"; // Text gradient color for the header

// Message background colors
export const BOTMESSAGE_BACKGROUND = "#d5dffe"; // Background color for messages sent by the bot
export const USERMESSAGE_BACKGROUND = "#dbf6ff"; // Background color for messages sent by the user

// --------------------------------------------------------------------------------------------------------//
// --------------------------------------------------------------------------------------------------------//

// Text Constants
export const TEXT = {
  EN: {
    APP_NAME: "Chatbot Template App",
    APP_ASSISTANT_NAME: "GenAI Bot",
    ABOUT_US_TITLE: "About us",
    ABOUT_US: "Welcome to the Crohn's and Colitis Foundation chat bot! We're here to assist to quickly access relevant information.",
    FAQ_TITLE: "Frequently Asked Questions",
    FAQS: [
      "What is Crohn's disease?",
      "I'm newly diagnosed, what do I need to know",
      "What are the main types of medications used to treat Crohn’s disease?",
      "Can medications cure Crohn’s disease?",
      "How does Crohn’s disease differ from ulcerative colitis?"
    ],
    CHAT_HEADER_TITLE: "Crohn's and Colitis Foundation",
    CHAT_INPUT_PLACEHOLDER: "Type a Query...",
    HELPER_TEXT: "Cannot send empty message",
    SPEECH_RECOGNITION_START: "Start Listening",
    SPEECH_RECOGNITION_STOP: "Stop Listening",
    SPEECH_RECOGNITION_HELPER_TEXT: "Stop speaking to send the message",
    THINKING: "Thinking...",
    NO_RESPONSE: "No response received",
    ERROR_MESSAGE: "Sorry, I encountered an error. Please try again later.",
    LOW_CONFIDENCE_MESSAGE: "I'm not completely confident in this answer. Would you like a human expert to follow up?",
    REQUEST_FOLLOWUP_BUTTON: "Request Human Follow-up",
    EMAIL_MODAL_TITLE: "Request Human Follow-up",
    EMAIL_MODAL_DESCRIPTION: "I wasn't able to provide a confident answer to your question. Would you like a human expert to follow up with you?",
    EMAIL_MODAL_QUESTION_LABEL: "Your Question:",
    EMAIL_MODAL_EMAIL_LABEL: "Email Address",
    EMAIL_MODAL_FOOTER_TEXT: "A human expert will review your question and respond within 24-48 hours.",
    EMAIL_MODAL_CANCEL: "Cancel",
    EMAIL_MODAL_SUBMIT: "Submit Request",
    EMAIL_MODAL_SUBMITTING: "Submitting...",
    EMAIL_SUCCESS_MESSAGE: "Thank you! Your request has been submitted successfully. A human expert will follow up with you within 24-48 hours."
  },
  ES: {
    APP_NAME: "Aplicación de Plantilla de Chatbot",
    APP_ASSISTANT_NAME: "Bot GenAI",
    ABOUT_US_TITLE: "Acerca de nosotros",
    ABOUT_US: "¡Bienvenido al chatbot GenAI! Estamos aquí para ayudarte a acceder rápidamente a la información relevante.",
    FAQ_TITLE: "Preguntas frecuentes",
    FAQS: [
      "¿Qué es la enfermedad de Crohn?",
      "Me acaban de diagnosticar, ¿qué necesito saber?",
      "¿Cuáles son los principales tipos de medicamentos utilizados para tratar la enfermedad de Crohn?",
      "¿Pueden los medicamentos curar la enfermedad de Crohn?",
      "¿En qué se diferencia la enfermedad de Crohn de la colitis ulcerosa?"
    ],
    CHAT_HEADER_TITLE: "Fundación de Crohn y Colitis",
    CHAT_INPUT_PLACEHOLDER: "Escribe una Consulta...",
    HELPER_TEXT: "No se puede enviar un mensaje vacío",
    SPEECH_RECOGNITION_START: "Comenzar a Escuchar",
    SPEECH_RECOGNITION_STOP: "Dejar de Escuchar",
    SPEECH_RECOGNITION_HELPER_TEXT: "Deja de hablar para enviar el mensaje",
    THINKING: "Pensando...",
    NO_RESPONSE: "No se recibió respuesta",
    ERROR_MESSAGE: "Lo siento, encontré un error. Por favor, inténtalo de nuevo más tarde.",
    LOW_CONFIDENCE_MESSAGE: "No estoy completamente seguro de esta respuesta. ¿Te gustaría que un experto humano te haga seguimiento?",
    REQUEST_FOLLOWUP_BUTTON: "Solicitar seguimiento humano",
    EMAIL_MODAL_TITLE: "Solicitar seguimiento humano",
    EMAIL_MODAL_DESCRIPTION: "No pude proporcionar una respuesta confiable a tu pregunta. ¿Te gustaría que un experto humano te haga seguimiento?",
    EMAIL_MODAL_QUESTION_LABEL: "Tu pregunta:",
    EMAIL_MODAL_EMAIL_LABEL: "Dirección de correo electrónico",
    EMAIL_MODAL_FOOTER_TEXT: "Un experto humano revisará tu pregunta y responderá dentro de 24-48 horas.",
    EMAIL_MODAL_CANCEL: "Cancelar",
    EMAIL_MODAL_SUBMIT: "Enviar solicitud",
    EMAIL_MODAL_SUBMITTING: "Enviando...",
    EMAIL_SUCCESS_MESSAGE: "¡Gracias! Tu solicitud ha sido enviada exitosamente. Un experto humano te hará seguimiento dentro de 24-48 horas."
  }
};

export const SWITCH_TEXT = {
  SWITCH_LANGUAGE_ENGLISH: "English",
  SWITCH_TOOLTIP_ENGLISH: "Note: If you toggle language, you will lost your current chat conversations.",
  SWITCH_LANGUAGE_SPANISH: "Español",
  SWITCH_TOOLTIP_SPANISH: "Nota: si cambia el idioma, perderá sus conversaciones de chat actuales."
};

export const LANDING_PAGE_TEXT = {
  EN: {
    CHOOSE_LANGUAGE: "Choose language:",
    ENGLISH: "English",
    SPANISH: "Español",
    SAVE_CONTINUE: "Save and Continue",
    APP_ASSISTANT_NAME: "Crohns and Colitis Foundation Bot Landing Page",
  },
  ES: {
    CHOOSE_LANGUAGE: "Elige el idioma:",
    ENGLISH: "English",
    SPANISH: "Español",
    SAVE_CONTINUE: "Guardar y continuar",
    APP_ASSISTANT_NAME: "Página de inicio del bot de conocimiento de DRTx",
  }
};

export const DISABILITY_RIGHTS_VISION = {
  EN: "tell about disability rights vision",
  ES: "tell about disability rights vision in Spanish"
};


// --------------------------------------------------------------------------------------------------------//
// --------------------------------------------------------------------------------------------------------//

// API endpoints


export const CHAT_API = process.env.REACT_APP_CHAT_API; // URL for the chat API endpoint
export const WEBSOCKET_API = process.env.REACT_APP_WEBSOCKET_API; // URL for the WebSocket API endpoint
export const AMAZON_Q_API = CONFIG.api.endpoint; // Amazon Q Business API endpoint

// --------------------------------------------------------------------------------------------------------//
// --------------------------------------------------------------------------------------------------------//

// Features
export const ALLOW_FILE_UPLOAD = false; // Set to true to enable file upload feature
export const ALLOW_VOICE_RECOGNITION = true; // Set to true to enable voice recognition feature
export const ALLOW_FEEDBACK = true; // Set to false to disable upvote/downvote feedback feature

export const ALLOW_MULTLINGUAL_TOGGLE = true; // Set to true to enable multilingual support
export const ALLOW_LANDING_PAGE = true; // Set to true to enable the landing page

// Bot response timing (in milliseconds) - set to 0 to disable
export const BOT_RESPONSE_DELAY = 1000; // Delay before showing bot's response
export const BOT_TYPING_SPEED = 50; // Milliseconds per character for typing effect (lower = faster, 0 = disabled)

// --------------------------------------------------------------------------------------------------------//
// Styling under work, would reccomend keeping it false for now
export const ALLOW_MARKDOWN_BOT = false; // Set to true to enable markdown support for bot messages
export const ALLOW_FAQ = true; // Set to true to enable the FAQs to be visible in Chat body 