// Dynamic chatbot language configuration
export const CHATBOT_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', popular: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', popular: true }
];

// Auto-detect user's preferred language
export const detectUserLanguage = () => {
  const browserLang = navigator.language.split('-')[0];
  const supported = CHATBOT_LANGUAGES.find(lang => lang.code === browserLang);
  return supported ? browserLang : 'en';
};

// Get popular languages for quick access
export const getPopularLanguages = () => {
  return CHATBOT_LANGUAGES.filter(lang => lang.popular);
};

// Search languages by name or native name
export const searchLanguages = (query) => {
  if (!query) return CHATBOT_LANGUAGES;
  
  const lowerQuery = query.toLowerCase();
  return CHATBOT_LANGUAGES.filter(lang => 
    lang.name.toLowerCase().includes(lowerQuery) ||
    lang.nativeName.toLowerCase().includes(lowerQuery)
  );
};