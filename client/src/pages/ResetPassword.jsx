import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function ResetPassword() {
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
    if (password !== password2) return setError('Die Passwörter stimmen nicht überein.');
    if (password.length < 8)   return setError('Passwort muss mindestens 8 Zeichen haben.');
    if (!token)                 return setError('Kein gültiger Token – bitte den Link aus der E-Mail verwenden.');

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
              <p><strong>Passwort gesetzt!</strong></p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Du kannst dich jetzt mit deinem neuen Passwort anmelden.
              </p>
              <button className="btn-primary btn-full" onClick={() => navigate('/auth')}>
                Zur Anmeldung
              </button>
            </div>
          ) : (
            <>
              <p className="auth-card-sub">Neues Passwort vergeben</p>
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label>Neues Passwort</label>
                  <input
                    type="password" value={password} required minLength={8}
                    placeholder="Mindestens 8 Zeichen"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Passwort wiederholen</label>
                  <input
                    type="password" value={password2} required
                    placeholder="Passwort bestätigen"
                    onChange={(e) => setPassword2(e.target.value)}
                  />
                </div>
                {error && <div className="error-msg">⚠️ {error}</div>}
                <button type="submit" className="btn-primary btn-full" disabled={loading}>
                  {loading ? '⏳ Bitte warten…' : '🔑 Passwort setzen'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
