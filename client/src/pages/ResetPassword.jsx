import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useT } from '../context/TranslationContext';

export default function ResetPassword() {
  const { t } = useT();
  const [params]                  = useSearchParams();
  const token                     = params.get('token') || '';
  const navigate                  = useNavigate();
  const [password,   setPassword] = useState('');
  const [password2,  setPassword2]= useState('');
  const [loading,    setLoading]  = useState(false);
  const [done,       setDone]     = useState(false);
  const [error,      setError]    = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== password2) return setError(t('auth.reset_err_mismatch'));
    if (password.length < 8)   return setError(t('auth.reset_err_short'));
    if (!token)                 return setError(t('auth.reset_err_no_token'));

    setLoading(true);
    try {
      await api.auth.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-split" style={{ justifyContent: 'center' }}>
        <div className="auth-card">
          <div className="auth-card-logo">🎣</div>
          <h2>AngelMate</h2>

          {done ? (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '2.5rem', margin: '0.5rem 0' }}>✅</p>
              <p><strong>{t('auth.reset_done_title')}</strong></p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                {t('auth.reset_done_body')}
              </p>
              <button className="btn-primary btn-full" onClick={() => navigate('/auth')}>
                {t('auth.reset_go_login')}
              </button>
            </div>
          ) : (
            <>
              <p className="auth-card-sub">{t('auth.reset_title')}</p>
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>{t('auth.reset_new_pw')}</label>
                  <input
                    type="password" value={password} required minLength={8}
                    placeholder={t('auth.reset_pw_ph')}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>{t('auth.reset_confirm_pw')}</label>
                  <input
                    type="password" value={password2} required
                    placeholder={t('auth.reset_confirm_ph')}
                    onChange={(e) => setPassword2(e.target.value)}
                  />
                </div>
                {error && <div className="error-msg">⚠️ {error}</div>}
                <button type="submit" className="btn-primary btn-full" disabled={loading}>
                  {loading ? `⏳ ${t('auth.reset_loading')}` : `🔑 ${t('auth.reset_btn')}`}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
