import { api } from '../api/client';

export default function AdCard({ ad }) {
  function handleClick() {
    api.ads.trackClick(ad.id).catch(() => {});
    window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="ad-card">
      <span className="ad-label">Gesponsert</span>
      <div className="ad-card-inner" onClick={handleClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleClick()}>
        <img src={ad.imageBase64} alt="Werbeanzeige" className="ad-card-img" />
        <div className="ad-card-body">
          {ad.title && <div className="ad-card-title">{ad.title}</div>}
          {ad.description && <p className="ad-card-desc">{ad.description}</p>}
          <span className="btn-primary ad-card-cta">Mehr erfahren →</span>
        </div>
      </div>
    </div>
  );
}
