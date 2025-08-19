import { DISABILITY_RIGHTS_VISION } from '../utils/constants';

/**
 * Service for handling Crohns-Colitis Project vision messages
 */
class DisabilityRightsService {
  /**
   * Get the Crohns-Colitis Project vision message for the current language
   * @param {string} language - The language code (EN or ES)
   * @returns {string} - The appropriate message for the language
   */
  static getMessage(language = 'EN') {
    return DISABILITY_RIGHTS_VISION[language] || DISABILITY_RIGHTS_VISION['EN'];
  }
}

export default DisabilityRightsService;