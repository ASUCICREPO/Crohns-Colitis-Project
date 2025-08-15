import CONFIG from '../config';

class TranslationService {
  static async translate(text, targetLanguage) {
    try {
      if (!text || text.trim() === '') {
        return text;
      }

      // Skip translation in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('Translation skipped in development mode');
        return text;
      }

      const provider = CONFIG.translation?.provider || 'amazon';
      
      switch (provider.toLowerCase()) {
        case 'google':
          return await this.translateWithGoogle(text, targetLanguage);
        case 'amazon':
        default:
          return await this.translateWithAmazon(text, targetLanguage);
      }
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }

  static async translateWithAmazon(text, targetLanguage) {
    const response = await fetch(`${CONFIG.api.baseEndpoint}/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        sourceLanguage: 'en',
        targetLanguage: targetLanguage.toLowerCase() === 'es' ? 'es' : 'en'
      })
    });

    if (!response.ok) {
      throw new Error(`Amazon Translate API error: ${response.status}`);
    }

    const data = await response.json();
    return data.translatedText || text;
  }

  static async translateWithGoogle(text, targetLanguage) {
    const apiKey = CONFIG.translation?.googleApiKey;
    if (!apiKey) {
      throw new Error('Google Translate API key not configured');
    }

    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'en',
        target: targetLanguage.toLowerCase() === 'es' ? 'es' : 'en',
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data?.translations?.[0]?.translatedText || text;
  }

  // Helper method to determine if text needs translation
  static needsTranslation(text, currentLanguage) {
    if (!text || typeof text !== 'string') return false;
    
    // Simple heuristic: check if the text contains common words from the opposite language
    const spanishWords = ['el', 'la', 'los', 'las', 'es', 'son', 'está', 'están', 'por', 'para'];
    const englishWords = ['the', 'is', 'are', 'was', 'were', 'for', 'to', 'in', 'on', 'at'];
    
    const words = text.toLowerCase().split(/\s+/);
    const hasSpanishWords = spanishWords.some(word => words.includes(word));
    const hasEnglishWords = englishWords.some(word => words.includes(word));
    
    return (currentLanguage === 'ES' && hasEnglishWords) || 
           (currentLanguage === 'EN' && hasSpanishWords);
  }
}

export default TranslationService;