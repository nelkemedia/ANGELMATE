import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
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
        <div className="navbar-brand"><span>🎣</span> AngelMate</div>

        {/* Desktop links */}
        <div className="navbar-links">
          <NavLink to="/" end><span className="nav-icon">🏠</span><span className="nav-label">Dashboard</span></NavLink>
          <NavLink to="/catches"><span className="nav-icon">📖</span><span className="nav-label">Fangbuch</span></NavLink>
          <NavLink to="/spots"><span className="nav-icon">📍</span><span className="nav-label">Spots</span></NavLink>
          <NavLink to="/forecast"><span className="nav-icon">🌤</span><span className="nav-label">Bissindex</span></NavLink>
          <NavLink to="/community"><span className="nav-icon">🌍</span><span className="nav-label">Community</span></NavLink>
          {/* <NavLink to="/license"><span className="nav-icon">📋</span><span className="nav-label">Onlinekurs FK</span></NavLink>
          <a href="https://www.hejfish.com/?gad_source=1&gad_campaignid=9541949489&gbraid=0AAAAAC0qlLk0B7q8mvReA6GRQGFnH4kPg&gclid=CjwKCAjwqazPBhALEiwAOuXqdNI9VcDRImuN9Rc8jecZpTiKPpzjPcJwZ_skxVLiPIeUx5O9SE4twxoCeYAQAvD_BwE" target="_blank" rel="noreferrer"><span className="nav-icon">🌐</span><span className="nav-label">Angelscheine kaufen</span></a> */}
          {user?.role === 'ADMIN' && <NavLink to="/admin"><span className="nav-icon">🛡</span><span className="nav-label">Admin</span></NavLink>}
        </div>

        <div className="navbar-user navbar-user-desktop">
          <NavLink to="/profile" className="user-name" style={({ isActive }) => isActive ? { background: 'rgba(255,255,255,.28)' } : {}}>
            <Avatar src={user?.avatarBase64} name={user?.name} size={28} className="navbar-avatar" />
            {user?.name}
          </NavLink>
          <button onClick={handleLogout} className="btn-logout">Abmelden</button>
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger ${open ? 'hamburger-open' : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-label="Menü"
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
              <NavLink to="/" end onClick={close}>🏠 Dashboard</NavLink>
              <NavLink to="/catches" onClick={close}>📖 Fangbuch</NavLink>
              <NavLink to="/spots" onClick={close}>📍 Angelspots</NavLink>
              <NavLink to="/forecast" onClick={close}>🌤 Bissindex</NavLink>
              <NavLink to="/community" onClick={close}>🌍 Community</NavLink>
              {/* <NavLink to="/license" onClick={close}>📋 Onlinekurs FK</NavLink>
              <a href="https://www.hejfish.com/?gad_source=1&gad_campaignid=9541949489&gbraid=0AAAAAC0qlLk0B7q8mvReA6GRQGFnH4kPg&gclid=CjwKCAjwqazPBhALEiwAOuXqdNI9VcDRImuN9Rc8jecZpTiKPpzjPcJwZ_skxVLiPIeUx5O9SE4twxoCeYAQAvD_BwE" target="_blank" rel="noreferrer" onClick={close}>🌐 Angelschein kaufen</a>
              {user?.role === 'ADMIN' && <NavLink to="/admin" onClick={close}>🛡 Admin-Bereich</NavLink>}
               */}<NavLink to="/profile" onClick={close}>👤 Mein Profil</NavLink>
            </nav>
            <button onClick={handleLogout} className="mobile-logout">
              🚪 Abmelden
            </button>
          </div>
        </div>
      )}
    </>
  );
}
