// Dynamic constants that get populated automatically by the deployment process

// Primary color constants for the theme
export const PRIMARY_MAIN = "#1F0F40" // Dark purple for nav panel
export const primary_50 = "#E7E3F0" // Light purple for chat bubbles
export const SECONDARY_MAIN = "#D3D3D3" // Secondary color

// Background color constants
export const CHAT_BODY_BACKGROUND = "#FFFFF7" // White background for chat
export const CHAT_LEFT_PANEL_BACKGROUND = "#1F0F40" // Dark purple for left panel
export const ABOUT_US_HEADER_BACKGROUND = "#FFFFFF" // White text for headers in left panel
export const FAQ_HEADER_BACKGROUND = "#FFFFFF" // White text for headers in left panel
export const ABOUT_US_TEXT = "#FFFFFF" // White text for about us
export const FAQ_TEXT = "#FFFFFF" // White text for FAQs
export const HEADER_BACKGROUND = "#FFFFFF" // White background for header
export const HEADER_TEXT_GRADIENT = "#1F0F40" // Dark purple for header text

// Message background colors
export const BOTMESSAGE_BACKGROUND = "#DDEAF3" // Light purple for bot messages
export const USERMESSAGE_BACKGROUND = "#E7E3F0" // Light purple for user messages

// API endpoints - These are automatically populated by the deployment process
// The CDK will inject these values as environment variables in Amplify
const getApiBaseUrl = () => {
  // In production (Amplify), use environment variables
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL
  }

  // Check for runtime environment variables (injected by Amplify)
  if (typeof window !== "undefined" && window.ENV?.REACT_APP_API_BASE_URL) {
    return window.ENV.REACT_APP_API_BASE_URL
  }

  // If no API URL is configured, throw an error instead of using localhost
  throw new Error("API Base URL not configured. Please set REACT_APP_API_BASE_URL environment variable.")
}

export const API_BASE_URL = getApiBaseUrl()
export const CHAT_ENDPOINT =
  process.env.REACT_APP_CHAT_ENDPOINT ||
  (typeof window !== "undefined" && window.ENV?.REACT_APP_CHAT_ENDPOINT) ||
  `${API_BASE_URL}/chat`
export const HEALTH_ENDPOINT =
  process.env.REACT_APP_HEALTH_ENDPOINT ||
  (typeof window !== "undefined" && window.ENV?.REACT_APP_HEALTH_ENDPOINT) ||
  `${API_BASE_URL}/health`

// Features
export const ALLOW_FILE_UPLOAD = false
export const ALLOW_FAQ = true

// Text Constants
export const TEXT = {
  APP_NAME: "Crohns Colitis AI Assistant",
  APP_ASSISTANT_NAME: "Crohns Colitis AI Assistant",
  ABOUT_US_TITLE: "About us",
  ABOUT_US:
    "Welcome to the Crohns Colitis AI Assistant. We bring together medical information and resources in one place so you can quickly find help or information about Crohn's disease and ulcerative colitis. Our assistant provides evidence-based information from trusted medical sources to help patients, caregivers, and healthcare providers understand these inflammatory bowel diseases.",
  FAQ_TITLE: "FAQs",
  FAQS: [
    "What is Crohn's disease?",
    "What is ulcerative colitis?",
    "What are the symptoms of IBD?",
    "How is Crohn's disease treated?",
  ],
  CHAT_HEADER_TITLE: "Crohns Colitis AI Assistant",
  CHAT_INPUT_PLACEHOLDER: "Type your query here...",
  HELPER_TEXT: "Cannot send empty message",
}

// Log configuration info (for debugging)
if (process.env.NODE_ENV === "development") {
  console.log("🔧 API Configuration:", {
    API_BASE_URL,
    CHAT_ENDPOINT,
    HEALTH_ENDPOINT,
  })
}

// Runtime configuration check
if (typeof window !== "undefined" && !process.env.REACT_APP_API_BASE_URL && !window.ENV?.REACT_APP_API_BASE_URL) {
  console.warn("⚠️ API endpoints not configured properly.")
  console.log("💡 Make sure REACT_APP_API_BASE_URL is set in your environment variables.")
}
