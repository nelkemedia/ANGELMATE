import { useT } from '../context/TranslationContext';

function Paragraphs({ textKey }) {
  const { t } = useT();
  return t(textKey).split('\n').map((line, i) => <p key={i}>{line}</p>);
}

export default function Privacy() {
  const { t } = useT();

  return (
    <div className="page impressum-page">
      <h1 className="impressum-title">🔒 {t('legal.privacy_title')}</h1>
      <p className="guidelines-intro">{t('legal.privacy_intro')}</p>

      <div className="impressum-divider" />

      {/* 1 – Verantwortlicher */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">{t('legal.privacy_s1_title')}</h2>
        <p>
          Timo Hoffmann<br />
          E-Mail: <a href="mailto:angelmate@gmx.de" className="app-footer-link">angelmate@gmx.de</a>
        </p>
        <p>{t('legal.privacy_s1_contact_note')}</p>
      </section>

      <div className="impressum-divider" />

      {/* 2 – Grundsätze */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">{t('legal.privacy_s2_title')}</h2>
        <Paragraphs textKey="legal.privacy_s2_body" />
      </section>

      <div className="impressum-divider" />

      {/* 3 – Verarbeitete Daten */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">{t('legal.privacy_s3_title')}</h2>

        <h3 className="report-form-section-title" style={{ marginTop: '1rem' }}>{t('legal.privacy_s3_1_title')}</h3>
        <Paragraphs textKey="legal.privacy_s3_1_body" />

        <h3 className="report-form-section-title" style={{ marginTop: '1rem' }}>{t('legal.privacy_s3_2_title')}</h3>
        <Paragraphs textKey="legal.privacy_s3_2_body" />

        <h3 className="report-form-section-title" style={{ marginTop: '1rem' }}>{t('legal.privacy_s3_3_title')}</h3>
        <Paragraphs textKey="legal.privacy_s3_3_body" />

        <h3 className="report-form-section-title" style={{ marginTop: '1rem' }}>{t('legal.privacy_s3_4_title')}</h3>
        <Paragraphs textKey="legal.privacy_s3_4_body" />

        <h3 className="report-form-section-title" style={{ marginTop: '1rem' }}>{t('legal.privacy_s3_5_title')}</h3>
        <Paragraphs textKey="legal.privacy_s3_5_body" />

        <h3 className="report-form-section-title" style={{ marginTop: '1rem' }}>{t('legal.privacy_s3_6_title')}</h3>
        <Paragraphs textKey="legal.privacy_s3_6_body" />

        <h3 className="report-form-section-title" style={{ marginTop: '1rem' }}>{t('legal.privacy_s3_7_title')}</h3>
        <Paragraphs textKey="legal.privacy_s3_7_body" />
      </section>

      <div className="impressum-divider" />

      {/* 4 – Speicherung */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">{t('legal.privacy_s4_title')}</h2>
        <Paragraphs textKey="legal.privacy_s4_body" />
      </section>

      <div className="impressum-divider" />

      {/* 5 – Drittanbieter */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">{t('legal.privacy_s5_title')}</h2>
        <p>{t('legal.privacy_s5_intro')}</p>

        <div className="privacy-table-wrapper">
          <table className="privacy-table">
            <thead>
              <tr>
                <th>{t('legal.privacy_s5_th_service')}</th>
                <th>{t('legal.privacy_s5_th_purpose')}</th>
                <th>{t('legal.privacy_s5_th_data')}</th>
                <th>{t('legal.privacy_s5_th_location')}</th>
                <th>{t('legal.privacy_s5_th_privacy')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Google Gemini AI</strong><br /><code>generativelanguage.googleapis.com</code></td>
                <td>{t('legal.privacy_s5_r1_purpose')}</td>
                <td>{t('legal.privacy_s5_r1_data')}</td>
                <td>USA (SCCs)</td>
                <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="app-footer-link">policies.google.com/privacy</a></td>
              </tr>
              <tr>
                <td><strong>Open-Meteo</strong><br /><code>api.open-meteo.com</code></td>
                <td>{t('legal.privacy_s5_r2_purpose')}</td>
                <td>{t('legal.privacy_s5_r2_data')}</td>
                <td>{t('legal.privacy_s5_r2_location')}</td>
                <td><a href="https://open-meteo.com/en/terms" target="_blank" rel="noopener noreferrer" className="app-footer-link">open-meteo.com/en/terms</a></td>
              </tr>
              <tr>
                <td><strong>Nominatim / OpenStreetMap</strong><br /><code>nominatim.openstreetmap.org</code></td>
                <td>{t('legal.privacy_s5_r3_purpose')}</td>
                <td>{t('legal.privacy_s5_r3_data')}</td>
                <td>EU</td>
                <td><a href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer" className="app-footer-link">osmfoundation.org/wiki/Privacy_Policy</a></td>
              </tr>
              <tr>
                <td><strong>Unsplash CDN (Fastly)</strong><br /><code>images.unsplash.com</code></td>
                <td>{t('legal.privacy_s5_r4_purpose')}</td>
                <td>{t('legal.privacy_s5_r4_data')}</td>
                <td>USA (SCCs)</td>
                <td><a href="https://unsplash.com/privacy" target="_blank" rel="noopener noreferrer" className="app-footer-link">unsplash.com/privacy</a></td>
              </tr>
              <tr>
                <td><strong>Google Maps</strong><br /><code>google.com/maps</code></td>
                <td>{t('legal.privacy_s5_r5_purpose')}</td>
                <td>{t('legal.privacy_s5_r5_data')}</td>
                <td>USA (SCCs)</td>
                <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="app-footer-link">policies.google.com/privacy</a></td>
              </tr>
              <tr>
                <td><strong>GMX / 1&amp;1 IONOS</strong><br /><code>mail.gmx.net</code></td>
                <td>{t('legal.privacy_s5_r6_purpose')}</td>
                <td>{t('legal.privacy_s5_r6_data')}</td>
                <td>{t('legal.privacy_s5_r6_location')}</td>
                <td><a href="https://www.gmx.net/unternehmen/datenschutz/" target="_blank" rel="noopener noreferrer" className="app-footer-link">gmx.net/unternehmen/datenschutz</a></td>
              </tr>
            </tbody>
          </table>
        </div>

        <Paragraphs textKey="legal.privacy_s5_footer" />
      </section>

      <div className="impressum-divider" />

      {/* 6 – Cookies */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">{t('legal.privacy_s6_title')}</h2>
        <p>{t('legal.privacy_s6_intro')}</p>

        <div className="privacy-table-wrapper">
          <table className="privacy-table">
            <thead>
              <tr>
                <th>{t('legal.privacy_s6_th_name')}</th>
                <th>{t('legal.privacy_s6_th_type')}</th>
                <th>{t('legal.privacy_s6_th_purpose')}</th>
                <th>{t('legal.privacy_s6_th_duration')}</th>
                <th>{t('legal.privacy_s6_th_category')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>am_token</code></td>
                <td>localStorage</td>
                <td>{t('legal.privacy_s6_token_purpose')}</td>
                <td>{t('legal.privacy_s6_token_duration')}</td>
                <td>{t('legal.privacy_s6_token_category')}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Paragraphs textKey="legal.privacy_s6_footer" />
      </section>

      <div className="impressum-divider" />

      {/* 7 – Standortdaten */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">{t('legal.privacy_s7_title')}</h2>
        <p>{t('legal.privacy_s7_intro')}</p>
        <ul className="guidelines-list" style={{ paddingLeft: '1.2rem' }}>
          {t('legal.privacy_s7_bullets').split('\n').map((b, i) => <li key={i}>{b}</li>)}
        </ul>
        <Paragraphs textKey="legal.privacy_s7_footer" />
      </section>

      <div className="impressum-divider" />

      {/* 8 – Betroffenenrechte */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">{t('legal.privacy_s8_title')}</h2>
        <p>{t('legal.privacy_s8_intro')}</p>

        <div className="privacy-rights-grid">
          {[
            { icon: '📋', titleKey: 'legal.privacy_right1_title', descKey: 'legal.privacy_right1_desc' },
            { icon: '✏️', titleKey: 'legal.privacy_right2_title', descKey: 'legal.privacy_right2_desc' },
            { icon: '🗑️', titleKey: 'legal.privacy_right3_title', descKey: 'legal.privacy_right3_desc' },
            { icon: '⏸️', titleKey: 'legal.privacy_right4_title', descKey: 'legal.privacy_right4_desc' },
            { icon: '📤', titleKey: 'legal.privacy_right5_title', descKey: 'legal.privacy_right5_desc' },
            { icon: '🚫', titleKey: 'legal.privacy_right6_title', descKey: 'legal.privacy_right6_desc' },
            { icon: '↩️', titleKey: 'legal.privacy_right7_title', descKey: 'legal.privacy_right7_desc' },
            { icon: '⚖️', titleKey: 'legal.privacy_right8_title', descKey: 'legal.privacy_right8_desc' },
          ].map((r) => (
            <div key={r.titleKey} className="privacy-right-card">
              <span className="privacy-right-icon">{r.icon}</span>
              <div>
                <strong>{t(r.titleKey)}</strong>
                <p>{t(r.descKey)}</p>
              </div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: '1.5rem' }}>
          {t('legal.privacy_s8_contact')}{' '}
          <a href="mailto:angelmate@gmx.de" className="app-footer-link">angelmate@gmx.de</a>
        </p>
      </section>

      <div className="impressum-divider" />

      {/* 9 – Minderjährige */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">{t('legal.privacy_s9_title')}</h2>
        <Paragraphs textKey="legal.privacy_s9_body" />
      </section>

      <div className="impressum-divider" />

      {/* 10 – Änderungen */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">{t('legal.privacy_s10_title')}</h2>
        <Paragraphs textKey="legal.privacy_s10_body" />
        <p className="impressum-meta">{t('legal.privacy_date')}</p>
      </section>
    </div>
  );
}
