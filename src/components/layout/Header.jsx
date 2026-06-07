import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import NotificationBell from '../shared/NotificationBell';
import Icon from '../shared/Icon';
import './Header.css';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'doctor') return '/doctor/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    return '/patient/dashboard';
  };

  return (
    <header className="header" id="main-header">
      <div className="header__inner container">
        <Link to="/" className="header__logo" id="logo-link">
          <span className="header__logo-icon"><Icon name="brain" size={26} color="#00FFB2" /></span>
          <span className="header__logo-text">BrainScan<span className="header__logo-accent">AI</span></span>
        </Link>

        <button className="header__hamburger" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          <Icon name="menu" size={22} />
        </button>

        <nav className={`header__nav ${mobileOpen ? 'header__nav--open' : ''}`} id="main-nav">
          <Link to="/" className="header__link" onClick={() => setMobileOpen(false)}>{t('home')}</Link>
          <Link to="/info/tumors" className="header__link" onClick={() => setMobileOpen(false)}>{lang === 'ar' ? 'تعلّم' : 'Learn'}</Link>
          <Link to="/info/faq" className="header__link" onClick={() => setMobileOpen(false)}>{lang === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}</Link>
          {isAuthenticated && (
            <Link to={getDashboardPath()} className="header__link" onClick={() => setMobileOpen(false)}>{t('dashboard')}</Link>
          )}
        </nav>

        <div className="header__actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="btn btn--glass" 
            onClick={toggleLanguage} 
            style={{ 
              padding: '6px 12px', 
              fontSize: '0.85rem', 
              minWidth: '80px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {lang === 'en' ? 'العربية' : 'English'}
          </button>

          {isAuthenticated && <NotificationBell />}

          {isAuthenticated ? (
            <div className="header__user" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="header__user-name" style={{ fontSize: '0.9rem' }}>{user.name}</span>
              <button className="header__btn header__btn--outline" onClick={handleLogout} id="logout-btn">
                {t('logout')}
              </button>
            </div>
          ) : (
            <div className="header__auth" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/login" className="header__btn header__btn--outline" id="login-btn">{t('login')}</Link>
              <Link to="/patient/intake" className="header__btn header__btn--primary" id="register-btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>{lang === 'ar' ? 'البدء' : 'Get Started'}</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
