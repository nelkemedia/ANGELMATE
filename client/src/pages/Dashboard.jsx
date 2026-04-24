import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import PhotoLightbox from '../components/PhotoLightbox';

const LEVEL_LABEL = { beginner: '🐣 Anfänger', intermediate: '🎯 Fortgeschritten', advanced: '🏆 Profi' };

const FUN_FACTS = [
  '🐟 Wusstest du? Der größte jemals gefangene Hecht wog 31,5 kg!',
  '🎣 In Deutschland gibt es über 3 Millionen aktive Angler.',
  '🌊 Zander bevorzugen trübes Wasser — schlechte Sicht ist ihr Vorteil.',
  '☀️ Die besten Bisszeiten sind meist kurz nach Sonnenaufgang und vor Sonnenuntergang.',
  '🪱 Regenwürmer sind nach wie vor der universell beliebteste Köder Deutschlands.',
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [fact] = useState(() => FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)]);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  useEffect(() => {
    api.stats.overview().then(setStats).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <div className="dashboard-hero">
        <div className="dashboard-hero-content">
          <h2>Hey {user?.name}, auf zur nächsten Tour! 🎣</h2>
          <div className="dashboard-hero-badges">
            <span className="hero-badge">{LEVEL_LABEL[user?.skillLevel] ?? user?.skillLevel}</span>
            {user?.homeRegion && <span className="hero-badge">📍 {user.homeRegion}</span>}
            {stats && <span className="hero-badge green">🐟 {stats.totalCatches} Fänge</span>}
          </div>
        </div>
      </div>

      <div className="app-main" style={{ paddingTop: 0 }}>
        <div className="fun-fact"><strong>Angelfakt: </strong>{fact}</div>

        {error && <div className="error-msg">{error}</div>}

        {stats && (
          <>
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">🎣</div>
                <div className="stat-number">{stats.totalCatches}</div>
                <div className="stat-label">Fänge gesamt</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🐟</div>
                <div className="stat-number" style={{ fontSize: stats.favoriteSpecies && stats.favoriteSpecies.length > 8 ? '1.2rem' : undefined }}>
                  {stats.favoriteSpecies ?? '–'}
                </div>
                <div className="stat-label">Lieblingsart</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚖️</div>
                <div className="stat-number">{stats.biggestByWeight ? `${stats.biggestByWeight.weight} kg` : '–'}</div>
                <div className="stat-label">Schwerster Fang</div>
                {stats.biggestByWeight && <div className="stat-sub">{stats.biggestByWeight.fishSpecies}</div>}
              </div>
              <div className="stat-card">
                <div className="stat-icon">📏</div>
                <div className="stat-number">{stats.biggestByLength ? `${stats.biggestByLength.length} cm` : '–'}</div>
                <div className="stat-label">Längster Fang</div>
                {stats.biggestByLength && <div className="stat-sub">{stats.biggestByLength.fishSpecies}</div>}
              </div>
            </div>

            <div className="section">
              <div className="section-header">
                <h3>🕐 Letzte Fänge</h3>
                <Link to="/catches" className="btn-link">Alle anzeigen →</Link>
              </div>
              {stats.recentCatches.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎣</div>
                  <p>Noch keine Fänge — Rute raus und los!</p>
                  <Link to="/catches" className="btn-primary">Ersten Fang eintragen</Link>
                </div>
              ) : (
                <div className="catch-list">
                  {stats.recentCatches.map((c) => (
                    <div key={c.id} className="catch-item">
                      {c.imageUrl ? (
                        <div
                          className="catch-item-thumb"
                          onClick={() => setLightboxSrc(c.imageUrl)}
                          title="Foto vergrößern"
                        >
                          <img src={c.imageUrl} alt={c.fishSpecies} />
                        </div>
                      ) : (
                        <div className="catch-icon">🐟</div>
                      )}
                      <div className="catch-info">
                        <strong>{c.fishSpecies}</strong>
                        <span>📍 {c.waterName}</span>
                      </div>
                      <div className="catch-meta">
                        {c.weight && <span>⚖️ {c.weight} kg</span>}
                        {c.length && <span>📏 {c.length} cm</span>}
                        <span className="catch-date">📅 {new Date(c.caughtAt).toLocaleDateString('de-DE')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="quick-links">
          <Link to="/catches" className="quick-link ql-catches">
            <div className="quick-link-content">
              <span>📖</span>
              <strong>Fangbuch</strong>
            </div>
          </Link>
          <Link to="/spots" className="quick-link ql-spots">
            <div className="quick-link-content">
              <span>📍</span>
              <strong>Angelspots</strong>
            </div>
          </Link>
          <Link to="/forecast" className="quick-link ql-forecast">
            <div className="quick-link-content">
              <span>🌤</span>
              <strong>Bissindex</strong>
            </div>
          </Link>
        </div>
      </div>

      {lightboxSrc && (
        <PhotoLightbox src={lightboxSrc} alt="Fangfoto" onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  );
}
