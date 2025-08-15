// Fixed marketing design languages - independent of chatbot languages
export const MARKETING_LANGUAGES = ['en', 'es', 'fr'];

// Check if language is supported for marketing content
export const isMarketingLanguageSupported = (langCode) => {
  return MARKETING_LANGUAGES.includes(langCode);
};

// Get fallback language for marketing if current language not supported
export const getMarketingLanguage = (currentLanguage) => {
  return isMarketingLanguageSupported(currentLanguage) ? currentLanguage : 'en';
};