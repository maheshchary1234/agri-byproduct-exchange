import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout
}) {
  const { t } = useTranslation();
  const userRole = (currentUser?.role || '').toUpperCase();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Buyer Purchase Request',
      text: 'Dr. Arvinder Mehta submitted an escrow request for 30 MT of rice straw.',
      time: '10m ago',
      unread: true
    },
    {
      id: 2,
      title: 'XGBoost Price Alert',
      text: 'Post-harvest demand surge in Punjab/Haryana elevated straw benchmarks by +8.4%.',
      time: '2h ago',
      unread: true
    },
    {
      id: 3,
      title: 'Escrow Settlement Verified',
      text: 'Delivery confirmed for Order #ORD-1049. Payout released to bank account.',
      time: '1d ago',
      unread: false
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleBrandClick = () => {
    if (!currentUser) {
      setActiveTab('login');
    } else {
      if (userRole.includes('FARMER')) setActiveTab('farmer');
      else if (userRole.includes('BUYER')) setActiveTab('buyer');
      else if (userRole.includes('ADMIN')) setActiveTab('admin');
      else setActiveTab('login');
    }
  };

  return (
    <header className="top-header">
      {/* Left: AgriConnect AI Logo & Brand Name */}
      <div 
        className="brand-wrapper" 
        onClick={handleBrandClick} 
        style={{ cursor: 'pointer' }}
        title={currentUser ? "Go to Your Dashboard" : "AgriConnect AI Login"}
      >
        <div className="brand-icon-box">🌾</div>
        <div>
          <div className="brand-title">AgriConnect AI</div>
          <div className="brand-subtitle">{t('nav.brand_subtitle')}</div>
        </div>
      </div>

      {/* When logged in: NO public navigation items (Home, About, Features, Marketplace, Contact removed) */}

      {/* Right Header Actions */}
      <div className="header-actions-group">
        
        {/* Language Selector for English, Telugu, and Hindi */}
        <LanguageSwitcher />

        {currentUser ? (
          <>
            {/* Notification Icon with Unread Count */}
            <div style={{ position: 'relative' }}>
              <button 
                type="button" 
                className="notification-bell-btn"
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                title="View Platform Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              {/* Notification Flyout Dropdown */}
              {showNotifications && (
                <div 
                  className="white-card" 
                  style={{
                    position: 'absolute',
                    top: '120%',
                    right: '0',
                    width: '320px',
                    zIndex: 100,
                    padding: '1rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.12)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--green-900)' }}>
                      Notifications ({unreadCount} unread)
                    </strong>
                    {unreadCount > 0 && (
                      <button 
                        type="button" 
                        onClick={markAllRead} 
                        style={{ fontSize: '0.72rem', color: 'var(--green-700)', fontWeight: 600 }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div 
                        key={n.id} 
                        style={{ 
                          padding: '0.6rem', 
                          borderRadius: '6px', 
                          background: n.unread ? 'var(--green-50)' : 'transparent',
                          borderLeft: n.unread ? '3px solid var(--green-600)' : '3px solid transparent'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          <span>{n.title}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.time}</span>
                        </div>
                        <p style={{ fontSize: '0.76rem', color: 'var(--text-body)', marginTop: '2px', lineHeight: '1.4' }}>
                          {n.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown Menu */}
            <div style={{ position: 'relative' }}>
              <button 
                type="button" 
                className="profile-dropdown-btn"
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
              >
                <div className="avatar-circle">
                  {(currentUser.name || 'U').charAt(0)}
                </div>
                <div className="profile-meta-mini">
                  <div className="profile-name-mini">{currentUser.name || 'User'}</div>
                  <div className="profile-role-mini">
                    {userRole.includes('FARMER') ? t('nav.farmer') : userRole.includes('BUYER') ? t('nav.buyer') : t('nav.admin')}
                  </div>
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>▼</span>
              </button>

              {showProfileMenu && (
                <div 
                  className="white-card"
                  style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: '240px',
                    zIndex: 100,
                    padding: '0.85rem',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.12)'
                  }}
                >
                  <div style={{ paddingBottom: '0.65rem', marginBottom: '0.65rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--green-900)' }}>
                      {currentUser.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {currentUser.email || currentUser.phone}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <button
                      type="button"
                      className="farmer-menu-btn"
                      style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem' }}
                      onClick={() => {
                        setShowProfileMenu(false);
                        handleBrandClick();
                      }}
                    >
                      <span>📊 {t('farmer_sidebar.dashboard')}</span>
                    </button>

                    <div className="sidebar-divider" style={{ margin: '0.4rem 0' }}></div>

                    <button
                      type="button"
                      className="farmer-menu-btn"
                      style={{ padding: '0.45rem 0.65rem', fontSize: '0.85rem', color: 'var(--red-600)' }}
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                    >
                      <span>🚪 {t('nav.sign_out')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Prominent Direct Logout Button in Header */}
            <button
              type="button"
              className="btn-secondary"
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderColor: 'var(--red-500)',
                color: 'var(--red-600)',
                borderRadius: 'var(--radius-sm)'
              }}
              onClick={onLogout}
              title={t('nav.sign_out')}
            >
              <span>🚪</span>
              <span>{t('nav.sign_out')}</span>
            </button>
          </>
        ) : (
          /* Unauthenticated Mode: Clear options to switch between Login and Register */
          <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
            <button 
              type="button" 
              className={`btn-secondary ${activeTab === 'login' ? 'active-auth-tab' : ''}`} 
              style={{ 
                padding: '0.45rem 0.95rem', 
                fontSize: '0.84rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: activeTab === 'login' ? 'var(--primary-teal)' : '',
                color: activeTab === 'login' ? '#ffffff' : ''
              }}
              onClick={() => setActiveTab('login')}
            >
              <span>🔑</span>
              <span>{t('nav.sign_in')}</span>
            </button>
            <button 
              type="button" 
              className={`btn-secondary ${activeTab === 'register-farmer' ? 'active-auth-tab' : ''}`} 
              style={{ 
                padding: '0.45rem 0.85rem', 
                fontSize: '0.84rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: activeTab === 'register-farmer' ? 'var(--primary-teal)' : '',
                color: activeTab === 'register-farmer' ? '#ffffff' : ''
              }}
              onClick={() => setActiveTab('register-farmer')}
            >
              <span>🌾</span>
              <span>{t('auth.register_farmer', 'Farmer Register')}</span>
            </button>
            <button 
              type="button" 
              className={`btn-primary ${activeTab === 'register-buyer' ? 'active-auth-tab' : ''}`} 
              style={{ 
                padding: '0.45rem 0.85rem', 
                fontSize: '0.84rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: activeTab === 'register-buyer' ? 'var(--secondary-emerald)' : ''
              }}
              onClick={() => setActiveTab('register-buyer')}
            >
              <span>🏭</span>
              <span>{t('auth.register_buyer', 'Buyer Register')}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
