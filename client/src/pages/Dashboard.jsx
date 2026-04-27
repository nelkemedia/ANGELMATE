import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/TranslationContext';
import { toLocaleTag } from '../utils/locale';
import PhotoLightbox from '../components/PhotoLightbox';

function HeroWave() {
  return (
    <div className="hero-wave">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 56" preserveAspectRatio="none">
        <path d="M0,28 C360,56 720,0 1080,28 C1260,42 1360,14 1440,28 L1440,56 L0,56 Z" fill="#f8fafb" />
      </svg>
    </div>
  );
}


function IconCalendar() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
      <rect x="1.5" y="2.5" width="13" height="12" rx="2" />
      <path d="M1.5 6.5h13M5 1.5v2M11 1.5v2" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
      <path d="M8 8.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
      <path d="M8 2a5 5 0 0 1 5 5c0 4-5 7.5-5 7.5S3 11 3 7a5 5 0 0 1 5-5z" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" style={{ flexShrink: 0 }}>
      <path d="M6 3l5 5-5 5" />
    </svg>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t, locale } = useT();
  const navigate = useNavigate();
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
          <h2>{t('dashboard.greeting', { name: user?.name })} 👋</h2>
          <p className="dashboard-hero-sub">Bereit für deinen nächsten großen Fang?</p>
          <div className="dashboard-hero-badges">
            <span className="hero-badge">🌿 {skillLabel}</span>
            {user?.homeRegion && <span className="hero-badge">📍 {user.homeRegion}</span>}
            {stats && <span className="hero-badge">🐟 {stats.totalCatches} {t('dashboard.catches_badge')}</span>}
          </div>
        </div>
        <HeroWave />
      </div>

      <div className="app-main" style={{ paddingTop: '1.5rem' }}>

        <div className="fun-fact-card">
          <div className="fun-fact-text">
            <strong>{t('dashboard.fun_fact_label')}</strong>
            <p>{t(`dashboard.fun_fact_${factIdx}`)}</p>
          </div>
          <img src="/img/fact-fish.svg" alt="" className="fun-fact-fish" />
        </div>

        {error && <div className="error-msg">{error}</div>}

        {stats && (
          <>
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-card-body">
                  <div className="stat-number">{stats.totalCatches}</div>
                  <div className="stat-label">GESAMT</div>
                  <div className="stat-sub">{t('dashboard.stat_total')}</div>
                </div>
                <img src="/img/stat-fish-white.svg" alt="" className="stat-illus" />
              </div>

              <div className="stat-card stat-card--species">
                <div className="stat-card-body">
                  <div className="stat-label">LIEBLINGSART</div>
                  <div className="stat-number" style={{ fontSize: stats.favoriteSpecies && stats.favoriteSpecies.length > 8 ? '1.1rem' : undefined }}>
                    {stats.favoriteSpecies ?? '–'}
                  </div>
                  <div className="stat-sub">{t('dashboard.stat_favorite')}</div>
                </div>
                <img src="/img/stat-fish-teal.svg" alt="" className="stat-illus" />
              </div>

              <div className="stat-card stat-card--weight">
                <div className="stat-card-body">
                  <div className="stat-label">SCHWERSTER FANG</div>
                  <div className="stat-number">{stats.biggestByWeight ? `${stats.biggestByWeight.weight} kg` : '–'}</div>
                  <div className="stat-sub">{stats.biggestByWeight ? stats.biggestByWeight.fishSpecies : 'Noch kein Rekord'}</div>
                </div>
                <img src="/img/stat-lure.svg" alt="" className="stat-illus" />
              </div>

              <div className="stat-card stat-card--length">
                <div className="stat-card-body">
                  <div className="stat-label">LÄNGSTER FANG</div>
                  <div className="stat-number">{stats.biggestByLength ? `${stats.biggestByLength.length} cm` : '–'}</div>
                  <div className="stat-sub">{stats.biggestByLength ? stats.biggestByLength.fishSpecies : 'Noch kein Rekord'}</div>
                </div>
                <img src="/img/stat-hook.svg" alt="" className="stat-illus stat-illus--hook" />
              </div>
            </div>

            <div className="section">
              <div className="section-header">
                <h3>{t('dashboard.recent_catches')}</h3>
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
                    <div key={c.id} className="catch-item catch-item--clickable" onClick={() => navigate('/catches')}>
                      {c.imageUrl ? (
                        <div className="catch-item-thumb" onClick={(e) => { e.stopPropagation(); setLightboxSrc(c.imageUrl); }} title={t('common.zoom')}>
                          <img src={c.imageUrl} alt={c.fishSpecies} />
                        </div>
                      ) : (
                        <div className="catch-icon">🐟</div>
                      )}
                      <div className="catch-info">
                        <strong>{c.fishSpecies}</strong>
                        <span className="catch-location"><IconMapPin /> {c.waterName}</span>
                      </div>
                      <span className="catch-date-pill">
                        <IconCalendar /> {new Date(c.caughtAt).toLocaleDateString(toLocaleTag(locale))}
                      </span>
                      <span className="catch-chevron"><IconChevronRight /></span>
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
              <strong>{t('nav.catches')}</strong>
              <span>Deine Fänge im Überblick</span>
            </div>
          </Link>
          <Link to="/spots" className="quick-link ql-spots">
            <div className="quick-link-content">
              <strong>{t('nav.spots_full')}</strong>
              <span>Die besten Plätze finden</span>
            </div>
          </Link>
          <Link to="/forecast" className="quick-link ql-forecast">
            <div className="quick-link-content">
              <strong>{t('nav.forecast')}</strong>
              <span>Aktuelle Beißaktivität</span>
            </div>
          </Link>
        </div>

        <Link to="/community" className="community-banner">
          <div className="community-banner-content">
            <h3>{t('nav.community')}</h3>
            <p>Tausche dich mit anderen Anglern aus</p>
          </div>
        </Link>

      </div>

      {lightboxSrc && (
        <PhotoLightbox src={lightboxSrc} alt={t('catches.photo_alt')} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  );
}
