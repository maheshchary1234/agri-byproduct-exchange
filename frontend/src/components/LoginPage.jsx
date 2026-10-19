import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEMO_USERS } from '../services/api';

export default function LoginPage({ 
  onLoginSuccess, 
  onNavigateToFarmerRegister, 
  onNavigateToBuyerRegister,
  onNavigateToMarketplace 
}) {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState('Farmer'); // Farmer / Buyer / Admin
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Please enter your username or mobile number.');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await onLoginSuccess({
        username: username.trim(),
        password: password.trim(),
        role: selectedRole
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill helper for testing
  const handleQuickFill = (roleType) => {
    setErrorMessage('');
    if (roleType === 'Farmer') {
      setSelectedRole('Farmer');
      setUsername(DEMO_USERS.FARMER.email);
      setPassword('Password123!');
    } else if (roleType === 'Buyer') {
      setSelectedRole('Buyer');
      setUsername(DEMO_USERS.BUYER.email);
      setPassword('Password123!');
    } else if (roleType === 'Admin') {
      setSelectedRole('Admin');
      setUsername(DEMO_USERS.ADMIN.email);
      setPassword('Password123!');
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container">
        
        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-brand-badge">
            <span className="auth-brand-icon">🌾</span>
            <span className="auth-brand-tag">{t('nav.national_platform_badge')}</span>
          </div>
          <h1 className="auth-title">{t('auth.login_title')}</h1>
          <p className="auth-subtitle">
            {t('auth.login_subtitle')}
          </p>
        </div>

        {/* Role Selection (Farmer / Buyer / Admin) */}
        <div className="auth-role-selector-section">
          <label className="auth-field-label">{t('auth.select_role')}</label>
          <div className="auth-role-toggle-group" role="radiogroup" aria-label="Role selection">
            <button
              type="button"
              className={`auth-role-card ${selectedRole === 'Farmer' ? 'active farmer-active' : ''}`}
              onClick={() => setSelectedRole('Farmer')}
              role="radio"
              aria-checked={selectedRole === 'Farmer'}
            >
              <div className="role-icon-bubble">🌾</div>
              <div className="role-text-box">
                <span className="role-name">{t('nav.farmer')}</span>
                <span className="role-caption">Producer & Seller</span>
              </div>
              {selectedRole === 'Farmer' && <span className="role-check-indicator">✓</span>}
            </button>

            <button
              type="button"
              className={`auth-role-card ${selectedRole === 'Buyer' ? 'active buyer-active' : ''}`}
              onClick={() => setSelectedRole('Buyer')}
              role="radio"
              aria-checked={selectedRole === 'Buyer'}
            >
              <div className="role-icon-bubble">🏭</div>
              <div className="role-text-box">
                <span className="role-name">{t('nav.buyer')}</span>
                <span className="role-caption">Bio-Plant & Mill</span>
              </div>
              {selectedRole === 'Buyer' && <span className="role-check-indicator">✓</span>}
            </button>

            <button
              type="button"
              className={`auth-role-card ${selectedRole === 'Admin' ? 'active admin-active' : ''}`}
              onClick={() => setSelectedRole('Admin')}
              role="radio"
              aria-checked={selectedRole === 'Admin'}
            >
              <div className="role-icon-bubble">🛡️</div>
              <div className="role-text-box">
                <span className="role-name">{t('nav.admin')}</span>
                <span className="role-caption">Central Oversight</span>
              </div>
              {selectedRole === 'Admin' && <span className="role-check-indicator">✓</span>}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="auth-error-banner" role="alert">
            <span className="error-icon">⚠️</span>
            <div className="error-text">{errorMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Username / Mobile field */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">
              {t('auth.field_username')}
            </label>
            <div className="input-with-icon">
              <span className="input-left-icon">👤</span>
              <input
                id="login-username"
                type="text"
                className="form-input custom-auth-input"
                placeholder={selectedRole === 'Farmer' ? 'e.g. gurpreet or 9814123456' : selectedRole === 'Buyer' ? 'e.g. dr_mehta or 9811067890' : 'e.g. admin'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="login-password">
                {t('auth.field_password')}
              </label>
              <span className="form-hint-note">Default: Password123!</span>
            </div>
            <div className="input-with-icon">
              <span className="input-left-icon">🔒</span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input custom-auth-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="input-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="auth-primary-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="btn-spinner-wrap">
                <span className="spinner-dot"></span> Authenticating...
              </span>
            ) : (
              <span>{t('auth.btn_login')} ({selectedRole === 'Farmer' ? t('nav.farmer') : selectedRole === 'Buyer' ? t('nav.buyer') : t('nav.admin')}) →</span>
            )}
          </button>
        </form>

        {/* Register Links Section */}
        <div className="auth-switch-section">
          <p className="auth-switch-prompt">{t('auth.no_account')}</p>
          <div className="auth-register-links-row">
            <button
              type="button"
              className="auth-link-pill farmer-pill"
              onClick={onNavigateToFarmerRegister}
            >
              🌾 {t('auth.register_farmer')}
            </button>
            <button
              type="button"
              className="auth-link-pill buyer-pill"
              onClick={onNavigateToBuyerRegister}
            >
              🏭 {t('auth.register_buyer')}
            </button>
          </div>
        </div>

        {/* 1-Click Quick Fill Strip for effortless demonstration */}
        <div className="auth-demo-quickfill">
          <span className="quickfill-label">⚡ {t('auth.quick_fill_role')}</span>
          <div className="quickfill-btn-group">
            <button 
              type="button" 
              className="quickfill-btn"
              onClick={() => handleQuickFill('Farmer')}
            >
              🌾 {t('nav.farmer')} (Gurpreet)
            </button>
            <button 
              type="button" 
              className="quickfill-btn"
              onClick={() => handleQuickFill('Buyer')}
            >
              🏭 {t('nav.buyer')} (Dr. Mehta)
            </button>
            <button 
              type="button" 
              className="quickfill-btn"
              onClick={() => handleQuickFill('Admin')}
            >
              🛡️ {t('nav.admin')} HQ
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
