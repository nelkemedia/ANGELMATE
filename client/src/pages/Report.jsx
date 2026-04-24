import { useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Report() {
  const { user } = useAuth();

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
      <h1 className="impressum-title">🚩 Inhalt melden</h1>
      <p className="guidelines-intro">
        Hast du einen Inhalt entdeckt, der gegen unsere{' '}
        <a href="/guidelines">Community-Richtlinien</a> oder geltendes Recht verstößt?
        Fülle das Formular aus — wir prüfen deine Meldung schnellstmöglich.
      </p>

      {success ? (
        <div className="report-success">
          <div className="report-success-icon">✅</div>
          <h3>Meldung eingegangen</h3>
          <p>
            Vielen Dank für deine Meldung. Wir werden den gemeldeten Inhalt prüfen
            und uns bei Bedarf bei dir melden.
          </p>
          <button className="btn-primary" onClick={() => setSuccess(false)}>
            Weitere Meldung einreichen
          </button>
        </div>
      ) : (
        <form className="report-form" onSubmit={handleSubmit} noValidate>

          <div className="report-form-group">
            <h3 className="report-form-section-title">Deine Angaben</h3>
            <div className="field">
              <label>Name des Antragstellers <span className="field-required">*</span></label>
              <input
                value={form.senderName}
                onChange={set('senderName')}
                required
                minLength={2}
                maxLength={120}
                placeholder="Dein vollständiger Name"
              />
            </div>
            <div className="field">
              <label>Deine E-Mail-Adresse <span className="field-required">*</span></label>
              <input
                type="email"
                value={form.senderEmail}
                onChange={set('senderEmail')}
                required
                maxLength={200}
                placeholder="deine@email.de"
              />
            </div>
          </div>

          <div className="report-form-group">
            <h3 className="report-form-section-title">Gemeldeter Inhalt</h3>
            <div className="field">
              <label>
                Beschwerde richtet sich gegen <span className="field-required">*</span>
              </label>
              <input
                value={form.against}
                onChange={set('against')}
                required
                minLength={2}
                maxLength={200}
                placeholder="z. B. Nutzername, Fangbucheintrag, Kommentar …"
              />
              <span className="field-hint">
                Bitte so genau wie möglich beschreiben (Nutzername, Inhaltsart, Datum).
              </span>
            </div>
          </div>

          <div className="report-form-group">
            <h3 className="report-form-section-title">Begründung</h3>
            <div className="field">
              <label>
                Beschreibe den Verstoß <span className="field-required">*</span>
              </label>
              <textarea
                value={form.reason}
                onChange={set('reason')}
                required
                minLength={10}
                maxLength={5000}
                rows={8}
                placeholder="Beschreibe bitte so detailliert wie möglich, warum dieser Inhalt gemeldet wird. Was genau wurde veröffentlicht? Warum verstößt es gegen die Richtlinien oder das Gesetz?"
              />
              <span className="field-hint" style={{ justifyContent: 'space-between' }}>
                <span>Mindestens 10 Zeichen</span>
                <span>{form.reason.length} / 5000</span>
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="error-msg">⚠️ {errorMsg}</div>
          )}

          <div className="report-form-footer">
            <p className="report-privacy-note">
              🔒 Deine Angaben werden vertraulich behandelt und ausschließlich zur
              Bearbeitung dieser Meldung verwendet.
            </p>
            <button
              type="submit"
              className="btn-primary report-submit-btn"
              disabled={sending || !form.against.trim() || form.reason.trim().length < 10}
            >
              {sending ? '⏳ Wird gesendet…' : '🚩 Meldung abschicken'}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
