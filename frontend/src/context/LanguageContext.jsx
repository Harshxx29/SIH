import React, { createContext, useState, useContext, useEffect } from 'react';
import { en } from '../locales/en';
// We don't need hi.js anymore because Google Translate handles everything!

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('app_language') || 'en');

  useEffect(() => {
    // Inject CSS to hide the Google Translate toolbar
    const style = document.createElement('style');
    style.innerHTML = `
      .skiptranslate { display: none !important; }
      body { top: 0 !important; }
      #google_translate_element { display: none !important; }
    `;
    document.head.appendChild(style);
  }, []);

  const changeLanguage = (lang) => {
    localStorage.setItem('app_language', lang);
    setLanguage(lang);
    
    // Set Google Translate cookie
    if (lang === 'en') {
      document.cookie = "googtrans=/en/en; path=/";
      document.cookie = "googtrans=/en/en; domain=" + window.location.hostname + "; path=/";
    } else {
      document.cookie = "googtrans=/en/" + lang + "; path=/";
      document.cookie = "googtrans=/en/" + lang + "; domain=" + window.location.hostname + "; path=/";
    }
    
    window.location.reload();
  };

  const t = (key) => {
    return en[key] || key; // We just return English text, Google Translate will translate the DOM.
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
