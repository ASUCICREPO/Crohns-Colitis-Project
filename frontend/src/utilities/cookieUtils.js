/**
 * Cookie utilities for session management
 * Compatible with Chrome, Safari, Edge, Firefox, Brave
 */
export const CookieUtils = {
  /**
   * Detect browser for compatibility
   */
  getBrowserInfo() {
    const ua = navigator.userAgent;
    const browsers = {
      chrome: /Chrome/.test(ua) && !/Edg/.test(ua),
      safari: /Safari/.test(ua) && !/Chrome/.test(ua),
      firefox: /Firefox/.test(ua),
      edge: /Edg/.test(ua),
      brave: navigator.brave && navigator.brave.isBrave
    };
    return browsers;
  },

  /**
   * Check if cookies are enabled
   */
  areCookiesEnabled() {
    try {
      document.cookie = 'cookietest=1; path=/; SameSite=Lax';
      const enabled = document.cookie.indexOf('cookietest=') !== -1;
      document.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=/';
      return enabled;
    } catch (e) {
      return false;
    }
  },
  /**
   * Get or create session ID
   */
  getSessionId() {
    console.log('🍪 DEBUG - Getting session ID for page:', window.location.pathname);
    console.log('🍪 DEBUG - Current document.cookie:', document.cookie);
    
    const browserInfo = this.getBrowserInfo();
    const cookiesEnabled = this.areCookiesEnabled();
    console.log('🍪 DEBUG - Browser info:', browserInfo);
    console.log('🍪 DEBUG - Cookies enabled:', cookiesEnabled);
    
    if (!cookiesEnabled) {
      console.warn('🍪 WARNING - Cookies are disabled, using fallback session ID');
      return 'fallback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    let sessionId = this.getCookie('chatSessionId');
    console.log('🍪 DEBUG - Retrieved sessionId from cookie:', sessionId);
    
    if (!sessionId) {
      // Generate browser-compatible session ID
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      console.log('🍪 DEBUG - Generated new sessionId for cross-page use:', sessionId);
      
      this.setCookie('chatSessionId', sessionId); // Session cookie (no expiry)
      console.log('🍪 DEBUG - Set new session cookie with sessionId:', sessionId);
      
      // Verify cookie was set across browsers
      setTimeout(() => {
        const verifyId = this.getCookie('chatSessionId');
        console.log('🍪 DEBUG - Verified cookie after setting:', verifyId);
        if (!verifyId) {
          console.warn('🍪 WARNING - Cookie verification failed, may have browser restrictions');
        }
      }, 100);
    } else {
      console.log('🍪 DEBUG - Using existing cross-page sessionId:', sessionId);
    }
    
    return sessionId;
  },

  /**
   * Set cookie
   */
  setCookie(name, value, days = null) {
    let cookieString;
    if (days === null) {
      // Session cookie - works across all pages on same domain
      cookieString = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
    } else {
      // Persistent cookie
      const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
      cookieString = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
    }
    
    // Fallback for older browsers that don't support SameSite
    try {
      document.cookie = cookieString;
    } catch (e) {
      // Fallback without SameSite for older browsers
      const fallbackString = days === null 
        ? `${name}=${encodeURIComponent(value)}; path=/`
        : `${name}=${encodeURIComponent(value)}; expires=${new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()}; path=/`;
      document.cookie = fallbackString;
    }
    
    console.log('🍪 DEBUG - Setting cross-page cookie:', cookieString);
    console.log('🍪 DEBUG - Cookie set. Current document.cookie:', document.cookie);
  },

  /**
   * Get cookie
   */
  getCookie(name) {
    console.log('🍪 DEBUG - Looking for cookie:', name);
    console.log('🍪 DEBUG - In document.cookie:', document.cookie);
    
    if (!document.cookie) {
      console.log('🍪 DEBUG - No cookies found');
      return null;
    }
    
    // Cross-browser compatible cookie parsing
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1, cookie.length);
      }
      if (cookie.indexOf(nameEQ) === 0) {
        const result = decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
        console.log('🍪 DEBUG - Found cookie value:', result);
        return result;
      }
    }
    
    console.log('🍪 DEBUG - Cookie not found');
    return null;
  }
};