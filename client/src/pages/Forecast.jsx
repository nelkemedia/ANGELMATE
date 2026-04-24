import { useState } from 'react';
import { api } from '../api/client';

const LEVEL_CONFIG = {
  excellent: { color: '#16a34a', bg: '#dcfce7', border: '#86efac' },
  good:      { color: '#2563eb', bg: '#dbeafe', border: '#93c5fd' },
  moderate:  { color: '#d97706', bg: '#fef3c7', border: '#fcd34d' },
  poor:      { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
};

// WMO weather code → readable name (for display)
function weatherCodeLabel(code) {
  if (code === 0) return 'Klarer Himmel ☀️';
  if (code <= 3) return 'Teilweise bewölkt ⛅';
  if (code <= 48) return 'Bewölkt / Nebel 🌫️';
  if (code <= 67) return 'Regen 🌧️';
  if (code <= 77) return 'Schnee ❄️';
  if (code <= 82) return 'Schauer 🌦️';
  if (code <= 99) return 'Gewitter ⛈️';
  return 'Unbekannt';
}

export default function Forecast() {
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState('');
  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [coords, setCoords] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  async function handleLocate() {
    setLocating(true);
    setLocError('');
    setResult(null);
    setWeather(null);

    if (!navigator.geolocation) {
      setLocError('Geolocation wird von diesem Browser nicht unterstützt.');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });

        try {
          // Reverse geocode for display name (free nominatim API)
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=de`
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const addr = geoData.address;
            setLocationName(addr.city || addr.town || addr.village || addr.county || '');
          }

          // Open-Meteo: free, no API key
          const meteoRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,surface_pressure,windspeed_10m,cloudcover,uv_index,weathercode` +
            `&windspeed_unit=kmh&timezone=auto`
          );
          if (!meteoRes.ok) throw new Error('Wetterdaten konnten nicht geladen werden.');
          const meteoData = await meteoRes.json();
          const c = meteoData.current;

          setWeather({
            temperature: Math.round(c.temperature_2m * 10) / 10,
            pressure: Math.round(c.surface_pressure * 10) / 10,
            windSpeed: Math.round(c.windspeed_10m * 10) / 10,
            cloudCover: c.cloudcover,
            humidity: c.relative_humidity_2m,
            uvIndex: Math.round(c.uv_index * 10) / 10,
            weatherCode: c.weathercode,
          });
        } catch (e) {
          setLocError(e.message);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        const msgs = {
          1: 'Standortzugriff verweigert. Bitte in den Browser-Einstellungen erlauben.',
          2: 'Standort konnte nicht ermittelt werden.',
          3: 'Zeitüberschreitung bei der Standortermittlung.',
        };
        setLocError(msgs[err.code] ?? err.message);
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }

  async function handleAnalyze() {
    if (!weather) return;
    setAnalyzing(true);
    setResult(null);
    setApiKeyMissing(false);
    try {
      const data = await api.ai.analyzeForecast(weather, locationName);
      setResult(data);
    } catch (e) {
      if (e.message.includes('GEMINI_API_KEY') || e.message.includes('AI_KEY_INVALID')
          || e.message.includes('AI_MODEL_UNAVAILABLE') || e.message.includes('AI_QUOTA_EXCEEDED')) {
        setApiKeyMissing(true);
      } else {
        setLocError(e.message);
      }
    } finally {
      setAnalyzing(false);
    }
  }

  const cfg = result ? (LEVEL_CONFIG[result.level] ?? LEVEL_CONFIG.moderate) : null;

  return (
    <div>
      <div className="forecast-photo-banner">
        <div className="forecast-photo-banner-text">
          <h2>🤖 KI-Bissindex</h2>
          <p>Gemini AI analysiert das Wetter — für dich.</p>
        </div>
      </div>

      <div className="page">
        {/* Step 1: Locate */}
        <div className="forecast-step-card">
          <div className="forecast-step-header">
            <span className="forecast-step-num">1</span>
            <div>
              <h3>📍 Standort & Wetter ermitteln</h3>
              <p>Wir holen automatisch die aktuellen Wetterdaten für deinen Standort.</p>
            </div>
          </div>
          <button
            className="btn-primary"
            onClick={handleLocate}
            disabled={locating}
          >
            {locating ? '⏳ Ermittle Standort…' : '📍 GPS & Wetter laden'}
          </button>

          {locError && <div className="error-msg" style={{ marginTop: '0.75rem' }}>⚠️ {locError}</div>}

          {weather && (
            <div className="weather-grid">
              <div className="weather-tile">
                <span className="weather-tile-icon">🌡️</span>
                <span className="weather-tile-value">{weather.temperature}°C</span>
                <span className="weather-tile-label">Temperatur</span>
              </div>
              <div className="weather-tile">
                <span className="weather-tile-icon">🌬️</span>
                <span className="weather-tile-value">{weather.pressure} hPa</span>
                <span className="weather-tile-label">Luftdruck</span>
              </div>
              <div className="weather-tile">
                <span className="weather-tile-icon">💨</span>
                <span className="weather-tile-value">{weather.windSpeed} km/h</span>
                <span className="weather-tile-label">Wind</span>
              </div>
              <div className="weather-tile">
                <span className="weather-tile-icon">☁️</span>
                <span className="weather-tile-value">{weather.cloudCover}%</span>
                <span className="weather-tile-label">Bewölkung</span>
              </div>
              <div className="weather-tile">
                <span className="weather-tile-icon">💧</span>
                <span className="weather-tile-value">{weather.humidity}%</span>
                <span className="weather-tile-label">Luftfeuchte</span>
              </div>
              <div className="weather-tile">
                <span className="weather-tile-icon">☀️</span>
                <span className="weather-tile-value">{weather.uvIndex}</span>
                <span className="weather-tile-label">UV-Index</span>
              </div>
              {locationName && (
                <div className="weather-location-badge">
                  📍 {locationName}
                  {coords && (
                    <span style={{ opacity: .65, fontSize: '0.78rem' }}>
                      {' '}({coords.latitude.toFixed(3)}, {coords.longitude.toFixed(3)})
                    </span>
                  )}
                </div>
              )}
              <div className="weather-code-label">{weatherCodeLabel(weather.weatherCode)}</div>
            </div>
          )}
        </div>

        {/* Step 2: Analyze */}
        {weather && (
          <div className="forecast-step-card">
            <div className="forecast-step-header">
              <span className="forecast-step-num">2</span>
              <div>
                <h3>🤖 KI-Analyse starten</h3>
                <p>Gemini AI bewertet Wetter, Tageszeit und Jahreszeit für optimale Angelchancen.</p>
              </div>
            </div>

            {apiKeyMissing && (
              <div className="api-key-hint">
                <strong>⚠️ KI-Analyse vorübergehend nicht verfügbar</strong>
                <p>Der Gemini API-Key ist ungültig, abgelaufen oder das Kontingent ist erschöpft. Bitte den Key in <code>.env</code> prüfen und das Backend neu starten.</p>
              </div>
            )}
            <button className="btn-ai" onClick={handleAnalyze} disabled={analyzing}>
              {analyzing
                ? <><span className="ai-spinner">⚙️</span> Gemini analysiert…</>
                : '🤖 Bissindex von Gemini AI berechnen'}
            </button>
          </div>
        )}

        {/* Result */}
        {result && cfg && (
          <div className="forecast-result-full" style={{ '--c': cfg.color, '--bg': cfg.bg, '--border': cfg.border }}>
            <div className="forecast-result-top">
              <div className="bite-circle-large" style={{ borderColor: cfg.color }}>
                <div className="bite-circle-num" style={{ color: cfg.color }}>{result.biteIndex}</div>
                <div className="bite-circle-sub">/ 100</div>
              </div>
              <div className="forecast-result-headline">
                <h2 style={{ color: cfg.color }}>{result.headline}</h2>
                <p>{result.weatherSummary}</p>
              </div>
            </div>

            <div className="forecast-result-body">
              <div className="forecast-result-recommendation">
                💬 {result.recommendation}
              </div>

              <div className="forecast-result-grid">
                <div className="forecast-result-item">
                  <span className="fri-icon">⏰</span>
                  <div>
                    <div className="fri-label">Beste Zeiten</div>
                    <div className="fri-value">{result.bestTimeWindow}</div>
                  </div>
                </div>
                <div className="forecast-result-item">
                  <span className="fri-icon">🪱</span>
                  <div>
                    <div className="fri-label">Empfohlener Köder</div>
                    <div className="fri-value">{result.bestBait}</div>
                  </div>
                </div>
                {result.bestSpecies?.length > 0 && (
                  <div className="forecast-result-item" style={{ gridColumn: '1 / -1' }}>
                    <span className="fri-icon">🐟</span>
                    <div>
                      <div className="fri-label">Beste Chancen bei</div>
                      <div className="fri-species">
                        {result.bestSpecies.map((s) => (
                          <span key={s} className="species-tag">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
