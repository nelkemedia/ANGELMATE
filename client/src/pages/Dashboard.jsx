import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/TranslationContext';
import { toLocaleTag } from '../utils/locale';
import PhotoLightbox from '../components/PhotoLightbox';

export default function Dashboard() {
  const { user } = useAuth();
  const { t, locale } = useT();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [factIdx] = useState(() => Math.floor(Math.random() * 5));
  const [lightboxSrc, setLightboxSrc] = useState(null);

  useEffect(() => {
    api.stats.overview().then(setStats).catch((e) => setError(e.message));
  }, []);

  const skillLabel = t(`skill.${user?.skillLevel ?? 'beginner'}`);

  return (
    <div>
      <div className="dashboard-hero">
        <div className="dashboard-hero-content">
          <h2>{t('dashboard.greeting', { name: user?.name })}</h2>
          <div className="dashboard-hero-badges">
            <span className="hero-badge">{skillLabel}</span>
            {user?.homeRegion && <span className="hero-badge">📍 {user.homeRegion}</span>}
            {stats && <span className="hero-badge green">🐟 {stats.totalCatches} {t('dashboard.catches_badge')}</span>}
          </div>
        </div>
      </div>

      <div className="app-main" style={{ paddingTop: 0 }}>
        <div className="fun-fact"><strong>{t('dashboard.fun_fact_label')} </strong>{t(`dashboard.fun_fact_${factIdx}`)}</div>

        {error && <div className="error-msg">{error}</div>}

        {stats && (
          <>
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">🎣</div>
                <div className="stat-number">{stats.totalCatches}</div>
                <div className="stat-label">{t('dashboard.stat_total')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🐟</div>
                <div className="stat-number" style={{ fontSize: stats.favoriteSpecies && stats.favoriteSpecies.length > 8 ? '1.2rem' : undefined }}>
                  {stats.favoriteSpecies ?? '–'}
                </div>
                <div className="stat-label">{t('dashboard.stat_favorite')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚖️</div>
                <div className="stat-number">{stats.biggestByWeight ? `${stats.biggestByWeight.weight} kg` : '–'}</div>
                <div className="stat-label">{t('dashboard.stat_heaviest')}</div>
                {stats.biggestByWeight && <div className="stat-sub">{stats.biggestByWeight.fishSpecies}</div>}
              </div>
              <div className="stat-card">
                <div className="stat-icon">📏</div>
                <div className="stat-number">{stats.biggestByLength ? `${stats.biggestByLength.length} cm` : '–'}</div>
                <div className="stat-label">{t('dashboard.stat_longest')}</div>
                {stats.biggestByLength && <div className="stat-sub">{stats.biggestByLength.fishSpecies}</div>}
              </div>
            </div>

            <div className="section">
              <div className="section-header">
                <h3>🕐 {t('dashboard.recent_catches')}</h3>
                <Link to="/catches" className="btn-link">{t('dashboard.show_all')} →</Link>
              </div>
              {stats.recentCatches.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎣</div>
                  <p>{t('dashboard.empty_catches')}</p>
                  <Link to="/catches" className="btn-primary">{t('dashboard.add_first_catch')}</Link>
                </div>
              ) : (
                <div className="catch-list">
                  {stats.recentCatches.map((c) => (
                    <div key={c.id} className="catch-item">
                      {c.imageUrl ? (
                        <div className="catch-item-thumb" onClick={() => setLightboxSrc(c.imageUrl)} title={t('common.zoom')}>
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
                        <span className="catch-date">📅 {new Date(c.caughtAt).toLocaleDateString(toLocaleTag(locale))}</span>
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
              <strong>{t('nav.catches')}</strong>
            </div>
          </Link>
          <Link to="/spots" className="quick-link ql-spots">
            <div className="quick-link-content">
              <span>📍</span>
              <strong>{t('nav.spots_full')}</strong>
            </div>
          </Link>
          <Link to="/forecast" className="quick-link ql-forecast">
            <div className="quick-link-content">
              <span>🌤</span>
              <strong>{t('nav.forecast')}</strong>
            </div>
          </Link>
        </div>
      </div>

      {lightboxSrc && (
        <PhotoLightbox src={lightboxSrc} alt={t('catches.photo_alt')} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  );
}
