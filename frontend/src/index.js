import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import './i18n';

// Cross-browser viewport height fix for mobile browsers
function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Set initial viewport height
setViewportHeight();

// Update on resize and orientation change
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);

console.log("Environment variables check:", {
  API_ENDPOINT: process.env.REACT_APP_API_ENDPOINT,
  APPLICATION_ID: process.env.REACT_APP_APPLICATION_ID
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Touch device detection for cross-browser compatibility
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
  document.body.classList.add('touch-device');
}
