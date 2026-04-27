import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useT } from '../context/TranslationContext';

export default function VerifyEmail() {
  const [params]  = useSearchParams();
  const [status,  setStatus]  = useState('loading');
  const [message, setMessage] = useState('');
  const { t } = useT();
  const token = params.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t('auth.verify_no_token'));
      return;
    }
    api.auth.verifyEmail(token)
      .then((d) => { setStatus('success'); setMessage(d.message); })
      .catch((e) => { setStatus('error');   setMessage(e.message);  });
  }, []);

  return (
    <div className="auth-page">
      <div className="verify-card">
        {status === 'loading' && (
          <p className="verify-icon">⏳</p>
        )}
        {status === 'success' && (
          <>
            <p className="verify-icon">✅</p>
            <h2>{t('auth.verify_success_title')}</h2>
            <p className="verify-body">{message}</p>
            <Link to="/auth" className="btn-primary verify-btn">{t('auth.back_to_login')}</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="verify-icon">❌</p>
            <h2>{t('auth.verify_error_title')}</h2>
            <p className="verify-body">{message}</p>
            <Link to="/auth" className="btn-primary verify-btn">{t('auth.back_to_login')}</Link>
          </>
        )}
      </div>
    </div>
  );
}
