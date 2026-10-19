import React from 'react';
import { useTranslation } from 'react-i18next';
import { AVAILABLE_LANGUAGES } from '../i18n';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';

  const handleLanguageChange = (e) => {
    const selected = e.target.value;
    i18n.changeLanguage(selected);
    localStorage.setItem('agri_exchange_lang', selected);
  };

  return (
    <div className="language-switcher-container" style={{ display: 'inline-flex', alignItems: 'center' }}>
      <label htmlFor="language-select" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>
        Language
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{ position: 'absolute', left: '0.65rem', pointerEvents: 'none', fontSize: '0.85rem' }}>
          🌐
        </span>
        <select
          id="language-select"
          className="lang-switcher-select"
          value={currentLang}
          onChange={handleLanguageChange}
          style={{ paddingLeft: '1.9rem' }}
        >
          {AVAILABLE_LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
