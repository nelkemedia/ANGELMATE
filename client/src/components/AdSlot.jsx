import { useEffect, useState } from 'react';
import { api } from '../api/client';
import AdBanner from './AdBanner';
import AdCard from './AdCard';

export default function AdSlot({ position }) {
  const [ad, setAd] = useState(undefined);

  useEffect(() => {
    api.ads.current(position)
      .then((data) => {
        setAd(data.ad);
        if (data.ad) api.ads.trackImpression(data.ad.id).catch(() => {});
      })
      .catch(() => setAd(null));
  }, [position]);

  if (!ad) return null;

  return ad.format === 'BANNER'
    ? <AdBanner ad={ad} />
    : <AdCard ad={ad} />;
}
