import { useT } from '../context/TranslationContext';

const FISHING_KING_URL = 'https://www.fishing-king.de/';

export default function License() {
  const { t } = useT();

  const STEPS = [
    { icon: '📝', titleKey: 'license.step1_title', textKey: 'license.step1_text' },
    { icon: '📚', titleKey: 'license.step2_title', textKey: 'license.step2_text' },
    { icon: '✅', titleKey: 'license.step3_title', textKey: 'license.step3_text' },
    { icon: '🎣', titleKey: 'license.step4_title', textKey: 'license.step4_text' },
  ];

  const INFO_CARDS = [
    { icon: '📋', titleKey: 'license.faq1_title', textKey: 'license.faq1_text' },
    { icon: '🌍', titleKey: 'license.faq2_title', textKey: 'license.faq2_text' },
    { icon: '⏱',  titleKey: 'license.faq3_title', textKey: 'license.faq3_text' },
    { icon: '💶', titleKey: 'license.faq4_title', textKey: 'license.faq4_text' },
  ];

  return (
    <div>
      <div className="section-photo-banner section-photo-banner--license">
        <div className="section-photo-banner-text">
          <h2>📋 {t('license.title')}</h2>
          <p>{t('license.subtitle')}</p>
        </div>
      </div>

      <div className="page">

        <div className="license-hero-card">
          <div className="license-hero-logo">🎣</div>
          <div className="license-hero-text">
            <h3>{t('license.hero_title')}</h3>
            <p dangerouslySetInnerHTML={{ __html: t('license.hero_body') }} />
          </div>
          <a href={FISHING_KING_URL} target="_blank" rel="noopener noreferrer" className="license-cta-btn">
            {t('license.cta_btn')}
          </a>
        </div>

        <h3 className="license-section-title">{t('license.steps_title')}</h3>
        <div className="license-steps">
          {STEPS.map((s, i) => (
            <div key={i} className="license-step">
              <div className="license-step-num">{i + 1}</div>
              <div className="license-step-icon">{s.icon}</div>
              <div className="license-step-body">
                <strong>{t(s.titleKey)}</strong>
                <p>{t(s.textKey)}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="license-section-title">{t('license.faq_title')}</h3>
        <div className="license-info-grid">
          {INFO_CARDS.map((c, i) => (
            <div key={i} className="license-info-card">
              <span className="license-info-icon">{c.icon}</span>
              <h4>{t(c.titleKey)}</h4>
              <p>{t(c.textKey)}</p>
            </div>
          ))}
        </div>

        <div className="license-bottom-cta">
          <p>{t('license.bottom_cta')}</p>
          <a href={FISHING_KING_URL} target="_blank" rel="noopener noreferrer" className="license-cta-btn license-cta-btn-lg">
            🎓 {t('license.start_btn')}
          </a>
          <span className="license-hint">{t('license.hint')}</span>
        </div>

      </div>
    </div>
  );
}
