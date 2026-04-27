import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/TranslationContext';
import Avatar from './Avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/auth');
    setOpen(false);
  }

  function close() { setOpen(false); }

  return (
    <>
      <nav className="navbar">
        
        <div className="navbar-brand">
          <span>🎣</span> AngelMate
        </div>

        {/* Desktop links */}
        <div className="navbar-links">
          <NavLink to="/" end><span className="nav-icon">🏠</span><span className="nav-label">{t('nav.dashboard')}</span></NavLink>
          <NavLink to="/catches"><span className="nav-icon">📖</span><span className="nav-label">{t('nav.catches')}</span></NavLink>
          <NavLink to="/spots"><span className="nav-icon">📍</span><span className="nav-label">{t('nav.spots')}</span></NavLink>
          <NavLink to="/forecast"><span className="nav-icon">🌤</span><span className="nav-label">{t('nav.forecast')}</span></NavLink>
          <NavLink to="/community"><span className="nav-icon">🌍</span><span className="nav-label">{t('nav.community')}</span></NavLink>
          {user?.role === 'ADMIN' && <NavLink to="/admin"><span className="nav-icon">🛡</span><span className="nav-label">{t('nav.admin')}</span></NavLink>}
        </div>

        <div className="navbar-user navbar-user-desktop">
          <NavLink to="/profile" className="user-name" style={({ isActive }) => isActive ? { background: 'rgba(255,255,255,.28)' } : {}}>
            <Avatar src={user?.avatarBase64} name={user?.name} size={28} className="navbar-avatar" />
            {user?.name}
          </NavLink>
          <button onClick={handleLogout} className="btn-logout">{t('nav.logout')}</button>
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger ${open ? 'hamburger-open' : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-label={t('nav.menu')}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="mobile-overlay" onClick={close}>
          <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-user">
              <Avatar src={user?.avatarBase64} name={user?.name} size={44} className="mobile-user-avatar" />
              <div>
                <div className="mobile-user-name">{user?.name}</div>
                <div className="mobile-user-email">{user?.email}</div>
              </div>
            </div>
            <nav className="mobile-nav">
              <NavLink to="/" end onClick={close}>🏠 {t('nav.dashboard')}</NavLink>
              <NavLink to="/catches" onClick={close}>📖 {t('nav.catches')}</NavLink>
              <NavLink to="/spots" onClick={close}>📍 {t('nav.spots_full')}</NavLink>
              <NavLink to="/forecast" onClick={close}>🌤 {t('nav.forecast')}</NavLink>
              <NavLink to="/community" onClick={close}>🌍 {t('nav.community')}</NavLink>
              {user?.role === 'ADMIN' && <NavLink to="/admin" onClick={close}>🛡 {t('nav.admin')}</NavLink>}
              <NavLink to="/profile" onClick={close}>👤 {t('nav.profile')}</NavLink>
            </nav>
            <button onClick={handleLogout} className="mobile-logout">
              🚪 {t('nav.logout')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
