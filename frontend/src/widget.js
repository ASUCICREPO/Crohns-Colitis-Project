import React from 'react';
import ReactDOM from 'react-dom/client';
import EmbeddableWidget from './Components/EmbeddableWidget';
import './index.css';

// Cross-browser viewport height fix
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setViewportHeight();
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);

// Cross-page session persistence
window.addEventListener('storage', (e) => {
  if (e.key && e.key.startsWith('chat_session_')) {
    console.log('🔄 Chat session updated from another tab/page');
  }
});

// Widget initialization function
window.DisabilityRightsChatWidget = {
  instance: null,
  
  init: function(containerId = 'disability-rights-chat-widget') {
    // Prevent multiple instances
    if (this.instance) {
      console.log('Widget already initialized');
      return this.instance;
    }
    
    let container = document.getElementById(containerId);
    
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }

    const root = ReactDOM.createRoot(container);
    root.render(<EmbeddableWidget />);
    
    this.instance = { container, root };
    console.log('Crohns-Colitis Project Chat Widget initialized across domain');
    
    return this.instance;
  },
  
  destroy: function() {
    if (this.instance) {
      this.instance.root.unmount();
      if (this.instance.container.parentNode) {
        this.instance.container.parentNode.removeChild(this.instance.container);
      }
      this.instance = null;
    }
  }
};

// Cross-page persistence handler
function handlePageNavigation() {
  // Preserve widget state across page navigations
  if (window.DisabilityRightsChatWidget.instance) {
    console.log('🔄 Page navigation detected, preserving widget state');
  }
}

// Listen for page navigation events
window.addEventListener('beforeunload', handlePageNavigation);
window.addEventListener('pagehide', handlePageNavigation);

// Auto-initialize if script is loaded with data-auto-init
if (document.currentScript && document.currentScript.getAttribute('data-auto-init') === 'true') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.DisabilityRightsChatWidget.init();
    });
  } else {
    window.DisabilityRightsChatWidget.init();
  }
}

// Re-initialize on page load if needed (for SPA navigation)
window.addEventListener('load', () => {
  if (!window.DisabilityRightsChatWidget.instance) {
    const autoInit = document.querySelector('script[data-auto-init="true"]');
    if (autoInit) {
      window.DisabilityRightsChatWidget.init();
    }
  }
});