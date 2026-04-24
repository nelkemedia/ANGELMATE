export default function Privacy() {
  return (
    <div className="page impressum-page">
      <h1 className="impressum-title">🔒 Datenschutzerklärung</h1>
      <p className="guidelines-intro">
        Diese Datenschutzerklärung informiert Sie gemäß Art. 13 und 14 der
        Datenschutz-Grundverordnung (EU) 2016/679 (DSGVO) über die Verarbeitung
        personenbezogener Daten bei der Nutzung von <strong>AngelMate</strong>.
      </p>

      <div className="impressum-divider" />

      {/* 1 – Verantwortlicher */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">1. Verantwortlicher</h2>
        <p>
          Timo Hoffmann<br />
          E-Mail: <a href="mailto:angelmate@gmx.de" className="app-footer-link">angelmate@gmx.de</a>
        </p>
        <p>
          Bei Fragen zum Datenschutz wenden Sie sich bitte direkt an die oben
          genannte Kontaktadresse.
        </p>
      </section>

      <div className="impressum-divider" />

      {/* 2 – Grundsätze */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">2. Grundsätze der Datenverarbeitung</h2>
        <p>
          Wir verarbeiten personenbezogene Daten nur, soweit dies gesetzlich erlaubt ist
          oder Sie eingewilligt haben. Wir erheben nur die Daten, die für den jeweiligen
          Zweck tatsächlich erforderlich sind (Datensparsamkeit, Art. 5 Abs. 1 lit. c DSGVO).
        </p>
      </section>

      <div className="impressum-divider" />

      {/* 3 – Arten der verarbeiteten Daten */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">3. Verarbeitete Datenkategorien und Zwecke</h2>

        <h3 className="report-form-section-title" style={{ marginTop: '1rem' }}>3.1 Registrierung &amp; Konto</h3>
        <p>
          Bei der Registrierung erheben wir: <strong>Name, E-Mail-Adresse, Passwort (verschlüsselt),
          Heimatregion (optional), Erfahrungslevel (optional)</strong>.
        </p>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung). Speicherdauer:
          Bis zur Löschung des Kontos.
        </p>

        <h3 className="report-form-section-title" style={{ marginTop: '1rem' }}>3.2 Profilbild (Avatar)</h3>
        <p>
          Optional können Sie ein Profilbild hochladen. Das Bild wird clientseitig auf
          128 × 128 Pixel verkleinert und als JPEG-Base64-String in unserer Datenbank
          gespeichert. Es wird im Community-Feed und in Ihrem Profil sichtbar angezeigt.
        </p>
        <p>
          Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung durch freiwilliges
          Hochladen). Sie können das Bild jederzeit in den Profileinstellungen entfernen.
        </p>

        <h3 className="report-form-section-title" style={{ marginTop: '1rem' }}>3.3 Fangbuch</h3>
        <p>
          Einträge im Fangbuch enthalten: <strong>Fischart, Gewicht, Länge, Datum,
          Notizen, ggf. Foto</strong>. Hochgeladene Fotos werden clientseitig auf
          max. 1024 Pixel verkleinert und als JPEG-Base64-String ausschließlich in
          unserer Datenbank gespeichert — sie werden nicht an Dritte übertragen.
          Fangdaten sind standardmäßig nur für Sie sichtbar; bei Veröffentlichung im
          Community-Feed werden sie auch anderen Nutzern angezeigt.
        </p>
        <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).</p>

        <h3 className="report-form-section-title" style={{ marginTop: '1rem' }}>3.4 Angelspots</h3>
        <p>
          Beim Speichern eines Angelspots werden <strong>Name, Beschreibung, GPS-Koordinaten
          (Breitengrad, Längengrad), Sichtbarkeit und Zielarten</strong> gespeichert. Die
          Koordinaten werden für die Anzeige auf Google Maps (externer Link) verwendet.
        </p>
        <p>
          Zur Koordinatenermittlung stehen zwei Wege zur Verfügung: (a) automatische
          GPS-Ortung über den Browser oder (b) Ortsnamensuche über den Dienst
          Nominatim/OpenStreetMap (dabei wird der eingegebene Suchbegriff an
          nominatim.openstreetmap.org übertragen, siehe Abschnitt 5).
        </p>
        <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</p>

        <h3 className="report-form-section-title" style={{ marginTop: '1rem' }}>3.5 Wettervorhersage</h3>
        <p>
          Die Wettervorhersage-Funktion ruft optional Ihren aktuellen Gerätestandort
          (GPS-Koordinaten) ab. Diese Koordinaten werden <strong>ausschließlich für die
          Dauer der jeweiligen Anfrage</strong> an Drittdienste übertragen und von uns
          nicht dauerhaft gespeichert (außer Sie speichern einen Spot).
        </p>
        <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung durch Bestätigung
          des Browser-Standortdialogs).</p>

        <h3 className="report-form-section-title" style={{ marginTop: '1rem' }}>3.6 Community (Kommentare, Likes, Abstimmungen)</h3>
        <p>
          Kommentare, Likes und Votes werden Ihrem Nutzerkonto zugeordnet und in unserer
          Datenbank gespeichert. Kommentare sind für alle eingeloggten Nutzer sichtbar.
        </p>
        <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</p>

        <h3 className="report-form-section-title" style={{ marginTop: '1rem' }}>3.7 Inhaltsmeldungen</h3>
        <p>
          Wenn Sie einen Inhalt melden, speichern wir: <strong>Name des Antragstellers,
          E-Mail-Adresse, gemeldeter Inhalt, Begründung, Zeitstempel</strong>. Diese
          Angaben werden in unserer Datenbank gespeichert und per E-Mail an uns
          weitergeleitet.
        </p>
        <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der
          Plattformsicherheit).</p>

      </section>

      <div className="impressum-divider" />

      {/* 4 – Speicherung */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">4. Speicherort &amp; Sicherheit</h2>
        <p>
          Alle Nutzdaten werden in einer SQLite-Datenbank auf dem Anwendungsserver gespeichert.
          Passwörter werden mit <strong>bcrypt</strong> (Salting + Hashing) gesichert und
          niemals im Klartext gespeichert. Die Kommunikation zwischen Client und Server
          erfolgt verschlüsselt über HTTPS.
        </p>
      </section>

      <div className="impressum-divider" />

      {/* 5 – Drittanbieter */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">5. Eingesetzte Drittdienste</h2>
        <p>
          AngelMate nutzt die folgenden externen Dienste. Bei der Nutzung dieser Dienste
          werden Daten (mindestens Ihre IP-Adresse) an deren Server übertragen.
        </p>

        <div className="privacy-table-wrapper">
          <table className="privacy-table">
            <thead>
              <tr>
                <th>Dienst</th>
                <th>Zweck</th>
                <th>Übertragene Daten</th>
                <th>Serverstandort</th>
                <th>Datenschutz</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Google Gemini AI</strong><br /><code>generativelanguage.googleapis.com</code></td>
                <td>KI-Bissindex-Analyse (Wetterauswertung)</td>
                <td>Wetterdaten, IP-Adresse</td>
                <td>USA (SCCs)</td>
                <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="app-footer-link">policies.google.com/privacy</a></td>
              </tr>
              <tr>
                <td><strong>Open-Meteo</strong><br /><code>api.open-meteo.com</code></td>
                <td>Wettervorhersage</td>
                <td>GPS-Koordinaten (lat/lon), IP-Adresse</td>
                <td>Deutschland / EU</td>
                <td><a href="https://open-meteo.com/en/terms" target="_blank" rel="noopener noreferrer" className="app-footer-link">open-meteo.com/en/terms</a></td>
              </tr>
              <tr>
                <td><strong>Nominatim / OpenStreetMap</strong><br /><code>nominatim.openstreetmap.org</code></td>
                <td>Reverse-Geocoding (Ortsname aus GPS-Koordinaten) und Vorwärts-Geocoding (Koordinaten aus eingegebenem Ortsnamen)</td>
                <td>GPS-Koordinaten oder Sucheingabe (Ortsname), IP-Adresse</td>
                <td>EU</td>
                <td><a href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer" className="app-footer-link">osmfoundation.org/wiki/Privacy_Policy</a></td>
              </tr>
              <tr>
                <td><strong>Unsplash CDN (Fastly)</strong><br /><code>images.unsplash.com</code></td>
                <td>Hintergrundbilder &amp; Stockfotos</td>
                <td>IP-Adresse, HTTP-Referrer</td>
                <td>USA (SCCs)</td>
                <td><a href="https://unsplash.com/privacy" target="_blank" rel="noopener noreferrer" className="app-footer-link">unsplash.com/privacy</a></td>
              </tr>
              <tr>
                <td><strong>Google Maps</strong><br /><code>google.com/maps</code></td>
                <td>Kartendarstellung (externer Link)</td>
                <td>IP-Adresse, GPS-Koordinaten (nur bei Klick)</td>
                <td>USA (SCCs)</td>
                <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="app-footer-link">policies.google.com/privacy</a></td>
              </tr>
              <tr>
                <td><strong>GMX / 1&amp;1 IONOS</strong><br /><code>mail.gmx.net</code></td>
                <td>E-Mail-Versand (Inhaltsmeldungen)</td>
                <td>Name, E-Mail-Adresse, Meldeinhalt</td>
                <td>Deutschland</td>
                <td><a href="https://www.gmx.net/unternehmen/datenschutz/" target="_blank" rel="noopener noreferrer" className="app-footer-link">gmx.net/unternehmen/datenschutz</a></td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: '1rem' }}>
          <strong>Hinweis zu Drittland-Transfers (SCCs):</strong> Für Dienste mit
          Serverstandort in den USA stützen wir den Datentransfer auf die
          Standardvertragsklauseln der EU-Kommission (Art. 46 Abs. 2 lit. c DSGVO).
        </p>
        <p>
          <strong>hejfish.com</strong> ist ein reiner externer Link im Navigationsreiter
          „Angelscheine online". AngelMate überträgt keine Daten an hejfish.com.
          Beim Klick auf den Link verlassen Sie AngelMate; es gelten die
          Datenschutzbestimmungen von hejfish.com.
        </p>
      </section>

      <div className="impressum-divider" />

      {/* 6 – Cookies / localStorage */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">6. Cookies und lokale Speicherung</h2>
        <p>
          AngelMate setzt <strong>keine Tracking-Cookies</strong> und verwendet keinen
          Cookie-Banner, da lediglich technisch notwendige Speicherung erfolgt.
        </p>

        <div className="privacy-table-wrapper">
          <table className="privacy-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Typ</th>
                <th>Zweck</th>
                <th>Speicherdauer</th>
                <th>Kategorie</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>am_token</code></td>
                <td>localStorage</td>
                <td>JWT-Authentifizierungstoken – hält Sie nach dem Login angemeldet</td>
                <td>7 Tage (oder bis zum Logout)</td>
                <td>Technisch notwendig</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style={{ marginTop: '1rem' }}>
          Da es sich um rein technisch notwendige Speicherung handelt, ist gemäß § 25
          Abs. 2 Nr. 2 TTDSG keine Einwilligung erforderlich. Das Token wird beim
          Abmelden aus dem lokalen Speicher gelöscht.
        </p>
        <p>
          Drittanbieter (Google, Unsplash, Open-Meteo) können in ihren eigenen Diensten
          Cookies setzen; dies unterliegt deren Datenschutzrichtlinien (siehe Abschnitt 5).
        </p>
      </section>

      <div className="impressum-divider" />

      {/* 7 – Standortdaten */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">7. Standortdaten (GPS)</h2>
        <p>
          Die Nutzung der Geolocation-API des Browsers ist freiwillig. Eine Abfrage
          erfolgt nur, wenn Sie:
        </p>
        <ul className="guidelines-list" style={{ paddingLeft: '1.2rem' }}>
          <li>die Wettervorhersage mit aktuellem Standort aufrufen, oder</li>
          <li>beim Anlegen eines Angelspots auf „GPS" klicken.</li>
        </ul>
        <p>
          Der Browser fragt Sie in beiden Fällen vorab um Erlaubnis. GPS-Koordinaten
          werden nicht dauerhaft gespeichert, es sei denn, Sie speichern aktiv einen Spot.
        </p>
        <p>
          Als Alternative zur GPS-Ortung können Sie beim Anlegen eines Angelspots einen
          Ortsnamen in das Suchfeld eingeben. Dabei wird der Suchbegriff an
          Nominatim/OpenStreetMap übertragen (siehe Abschnitt 5). Es findet keine
          automatische Standortermittlung statt.
        </p>
      </section>

      <div className="impressum-divider" />

      {/* 8 – Betroffenenrechte */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">8. Ihre Rechte als betroffene Person</h2>
        <p>Sie haben nach der DSGVO folgende Rechte:</p>

        <div className="privacy-rights-grid">
          {[
            { icon: '📋', title: 'Auskunft (Art. 15)', desc: 'Sie können jederzeit eine Kopie Ihrer bei uns gespeicherten Daten anfordern.' },
            { icon: '✏️', title: 'Berichtigung (Art. 16)', desc: 'Unrichtige oder unvollständige Daten können Sie in den Profileinstellungen jederzeit selbst korrigieren oder uns kontaktieren.' },
            { icon: '🗑️', title: 'Löschung (Art. 17)', desc: 'Sie können die Löschung Ihres Kontos und aller zugehörigen Daten verlangen.' },
            { icon: '⏸️', title: 'Einschränkung (Art. 18)', desc: 'Sie können die Einschränkung der Verarbeitung Ihrer Daten verlangen, sofern die gesetzlichen Voraussetzungen vorliegen.' },
            { icon: '📤', title: 'Datenübertragbarkeit (Art. 20)', desc: 'Sie haben das Recht, Ihre Daten in einem maschinenlesbaren Format zu erhalten.' },
            { icon: '🚫', title: 'Widerspruch (Art. 21)', desc: 'Sie können der Verarbeitung Ihrer Daten auf Basis berechtigter Interessen jederzeit widersprechen.' },
            { icon: '↩️', title: 'Widerruf (Art. 7 Abs. 3)', desc: 'Einwilligungen (z. B. Profilbild, Standortzugriff) können Sie jederzeit mit Wirkung für die Zukunft widerrufen.' },
            { icon: '⚖️', title: 'Beschwerde (Art. 77)', desc: 'Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren, z. B. beim Landesbeauftragten für Datenschutz Ihres Bundeslandes.' },
          ].map((r) => (
            <div key={r.title} className="privacy-right-card">
              <span className="privacy-right-icon">{r.icon}</span>
              <div>
                <strong>{r.title}</strong>
                <p>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: '1.5rem' }}>
          Zur Ausübung Ihrer Rechte wenden Sie sich an:{' '}
          <a href="mailto:angelmate@gmx.de" className="app-footer-link">angelmate@gmx.de</a>
        </p>
      </section>

      <div className="impressum-divider" />

      {/* 9 – Minderjährige */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">9. Minderjährige</h2>
        <p>
          AngelMate richtet sich nicht an Kinder unter 16 Jahren. Wir erheben wissentlich
          keine personenbezogenen Daten von Kindern unter 16 Jahren. Sollten uns solche
          Daten bekannt werden, werden sie unverzüglich gelöscht.
        </p>
      </section>

      <div className="impressum-divider" />

      {/* 10 – Änderungen */}
      <section className="impressum-section">
        <h2 className="impressum-section-title">10. Änderungen dieser Datenschutzerklärung</h2>
        <p>
          Wir behalten uns vor, diese Datenschutzerklärung bei Änderungen der App oder
          der Rechtslage anzupassen. Die jeweils aktuelle Version ist stets unter
          <strong> /privacy</strong> abrufbar. Bei wesentlichen Änderungen werden
          angemeldete Nutzer informiert.
        </p>
        <p className="impressum-meta">Stand: April 2026</p>
      </section>
    </div>
  );
}
