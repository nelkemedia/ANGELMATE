import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/TranslationContext';
import { api } from '../api/client';

export default function Auth() {
  const [mode,       setMode]       = useState('login'); // 'login' | 'register' | 'forgot'
  const [error,      setError]      = useState('');
  const [blocked,    setBlocked]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [forgotDone, setForgotDone] = useState(false);
  const [forgotEmail,setForgotEmail]= useState('');
  const { login, register } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', homeRegion: '', skillLevel: 'beginner', language: 'de'
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
        const payload = { name: form.name, email: form.email, password: form.password, language: form.language };
        if (form.homeRegion) payload.homeRegion = form.homeRegion;
        if (form.skillLevel) payload.skillLevel = form.skillLevel;
        await register(payload);
        navigate('/');
      }
    } catch (err) {
      if (err.status === 403) setBlocked(true);
      const msg = err.code ? t(`error.${err.code.toLowerCase()}`) : err.message;
      setError(msg);
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
            <span>{t('auth.hero_line1')}</span>
            <span>{t('auth.hero_line2')}</span>
          </h1>
          <p>{t('auth.hero_subtitle')}</p>
          <ul className="auth-features">
            <li>{t('auth.feature_1')}</li>
            <li>{t('auth.feature_2')}</li>
            <li>{t('auth.feature_3')}</li>
            <li>{t('auth.feature_4')}</li>
            <li>{t('auth.feature_5')}</li>
          </ul>
        </div>

        <div className="auth-card">
          <div className="auth-card-logo">🎣</div>
          <h2>AngelMate</h2>
          <p className="auth-card-sub">
            {mode === 'login' ? t('auth.login_welcome') : t('auth.register_welcome')}
          </p>

          {mode !== 'forgot' && (
            <div className="auth-tabs">
              <button className={mode === 'login'    ? 'active' : ''} onClick={() => switchMode('login')}>{t('auth.tab_login')}</button>
              <button className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>{t('auth.tab_register')}</button>
            </div>
          )}

          {mode === 'forgot' ? (
            forgotDone ? (
              <div className="forgot-done">
                <p style={{ fontSize: '2rem' }}>📬</p>
                <p><strong>{t('auth.forgot_sent_title')}</strong></p>
                <p>{t('auth.forgot_sent_body')}</p>
                <button className="auth-link-btn" onClick={() => switchMode('login')}>← {t('auth.back_to_login')}</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <p className="auth-card-sub" style={{ marginBottom: '1rem' }}>
                  {t('auth.forgot_intro')}
                </p>
                <div className="field">
                  <label>{t('auth.email')}</label>
                  <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required placeholder="name@beispiel.de" />
                </div>
                {error && <div className="error-msg">⚠️ {error}</div>}
                <button type="submit" className="btn-primary btn-full" disabled={loading}>
                  {loading ? `⏳ ${t('auth.loading')}` : `📧 ${t('auth.forgot_send_btn')}`}
                </button>
                <button type="button" className="auth-link-btn" onClick={() => switchMode('login')}>← {t('auth.back_to_login')}</button>
              </form>
            )
          ) : (
            <form onSubmit={handleSubmit}>
              {mode === 'register' && (
                <>
                  <div className="field">
                    <label>{t('auth.name')}</label>
                    <input value={form.name} onChange={set('name')} required minLength={2} placeholder="Max Mustermann" />
                  </div>
                  <div className="field">
                    <label>{t('auth.home_region')}</label>
                    <input value={form.homeRegion} onChange={set('homeRegion')} placeholder={t('auth.home_region_placeholder')} />
                  </div>
                  <div className="field">
                    <label>{t('auth.skill_level')}</label>
                    <select value={form.skillLevel} onChange={set('skillLevel')}>
                      <option value="beginner">🐣 {t('skill.beginner')}</option>
                      <option value="intermediate">🎯 {t('skill.intermediate')}</option>
                      <option value="advanced">🏆 {t('skill.advanced')}</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>{t('auth.language')}</label>
                    <select value={form.language} onChange={set('language')}>
                      <option value="de">🇩🇪 Deutsch</option>
                      <option value="en">🇬🇧 English</option>
                      <option value="fr">🇫🇷 Français</option>
                    </select>
                  </div>
                </>
              )}
              <div className="field">
                <label>{t('auth.email')}</label>
                <input type="email" value={form.email} onChange={set('email')} required placeholder="name@beispiel.de" />
              </div>
              <div className="field">
                <label>{t('auth.password')}</label>
                <input type="password" value={form.password} onChange={set('password')} required minLength={8} placeholder={t('auth.password_placeholder')} />
              </div>

              {mode === 'login' && (
                <div style={{ textAlign: 'right', marginBottom: '0.5rem' }}>
                  <button type="button" className="auth-link-btn" onClick={() => switchMode('forgot')}>
                    {t('auth.forgot_password')}
                  </button>
                </div>
              )}

              {blocked && (
                <div className="error-msg error-msg-blocked">
                  <div className="error-msg-blocked-icon">🚫</div>
                  <div><strong>{t('auth.account_blocked')}</strong><p>{error}</p></div>
                </div>
              )}
              {!blocked && error && <div className="error-msg">⚠️ {error}</div>}

              <button type="submit" className="btn-primary btn-full" disabled={loading}>
                {loading ? `⏳ ${t('auth.loading')}` : mode === 'login' ? `🎣 ${t('auth.login_btn')}` : `🚀 ${t('auth.register_btn')}`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
