import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function FarmerRegisterPage({ 
  onRegisterSuccess, 
  onNavigateToLogin, 
  onNavigateToBuyerRegister 
}) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [landAreaAcres, setLandAreaAcres] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Password strength calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'transparent' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 25, label: 'Weak', color: '#f43f5e' };
    if (score === 2) return { score: 50, label: 'Moderate', color: '#f59e0b' };
    if (score === 3) return { score: 75, label: 'Good', color: '#3b82f6' };
    return { score: 100, label: 'Strong & Secure', color: '#10b981' };
  };

  const strength = getPasswordStrength(password);

  // Validate and submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setErrorMessage('Please enter a username for your farmer account.');
      return;
    }
    if (cleanUsername.length < 3) {
      setErrorMessage('Username must be at least 3 characters.');
      return;
    }

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (!cleanMobile) {
      setErrorMessage('Please enter your 10-digit mobile number.');
      return;
    }
    if (cleanMobile.length !== 10) {
      setErrorMessage('Mobile number must be exactly 10 digits (e.g. 9814123456).');
      return;
    }

    const acres = parseFloat(landAreaAcres);
    if (!landAreaAcres || isNaN(acres) || acres <= 0) {
      setErrorMessage('Please specify your operational land area in acres (e.g. 5, 25.5).');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please choose a password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter identical passwords.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await onRegisterSuccess({
        username: cleanUsername,
        mobileNumber: cleanMobile,
        landAreaAcres: acres,
        password: password.trim()
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Registration could not be completed.');
      }
    } catch (err) {
      setErrorMessage('Registration service encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-container">
        
        {/* Farmer Header */}
        <div className="auth-brand-header">
          <div className="auth-brand-badge farmer-badge">
            <span className="auth-brand-icon">🌾</span>
            <span className="auth-brand-tag">{t('nav.national_platform_badge')}</span>
          </div>
          <h1 className="auth-title">{t('auth.farmer_reg_title')}</h1>
          <p className="auth-subtitle">
            {t('auth.farmer_reg_subtitle')}
          </p>
        </div>

        {/* Benefits strip */}
        <div className="auth-perks-strip farmer-perks">
          <div className="perk-item">
            <span className="perk-icon">⚡</span>
            <span>{t('auth.perk_price_forecast', 'AI Price Forecaster')}</span>
          </div>
          <div className="perk-item">
            <span className="perk-icon">🛡️</span>
            <span>{t('auth.perk_escrow_security', 'Escrow Protected')}</span>
          </div>
          <div className="perk-item">
            <span className="perk-icon">🚚</span>
            <span>{t('auth.perk_logistics', '3PL Logistics')}</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="auth-error-banner" role="alert">
            <span className="error-icon">⚠️</span>
            <div className="error-text">{errorMessage}</div>
          </div>
        )}

        {/* Farmer Registration Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          
          {/* 1. Username */}
          <div className="form-group">
            <label className="form-label" htmlFor="farmer-username">
              {t('auth.full_name', 'Full Name')} / Username <span className="req-star">*</span>
            </label>
            <div className="input-with-icon">
              <span className="input-left-icon">🧑‍🌾</span>
              <input
                id="farmer-username"
                type="text"
                className="form-input custom-auth-input"
                placeholder="e.g. Ramesh Kumar or Kisan_Ramesh"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          </div>

          {/* 2. Mobile number */}
          <div className="form-group">
            <label className="form-label" htmlFor="farmer-mobile">
              {t('auth.mobile_number', 'Mobile Number')} <span className="req-star">*</span>
            </label>
            <div className="input-with-icon phone-input-box">
              <span className="phone-country-code">
                <span className="flag-icon">🇮🇳</span> +91
              </span>
              <input
                id="farmer-mobile"
                type="tel"
                maxLength={10}
                className="form-input custom-auth-input phone-field"
                placeholder="9814123456"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                autoComplete="tel"
                required
              />
              <span className="phone-digits-badge">{mobileNumber.length}/10</span>
            </div>
          </div>

          {/* 3. Land area in acres */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="farmer-land-area">
                {t('auth.land_area', 'Operational Land Area')} <span className="req-star">*</span>
              </label>
            </div>
            <div className="input-with-icon">
              <span className="input-left-icon">🌱</span>
              <input
                id="farmer-land-area"
                type="number"
                step="0.1"
                min="0.1"
                max="50000"
                className="form-input custom-auth-input"
                placeholder="e.g. 15.5 or 30"
                value={landAreaAcres}
                onChange={(e) => setLandAreaAcres(e.target.value)}
                required
              />
              <span className="input-right-badge">{t('nav.acres', 'Acres')}</span>
            </div>
          </div>

          {/* 4. Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="farmer-password">
              {t('auth.field_password', 'Password')} <span className="req-star">*</span>
            </label>
            <div className="input-with-icon">
              <span className="input-left-icon">🔒</span>
              <input
                id="farmer-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input custom-auth-input"
                placeholder="Create a secure password (min 6 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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

            {/* Password Strength Meter */}
            {password && (
              <div className="password-meter-wrap">
                <div className="password-meter-bar">
                  <div 
                    className="password-meter-fill"
                    style={{ width: `${strength.score}%`, backgroundColor: strength.color }}
                  ></div>
                </div>
                <div className="password-meter-meta">
                  <span className="meter-label">Strength:</span>
                  <span style={{ color: strength.color, fontWeight: 700 }}>{strength.label}</span>
                </div>
              </div>
            )}
          </div>

          {/* 5. Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="farmer-confirm-password">
              {t('auth.field_confirm_password', 'Confirm Password')}
            </label>
            <div className="input-with-icon">
              <span className="input-left-icon">🔒</span>
              <input
                id="farmer-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                className="form-input custom-auth-input"
                placeholder="Re-enter your password to confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="input-eye-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
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

          {/* 6. Register Button */}
          <button
            type="submit"
            className="auth-primary-btn farmer-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="btn-spinner-wrap">
                <span className="spinner-dot"></span> ...
              </span>
            ) : (
              <span>🌾 {t('auth.btn_register_farmer', 'Create Farmer Account')}</span>
            )}
          </button>
        </form>

        {/* Navigation Switchers */}
        <div className="auth-footer-links">
          <div className="auth-alt-row">
            <span>{t('auth.already_registered', 'Already have an account?')}</span>
            <button
              type="button"
              className="auth-text-link"
              onClick={onNavigateToLogin}
            >
              {t('auth.sign_in_link', 'Sign In')} →
            </button>
          </div>

          <div className="auth-alt-row sub-row">
            <span>Looking to buy biomass for a plant?</span>
            <button
              type="button"
              className="auth-text-link amber-link"
              onClick={onNavigateToBuyerRegister}
            >
              {t('auth.register_buyer', 'Register as Buyer')} →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
