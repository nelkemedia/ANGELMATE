import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/TranslationContext';

export default function Report() {
  const { user } = useAuth();
  const { t } = useT();

  const [form, setForm] = useState({
    senderName:  user?.name  ?? '',
    senderEmail: user?.email ?? '',
    against:     '',
    reason:      ''
  });
  const [sending,  setSending]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSending(true);
    setErrorMsg('');
    try {
      await api.reports.submit(form);
      setSuccess(true);
      setForm((f) => ({ ...f, against: '', reason: '' }));
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="page impressum-page">
      <h1 className="impressum-title">🚩 {t('report.title')}</h1>
      <p className="guidelines-intro">
        {t('report.intro_before_link')}{' '}
        <a href="/guidelines">{t('report.intro_link')}</a>
        {t('report.intro_after_link')}
      </p>

      {success ? (
        <div className="report-success">
          <div className="report-success-icon">✅</div>
          <h3>{t('report.success_title')}</h3>
          <p>{t('report.success_body')}</p>
          <button className="btn-primary" onClick={() => setSuccess(false)}>
            {t('report.another')}
          </button>
        </div>
      ) : (
        <form className="report-form" onSubmit={handleSubmit} noValidate>

          <div className="report-form-group">
            <h3 className="report-form-section-title">{t('report.section_sender')}</h3>
            <div className="field">
              <label>{t('report.field_name')} <span className="field-required">*</span></label>
              <input
                value={form.senderName}
                onChange={set('senderName')}
                required
                minLength={2}
                maxLength={120}
                placeholder={t('report.field_name_ph')}
              />
            </div>
            <div className="field">
              <label>{t('report.field_email')} <span className="field-required">*</span></label>
              <input
                type="email"
                value={form.senderEmail}
                onChange={set('senderEmail')}
                required
                maxLength={200}
                placeholder={t('report.field_email_ph')}
              />
            </div>
          </div>

          <div className="report-form-group">
            <h3 className="report-form-section-title">{t('report.section_content')}</h3>
            <div className="field">
              <label>{t('report.field_against')} <span className="field-required">*</span></label>
              <input
                value={form.against}
                onChange={set('against')}
                required
                minLength={2}
                maxLength={200}
                placeholder={t('report.field_against_ph')}
              />
              <span className="field-hint">{t('report.field_against_hint')}</span>
            </div>
          </div>

          <div className="report-form-group">
            <h3 className="report-form-section-title">{t('report.section_reason')}</h3>
            <div className="field">
              <label>{t('report.field_reason')} <span className="field-required">*</span></label>
              <textarea
                value={form.reason}
                onChange={set('reason')}
                required
                minLength={10}
                maxLength={5000}
                rows={8}
                placeholder={t('report.field_reason_ph')}
              />
              <span className="field-hint" style={{ justifyContent: 'space-between' }}>
                <span>{t('report.field_min_chars')}</span>
                <span>{form.reason.length} / 5000</span>
              </span>
            </div>
          </div>

          {errorMsg && <div className="error-msg">⚠️ {errorMsg}</div>}

          <div className="report-form-footer">
            <p className="report-privacy-note">{t('report.privacy_note')}</p>
            <button
              type="submit"
              className="btn-primary report-submit-btn"
              disabled={sending || !form.against.trim() || form.reason.trim().length < 10}
            >
              {sending ? `⏳ ${t('report.submitting')}` : `🚩 ${t('report.submit')}`}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
