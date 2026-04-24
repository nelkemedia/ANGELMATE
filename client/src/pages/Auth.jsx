import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function Auth() {
  const [mode,       setMode]       = useState('login'); // 'login' | 'register' | 'forgot'
  const [error,      setError]      = useState('');
  const [blocked,    setBlocked]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [forgotDone, setForgotDone] = useState(false);
  const [forgotEmail,setForgotEmail]= useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', homeRegion: '', skillLevel: 'beginner'
  });

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBlocked(false);
    setLoading(true);
    try {
      if (mode === 'forgot') {
        await api.auth.forgotPassword(forgotEmail);
        setForgotDone(true);
      } else if (mode === 'login') {
        await login(form.email, form.password);
        navigate('/');
      } else {
        const payload = { name: form.name, email: form.email, password: form.password };
        if (form.homeRegion) payload.homeRegion = form.homeRegion;
        if (form.skillLevel) payload.skillLevel = form.skillLevel;
        await register(payload);
        navigate('/');
      }
    } catch (err) {
      if (err.status === 403) setBlocked(true);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function switchMode(m) { setMode(m); setError(''); setBlocked(false); setForgotDone(false); }

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-hero-text">
          <h1>
            <span>Dein digitales</span>
            <span>Angelbuch. 🎣</span>
          </h1>
          <p>Tracke jeden Fang, entdecke die besten Spots und check den Bissindex — alles in einer App.</p>
          <ul className="auth-features">
            <li>🐟 Fangbuch mit Fotos & Notizen</li>
            <li>📍 Geheime & öffentliche Angelspots</li>
            <li>🌤 Tagesaktueller Bissindex</li>
            <li>📊 Persönliche Statistiken & Rekorde</li>
            <li>🏆 Wer hat den größten Fang?</li>
          </ul>
        </div>

        <div className="auth-card">
          <div className="auth-card-logo">🎣</div>
          <h2>AngelMate</h2>
          <p className="auth-card-sub">
            {mode === 'login' ? 'Schön, dass du wieder da bist! 👋' : 'Werde Teil der Angler-Community!'}
          </p>

          {mode !== 'forgot' && (
            <div className="auth-tabs">
              <button className={mode === 'login'    ? 'active' : ''} onClick={() => switchMode('login')}>Anmelden</button>
              <button className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>Registrieren</button>
            </div>
          )}

          {mode === 'forgot' ? (
            forgotDone ? (
              <div className="forgot-done">
                <p style={{ fontSize: '2rem' }}>📬</p>
                <p><strong>E-Mail unterwegs!</strong></p>
                <p>Falls die Adresse registriert ist, erhältst du in Kürze einen Link zum Zurücksetzen deines Passworts.</p>
                <button className="auth-link-btn" onClick={() => switchMode('login')}>← Zurück zur Anmeldung</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="auth-card-sub" style={{ marginBottom: '1rem' }}>
                  Gib deine E-Mail-Adresse ein. Wir senden dir einen Link zum Zurücksetzen deines Passworts.
                </p>
                <div className="field">
                  <label>E-Mail</label>
                  <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required placeholder="name@beispiel.de" />
                </div>
                {error && <div className="error-msg">⚠️ {error}</div>}
                <button type="submit" className="btn-primary btn-full" disabled={loading}>
                  {loading ? '⏳ Bitte warten…' : '📧 Reset-Link senden'}
                </button>
                <button type="button" className="auth-link-btn" onClick={() => switchMode('login')}>← Zurück zur Anmeldung</button>
              </form>
            )
          ) : (
            <form onSubmit={handleSubmit}>
              {mode === 'register' && (
                <>
                  <div className="field">
                    <label>Dein Name</label>
                    <input value={form.name} onChange={set('name')} required minLength={2} placeholder="Max Mustermann" />
                  </div>
                  <div className="field">
                    <label>Heimatregion</label>
                    <input value={form.homeRegion} onChange={set('homeRegion')} placeholder="z.B. Bayern, Nordsee, Bodensee …" />
                  </div>
                  <div className="field">
                    <label>Erfahrungslevel</label>
                    <select value={form.skillLevel} onChange={set('skillLevel')}>
                      <option value="beginner">🐣 Anfänger</option>
                      <option value="intermediate">🎯 Fortgeschritten</option>
                      <option value="advanced">🏆 Profi</option>
                    </select>
                  </div>
                </>
              )}
              <div className="field">
                <label>E-Mail</label>
                <input type="email" value={form.email} onChange={set('email')} required placeholder="name@beispiel.de" />
              </div>
              <div className="field">
                <label>Passwort</label>
                <input type="password" value={form.password} onChange={set('password')} required minLength={8} placeholder="Mindestens 8 Zeichen" />
              </div>

              {mode === 'login' && (
                <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
                  <button type="button" className="auth-link-btn" onClick={() => switchMode('forgot')}>
                    Passwort vergessen?
                  </button>
                </div>
              )}

              {blocked && (
                <div className="error-msg error-msg-blocked">
                  <div className="error-msg-blocked-icon">🚫</div>
                  <div><strong>Konto gesperrt</strong><p>{error}</p></div>
                </div>
              )}
              {!blocked && error && <div className="error-msg">⚠️ {error}</div>}

              <button type="submit" className="btn-primary btn-full" disabled={loading}>
                {loading ? '⏳ Bitte warten…' : mode === 'login' ? '🎣 Anmelden & Angeln!' : '🚀 Konto erstellen'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
