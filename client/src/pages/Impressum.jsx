import { useT } from '../context/TranslationContext';

function Paragraphs({ textKey }) {
  const { t } = useT();
  return t(textKey).split('\n').map((line, i) => <p key={i}>{line}</p>);
}

export default function Impressum() {
  const { t } = useT();

  const SECTIONS = [
    { titleKey: 'legal.impressum_s1_title', bodyKey: 'legal.impressum_s1_body' },
    { titleKey: 'legal.impressum_s2_title', bodyKey: 'legal.impressum_s2_body' },
    { titleKey: 'legal.impressum_s3_title', bodyKey: 'legal.impressum_s3_body' },
    { titleKey: 'legal.impressum_s4_title', bodyKey: 'legal.impressum_s4_body' },
    { titleKey: 'legal.impressum_s5_title', bodyKey: 'legal.impressum_s5_body' },
    { titleKey: 'legal.impressum_s6_title', bodyKey: 'legal.impressum_s6_body' },
    { titleKey: 'legal.impressum_s7_title', bodyKey: 'legal.impressum_s7_body' },
    { titleKey: 'legal.impressum_s8_title', bodyKey: 'legal.impressum_s8_body' },
  ];

  return (
    <div className="page impressum-page">
      <h1 className="impressum-title">{t('legal.impressum_title')}</h1>

      {SECTIONS.map((s, i) => (
        <div key={i}>
          <section className="impressum-section">
            <h2>{t(s.titleKey)}</h2>
            <Paragraphs textKey={s.bodyKey} />
            {s.titleKey === 'legal.impressum_s8_title' && (
              <p>
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
            )}
          </section>
          {i < SECTIONS.length - 1 && <hr className="impressum-divider" />}
        </div>
      ))}
    </div>
  );
}
