import { api } from '../api/client';

export default function AdBanner({ ad }) {
  function handleClick() {
    api.ads.trackClick(ad.id).catch(() => {});
    window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="ad-banner" onClick={handleClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleClick()}>
      <span className="ad-label">Gesponsert</span>
      <img src={ad.imageBase64} alt="Werbeanzeige" className="ad-banner-img" />
    </div>
  );
}
