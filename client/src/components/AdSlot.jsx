import { useEffect, useState } from 'react';
import { api } from '../api/client';
import AdBanner from './AdBanner';
import AdCard from './AdCard';

export default function AdSlot({ position }) {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    api.ads.allForPosition(position)
      .then((data) => {
        setAds(data.ads || []);
        (data.ads || []).forEach((ad) => {
          api.ads.trackImpression(ad.id).catch(() => {});
        });
      })
      .catch(() => setAds([]));
  }, [position]);

  if (ads.length === 0) return null;

  return (
    <div className="ad-slot">
      {ads.map((ad) => (
        <div key={ad.id} className="ad-item">
          {ad.format === 'BANNER'
            ? <AdBanner ad={ad} />
            : <AdCard ad={ad} />}
        </div>
      ))}
    </div>
  );
}
