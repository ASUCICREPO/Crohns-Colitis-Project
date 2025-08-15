import CONFIG from '../config';

// --------------------------------------------------------------------------------------------------------//
// Primary color constants for the theme
export const PRIMARY_MAIN = "#444E56"; // The main primary color used for buttons, highlights, etc.
export const primary_50 = "#004D77"; // The 50 variant of the primary color

// Background color constants
export const SECONDARY_MAIN = "#D3D3D3"; // The main secondary color used for less prominent elements

// Chat component background colors - fce2cc
export const CHAT_BODY_BACKGROUND = "#FFFFFF"; // Background color for the chat body area

// Message background colors
export const BOTMESSAGE_BACKGROUND = "#dbf6ff"; // Background color for messages sent by the bot
export const USERMESSAGE_BACKGROUND = "#dbe3f9"; // Background color for messages sent by the user

// Bot heading color
export const BOT_HEADING_COLOR = "#1d8cca"; // Color for bot heading/header

// Additional UI colors
export const CHAT_INPUT_BACKGROUND = "#dbe3f9"; // Chat input box background color
export const FOLLOWUP_BUTTON_BACKGROUND = "#fce2cc"; // Request Follow Up button background
export const MARKETING_BUTTON_BACKGROUND = "#0080ac"; // Marketing widget button backgrounds

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
    REQUEST_FOLLOWUP_BUTTON: "Request Follow-up",
    EMAIL_MODAL_TITLE: "Request Follow-up",
    EMAIL_MODAL_DESCRIPTION: "I wasn't able to provide a confident answer to your question. Would you like a human expert to follow up with you?",
    EMAIL_MODAL_QUESTION_LABEL: "Your Question:",
    EMAIL_MODAL_EMAIL_LABEL: "Email Address",
    EMAIL_MODAL_FIRST_NAME: "First Name",
    EMAIL_MODAL_LAST_NAME: "Last Name",
    EMAIL_MODAL_PHONE: "Phone Number (Optional)",
    EMAIL_MODAL_FOOTER_TEXT: "A human expert will review your question and respond within 24-48 hours.",
    EMAIL_MODAL_CANCEL: "Cancel",
    EMAIL_MODAL_SUBMIT: "Submit Request",
    EMAIL_MODAL_SUBMITTING: "Submitting...",
    EMAIL_SUCCESS_MESSAGE: "Thank you! Your request has been submitted successfully. A human expert will follow up with you within 24-48 hours."
  },
  ZH: {
    APP_NAME: "聊天机器人模板应用",
    APP_ASSISTANT_NAME: "GenAI 机器人",
    ABOUT_US_TITLE: "关于我们",
    ABOUT_US: "欢迎使用克罗恩病和结肠炎基金会聊天机器人！我们在这里帮助您快速获取相关信息。",
    FAQ_TITLE: "常见问题",
    FAQS: [
      "什么是克罗恩病？",
      "我刚被诊断，我需要知道什么",
      "治疗克罗恩病的主要药物类型有哪些？",
      "药物能治愈克罗恩病吗？",
      "克罗恩病与溃疡性结肠炎有何不同？"
    ],
    CHAT_HEADER_TITLE: "克罗恩病和结肠炎基金会",
    CHAT_INPUT_PLACEHOLDER: "输入查询...",
    HELPER_TEXT: "无法发送空消息",
    SPEECH_RECOGNITION_START: "开始听取",
    SPEECH_RECOGNITION_STOP: "停止听取",
    SPEECH_RECOGNITION_HELPER_TEXT: "停止说话以发送消息",
    THINKING: "思考中...",
    NO_RESPONSE: "未收到回复",
    ERROR_MESSAGE: "抱歉，我遇到了错误。请稍后再试。",
    LOW_CONFIDENCE_MESSAGE: "我对这个答案不完全确信。您希望人类专家跟进吗？",
    REQUEST_FOLLOWUP_BUTTON: "请求人工跟进",
    EMAIL_MODAL_TITLE: "请求人工跟进",
    EMAIL_MODAL_DESCRIPTION: "我无法为您的问题提供确信的答案。您希望人类专家跟进吗？",
    EMAIL_MODAL_QUESTION_LABEL: "您的问题：",
    EMAIL_MODAL_EMAIL_LABEL: "电子邮件地址",
    EMAIL_MODAL_FIRST_NAME: "名字",
    EMAIL_MODAL_LAST_NAME: "姓氏",
    EMAIL_MODAL_PHONE: "电话号码（可选）",
    EMAIL_MODAL_FOOTER_TEXT: "人类专家将审查您的问题并在24-48小时内回复。",
    EMAIL_MODAL_CANCEL: "取消",
    EMAIL_MODAL_SUBMIT: "提交请求",
    EMAIL_MODAL_SUBMITTING: "提交中...",
    EMAIL_SUCCESS_MESSAGE: "谢谢！您的请求已成功提交。人类专家将在24-48小时内跟进。"
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
    EMAIL_MODAL_FIRST_NAME: "Nombre",
    EMAIL_MODAL_LAST_NAME: "Apellido",
    EMAIL_MODAL_PHONE: "Número de teléfono (Opcional)",
    EMAIL_MODAL_FOOTER_TEXT: "Un experto humano revisará tu pregunta y responderá dentro de 24-48 horas.",
    EMAIL_MODAL_CANCEL: "Cancelar",
    EMAIL_MODAL_SUBMIT: "Enviar solicitud",
    EMAIL_MODAL_SUBMITTING: "Enviando...",
    EMAIL_SUCCESS_MESSAGE: "¡Gracias! Tu solicitud ha sido enviada exitosamente. Un experto humano te hará seguimiento dentro de 24-48 horas."
  },
  FR: {
    APP_NAME: "Application de modèle de chatbot",
    APP_ASSISTANT_NAME: "Bot GenAI",
    ABOUT_US_TITLE: "À propos de nous",
    ABOUT_US: "Bienvenue au chatbot de la Fondation Crohn et Colite ! Nous sommes là pour vous aider à accéder rapidement aux informations pertinentes.",
    FAQ_TITLE: "Questions fréquemment posées",
    FAQS: [
      "Qu'est-ce que la maladie de Crohn ?",
      "Je viens d'être diagnostiqué, que dois-je savoir ?",
      "Quels sont les principaux types de médicaments utilisés pour traiter la maladie de Crohn ?",
      "Les médicaments peuvent-ils guérir la maladie de Crohn ?",
      "En quoi la maladie de Crohn diffère-t-elle de la colite ulcéreuse ?"
    ],
    CHAT_HEADER_TITLE: "Fondation Crohn et Colite",
    CHAT_INPUT_PLACEHOLDER: "Tapez une requête...",
    HELPER_TEXT: "Impossible d'envoyer un message vide",
    SPEECH_RECOGNITION_START: "Commencer l'écoute",
    SPEECH_RECOGNITION_STOP: "Arrêter l'écoute",
    SPEECH_RECOGNITION_HELPER_TEXT: "Arrêtez de parler pour envoyer le message",
    THINKING: "Réflexion...",
    NO_RESPONSE: "Aucune réponse reçue",
    ERROR_MESSAGE: "Désolé, j'ai rencontré une erreur. Veuillez réessayer plus tard.",
    LOW_CONFIDENCE_MESSAGE: "Je ne suis pas complètement confiant dans cette réponse. Aimeriez-vous qu'un expert humain vous suive ?",
    REQUEST_FOLLOWUP_BUTTON: "Demander un suivi humain",
    EMAIL_MODAL_TITLE: "Demander un suivi humain",
    EMAIL_MODAL_DESCRIPTION: "Je n'ai pas pu fournir une réponse confiante à votre question. Aimeriez-vous qu'un expert humain vous suive ?",
    EMAIL_MODAL_QUESTION_LABEL: "Votre question :",
    EMAIL_MODAL_EMAIL_LABEL: "Adresse e-mail",
    EMAIL_MODAL_FIRST_NAME: "Prénom",
    EMAIL_MODAL_LAST_NAME: "Nom de famille",
    EMAIL_MODAL_PHONE: "Numéro de téléphone (Optionnel)",
    EMAIL_MODAL_FOOTER_TEXT: "Un expert humain examinera votre question et répondra dans les 24-48 heures.",
    EMAIL_MODAL_CANCEL: "Annuler",
    EMAIL_MODAL_SUBMIT: "Soumettre la demande",
    EMAIL_MODAL_SUBMITTING: "Soumission...",
    EMAIL_SUCCESS_MESSAGE: "Merci ! Votre demande a été soumise avec succès. Un expert humain vous contactera dans les 24-48 heures."
  }
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
