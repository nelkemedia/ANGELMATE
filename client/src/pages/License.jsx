const FISHING_KING_URL = 'https://www.fishing-king.de/';

const STEPS = [
  {
    icon: '📝',
    title: 'Registrieren',
    text: 'Kostenloses Konto bei Fishing-King anlegen — in unter einer Minute.',
  },
  {
    icon: '📚',
    title: 'Online lernen',
    text: 'Lernkarten, Prüfungsfragen und Erklärvideos bequem am PC oder Smartphone.',
  },
  {
    icon: '✅',
    title: 'Prüfung bestehen',
    text: 'Simuliere die offizielle Angelprüfung so oft du willst, bis du fit bist.',
  },
  {
    icon: '🎣',
    title: 'Angelschein erhalten',
    text: 'Nach bestandener Prüfung beim zuständigen Fischereiverein den Schein beantragen.',
  },
];

const INFO_CARDS = [
  {
    icon: '📋',
    title: 'Was ist der Angelschein?',
    text: 'Der Jahresfischereischein (umgangssprachlich „Angelschein") berechtigt dich, in Deutschland legal zu angeln. Er setzt die erfolgreich abgelegte Fischerprüfung voraus.',
  },
  {
    icon: '🌍',
    title: 'Gilt bundesweit?',
    text: 'Der Jugendfischereischein und der Jahresfischereischein gelten bundesweit. Einzelne Bundesländer haben leicht unterschiedliche Prüfungsanforderungen.',
  },
  {
    icon: '⏱',
    title: 'Wie lange dauert es?',
    text: 'Mit konsequentem Selbststudium sind die meisten Kandidaten in 4–8 Wochen prüfungsbereit. Fishing-King zeigt dir täglich deinen Lernfortschritt.',
  },
  {
    icon: '💶',
    title: 'Was kostet es?',
    text: 'Die Prüfungsgebühren variieren je nach Bundesland (ca. 30–80 €). Das Lernportal bei Fishing-King ist kostenlos nutzbar.',
  },
];

export default function License() {
  return (
    <div>
      {/* Banner */}
      <div
        className="section-photo-banner"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1551131618-3f0a5cf594b4?w=1200&q=80&auto=format&fit=crop)' }}
      >
        <div className="section-photo-banner-text">
          <h2>📋 Angelschein online</h2>
          <p>Vorbereitung · Prüfung · Lizenz — alles digital</p>
        </div>
      </div>

      <div className="page">

        {/* Hero CTA */}
        <div className="license-hero-card">
          <div className="license-hero-logo">🎣</div>
          <div className="license-hero-text">
            <h3>Jetzt Angelschein online machen</h3>
            <p>
              Mit <strong>Fishing-King</strong> lernst du alles für die Fischerprüfung bequem von zu Hause —
              kostenlos, interaktiv und im eigenen Tempo.
            </p>
          </div>
          <a
            href={FISHING_KING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="license-cta-btn"
          >
            Zu Fishing&#8209;King&nbsp;→
          </a>
        </div>

        {/* Steps */}
        <h3 className="license-section-title">So funktioniert es</h3>
        <div className="license-steps">
          {STEPS.map((s, i) => (
            <div key={i} className="license-step">
              <div className="license-step-num">{i + 1}</div>
              <div className="license-step-icon">{s.icon}</div>
              <div className="license-step-body">
                <strong>{s.title}</strong>
                <p>{s.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Info cards */}
        <h3 className="license-section-title">Häufige Fragen</h3>
        <div className="license-info-grid">
          {INFO_CARDS.map((c, i) => (
            <div key={i} className="license-info-card">
              <span className="license-info-icon">{c.icon}</span>
              <h4>{c.title}</h4>
              <p>{c.text}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="license-bottom-cta">
          <p>Bereit, deinen Angelschein zu machen?</p>
          <a
            href={FISHING_KING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="license-cta-btn license-cta-btn-lg"
          >
            🎓 Jetzt starten
          </a>
          <span className="license-hint">Öffnet fishing&#8209;king.de in einem neuen Tab</span>
        </div>

      </div>
    </div>
  );
}
