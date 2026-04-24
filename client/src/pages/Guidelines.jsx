import { useT } from '../context/TranslationContext';

const RULE_KEYS = [
  { titleKey: 'legal.guide_r1_title', introKey: null,              bulletsKey: null,               itemsKey: 'legal.guide_r1_items' },
  { titleKey: 'legal.guide_r2_title', introKey: 'legal.guide_r2_intro', bulletsKey: 'legal.guide_r2_bullets', itemsKey: null },
  { titleKey: 'legal.guide_r3_title', introKey: null,              bulletsKey: null,               itemsKey: 'legal.guide_r3_items' },
  { titleKey: 'legal.guide_r4_title', introKey: null,              bulletsKey: null,               itemsKey: 'legal.guide_r4_items' },
  { titleKey: 'legal.guide_r5_title', introKey: null,              bulletsKey: null,               itemsKey: 'legal.guide_r5_items' },
  { titleKey: 'legal.guide_r6_title', introKey: null,              bulletsKey: null,               itemsKey: 'legal.guide_r6_items' },
  { titleKey: 'legal.guide_r7_title', introKey: null,              bulletsKey: null,               itemsKey: 'legal.guide_r7_items' },
  { titleKey: 'legal.guide_r8_title', introKey: null,              bulletsKey: null,               itemsKey: 'legal.guide_r8_items' },
  { titleKey: 'legal.guide_r9_title', introKey: null,              bulletsKey: null,               itemsKey: 'legal.guide_r9_items' },
];

export default function Guidelines() {
  const { t } = useT();

  return (
    <div className="page impressum-page">
      <h1 className="impressum-title">{t('legal.guidelines_title')}</h1>
      <p className="guidelines-intro">{t('legal.guidelines_intro')}</p>

      {RULE_KEYS.map((rule, i) => (
        <div key={i}>
          <section className="impressum-section guidelines-rule">
            <h2><span className="guidelines-num">{i + 1}.</span> {t(rule.titleKey)}</h2>
            {rule.introKey && <p>{t(rule.introKey)}</p>}
            {rule.bulletsKey && (
              <ul className="guidelines-list">
                {t(rule.bulletsKey).split('\n').map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            )}
            {rule.itemsKey && t(rule.itemsKey).split('\n').map((item, j) => <p key={j}>{item}</p>)}
          </section>
          {i < RULE_KEYS.length - 1 && <hr className="impressum-divider" />}
        </div>
      ))}
    </div>
  );
}
