const RULES = [
  {
    title: 'Respektvoller Umgang',
    items: [
      'Behandle andere Nutzer respektvoll.',
      'Beleidigungen, Diskriminierung, Hassrede oder Mobbing sind nicht erlaubt.',
    ],
  },
  {
    title: 'Rechtmäßige Inhalte',
    intro: 'Es dürfen nur Inhalte veröffentlicht werden, die geltendem Recht entsprechen. Insbesondere untersagt sind:',
    bullets: [
      'Urheberrechtsverletzungen (z. B. fremde Bilder ohne Erlaubnis)',
      'Inhalte mit Gewaltverherrlichung oder illegalen Aktivitäten',
      'Verstöße gegen Fischerei- oder Tierschutzgesetze',
    ],
  },
  {
    title: 'Eigene Inhalte',
    items: [
      'Du darfst nur Inhalte hochladen, an denen du die erforderlichen Rechte besitzt.',
      'Mit dem Hochladen bestätigst du, dass du zur Veröffentlichung berechtigt bist.',
    ],
  },
  {
    title: 'Schutz sensibler Angelspots',
    items: [
      'Teile keine sensiblen oder geschützten Angelplätze, wenn dies zu Übernutzung oder rechtlichen Problemen führen kann.',
      'Respektiere lokale Regeln und Naturschutzgebiete.',
    ],
  },
  {
    title: 'Wahrheitsgemäße Angaben',
    items: [
      'Fangmeldungen und Angaben sollten nach bestem Wissen korrekt sein.',
      'Täuschung oder Manipulation (z. B. falsche Fanggrößen) sind nicht erwünscht.',
    ],
  },
  {
    title: 'Keine Werbung / Spam',
    items: [
      'Unaufgeforderte Werbung, Spam oder irreführende Inhalte sind nicht erlaubt.',
    ],
  },
  {
    title: 'Moderation',
    items: [
      'Wir behalten uns vor, Inhalte zu entfernen, Nutzer zu verwarnen oder Accounts zu sperren, wenn gegen diese Richtlinien verstoßen wird.',
    ],
  },
  {
    title: 'Meldesystem',
    items: [
      'Nutzer können Inhalte melden, die gegen diese Richtlinien oder geltendes Recht verstoßen.',
      'Wir prüfen gemeldete Inhalte schnellstmöglich.',
    ],
  },
  {
    title: 'Haftung für Inhalte',
    items: [
      'Für Inhalte sind die jeweiligen Nutzer verantwortlich.',
    ],
  },
];

export default function Guidelines() {
  return (
    <div className="page impressum-page">
      <h1 className="impressum-title">Community-Richtlinien</h1>
      <p className="guidelines-intro">
        Willkommen in unserer Community! Damit sich alle Nutzer wohlfühlen und die Plattform
        fair genutzt wird, gelten folgende Regeln:
      </p>

      {RULES.map((rule, i) => (
        <div key={i}>
          <section className="impressum-section guidelines-rule">
            <h2><span className="guidelines-num">{i + 1}.</span> {rule.title}</h2>
            {rule.intro && <p>{rule.intro}</p>}
            {rule.bullets && (
              <ul className="guidelines-list">
                {rule.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            )}
            {rule.items && rule.items.map((item, j) => <p key={j}>{item}</p>)}
          </section>
          {i < RULES.length - 1 && <hr className="impressum-divider" />}
        </div>
      ))}
    </div>
  );
}
