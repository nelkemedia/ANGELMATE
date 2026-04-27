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

function FishFactIllus() {
  return (
    <svg viewBox="0 0 130 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="fun-fact-fish">
      <ellipse cx="58" cy="40" rx="44" ry="28" fill="rgba(255,255,255,0.12)" />
      <polygon points="102,40 122,22 122,58" fill="rgba(255,255,255,0.15)" />
      <circle cx="32" cy="30" r="5.5" fill="rgba(255,255,255,0.3)" />
      <circle cx="32" cy="30" r="2" fill="rgba(0,0,0,0.15)" />
      <path d="M42 52 Q56 64 68 58 Q56 70 40 64 Z" fill="rgba(255,255,255,0.07)" />
      <path d="M58 26 Q78 18 94 28 Q78 42 58 34 Z" fill="rgba(255,255,255,0.08)" />
    </svg>
  );
}

function StatFish() {
  return (
    <svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="stat-illus">
      <ellipse cx="36" cy="26" rx="28" ry="17" fill="rgba(255,255,255,0.18)" />
      <polygon points="64,26 78,14 78,38" fill="rgba(255,255,255,0.18)" />
      <circle cx="20" cy="18" r="3.5" fill="rgba(255,255,255,0.35)" />
      <circle cx="20" cy="18" r="1.4" fill="rgba(0,0,0,0.15)" />
    </svg>
  );
}

function StatFishBlue() {
  return (
    <svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="stat-illus">
      <ellipse cx="36" cy="26" rx="28" ry="17" fill="#e0f5f5" stroke="#0e7c7c" strokeWidth="1.5" />
      <polygon points="64,26 78,14 78,38" fill="#0e7c7c" opacity="0.65" />
      <circle cx="20" cy="18" r="3" fill="#0e7c7c" />
      <circle cx="20" cy="18" r="1.2" fill="white" />
      <path d="M30 22 Q42 15 54 22 Q42 31 30 22Z" fill="#0a6b6b" opacity="0.2" />
    </svg>
  );
}

function StatLure() {
  return (
    <svg viewBox="0 0 80 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="stat-illus">
      <rect x="14" y="20" width="34" height="12" rx="6" fill="#e0f5f5" stroke="#0e7c7c" strokeWidth="1.5" />
      <circle cx="11" cy="26" r="4" fill="#0e7c7c" opacity="0.45" />
      <line x1="48" y1="26" x2="62" y2="26" stroke="#4a7070" strokeWidth="1.5" />
      <circle cx="63" cy="26" r="2.5" fill="none" stroke="#4a7070" strokeWidth="1.5" />
      <circle cx="22" cy="22" r="1.5" fill="#0e7c7c" opacity="0.35" />
      <circle cx="31" cy="20" r="1.2" fill="#0e7c7c" opacity="0.25" />
      <circle cx="40" cy="20" r="1.2" fill="#0e7c7c" opacity="0.25" />
    </svg>
  );
}

function StatHook() {
  return (
    <svg viewBox="0 0 52 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="stat-illus stat-illus--hook">
      <circle cx="26" cy="10" r="5" fill="none" stroke="#0e7c7c" strokeWidth="2.5" />
      <path d="M26 15 L26 46 C26 56 16 62 10 56 C6 52 8 46 14 46 C18 46 20 50 17 53" stroke="#0e7c7c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
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
          <FishFactIllus />
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
                <StatFish />
              </div>

              <div className="stat-card">
                <div className="stat-card-body">
                  <div className="stat-label">LIEBLINGSART</div>
                  <div className="stat-number" style={{ fontSize: stats.favoriteSpecies && stats.favoriteSpecies.length > 8 ? '1.2rem' : undefined }}>
                    {stats.favoriteSpecies ?? '–'}
                  </div>
                  <div className="stat-sub">{t('dashboard.stat_favorite')}</div>
                </div>
                <StatFishBlue />
              </div>

              <div className="stat-card">
                <div className="stat-card-body">
                  <div className="stat-label">SCHWERSTER FANG</div>
                  <div className="stat-number">{stats.biggestByWeight ? `${stats.biggestByWeight.weight} kg` : '–'}</div>
                  <div className="stat-sub">{stats.biggestByWeight ? stats.biggestByWeight.fishSpecies : 'Noch kein Rekord'}</div>
                </div>
                <StatLure />
              </div>

              <div className="stat-card">
                <div className="stat-card-body">
                  <div className="stat-label">LÄNGSTER FANG</div>
                  <div className="stat-number">{stats.biggestByLength ? `${stats.biggestByLength.length} cm` : '–'}</div>
                  <div className="stat-sub">{stats.biggestByLength ? stats.biggestByLength.fishSpecies : 'Noch kein Rekord'}</div>
                </div>
                <StatHook />
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
