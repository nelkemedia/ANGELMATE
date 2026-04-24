import { useEffect, useRef, useState } from 'react';

function useLockBody(active) {
  useEffect(() => {
    if (active) { document.body.classList.add('has-modal'); }
    else { document.body.classList.remove('has-modal'); }
    return () => document.body.classList.remove('has-modal');
  }, [active]);
}
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = {
  title: '', description: '', latitude: '', longitude: '', visibility: 'private', targetSpecies: ''
};

export default function Spots() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  useLockBody(!!modal);

  async function load() {
    try {
      const data = await api.spots.list();
      setItems(data.items);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function resetSearchState() {
    setSearchQuery('');
    setSearchResults([]);
    setSearchLoading(false);
  }

  function openAdd() {
    setForm(EMPTY_FORM);
    setFormError('');
    setGpsLocation(null);
    resetSearchState();
    setModal('add');
  }

  function openEdit(item) {
    setForm({
      title:         item.title         ?? '',
      description:   item.description   ?? '',
      latitude:      item.latitude      ?? '',
      longitude:     item.longitude     ?? '',
      visibility:    item.visibility    ?? 'private',
      targetSpecies: (item.targetSpecies ?? []).join(', ')
    });
    setFormError('');
    setGpsLocation(
      item.latitude && item.longitude
        ? { lat: item.latitude, lng: item.longitude,
            label: `${Number(item.latitude).toFixed(5)}, ${Number(item.longitude).toFixed(5)}` }
        : null
    );
    resetSearchState();
    setModal(item);
  }

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        title: form.title,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        visibility: form.visibility
      };
      if (form.description) payload.description = form.description;
      if (form.targetSpecies) {
        payload.targetSpecies = form.targetSpecies.split(',').map((s) => s.trim()).filter(Boolean);
      }
      if (modal === 'add') await api.spots.create(payload);
      else await api.spots.update(modal.id, payload);
      setModal(null);
      load();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Spot wirklich löschen? 🗑️')) return;
    try { await api.spots.delete(id); load(); }
    catch (e) { setError(e.message); }
  }

  function useGps() {
    if (!navigator.geolocation) {
      setFormError('Geolocation wird von diesem Browser nicht unterstützt.');
      return;
    }
    setGpsLoading(true);
    setGpsLocation(null);
    setFormError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Math.round(pos.coords.latitude * 100000) / 100000;
        const lng = Math.round(pos.coords.longitude * 100000) / 100000;

        // Reverse geocoding via Nominatim (kostenlos, kein Key)
        let locationName = '';
        let displayLabel = '';
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=de`
          );
          if (res.ok) {
            const data = await res.json();
            const a = data.address;
            locationName = a.city || a.town || a.village || a.county || a.state || '';
            const water = a.water || a.river || a.lake || a.reservoir || '';
            displayLabel = [water, locationName, a.state].filter(Boolean).join(', ');
          }
        } catch { /* Geocoding optional */ }

        setGpsLocation({ lat, lng, label: displayLabel || `${lat}, ${lng}`, fresh: true });

        setForm((f) => ({
          ...f,
          latitude: String(lat),
          longitude: String(lng),
          // Titel nur vorausfüllen wenn noch leer
          title: f.title || locationName || '',
        }));
        setGpsLoading(false);
      },
      () => {
        setFormError('Standort konnte nicht ermittelt werden. Bitte Zugriff im Browser erlauben.');
        setGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  async function searchLocation(e) {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchLoading(true);
    setSearchResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&accept-language=de&countrycodes=de,at,ch`
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch { /* ignore */ } finally {
      setSearchLoading(false);
    }
  }

  function pickResult(result) {
    const lat = Math.round(parseFloat(result.lat) * 100000) / 100000;
    const lng = Math.round(parseFloat(result.lon) * 100000) / 100000;
    const label = result.display_name.split(',').slice(0, 3).join(', ');
    setForm((f) => ({
      ...f,
      latitude: String(lat),
      longitude: String(lng),
      title: f.title || result.display_name.split(',')[0] || '',
    }));
    setGpsLocation({ lat, lng, label, fresh: true });
    setSearchResults([]);
    setSearchQuery('');
  }

  function mapsUrl(lat, lng) {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  const mySpots = items.filter((s) => s.userId === user?.id);
  const publicSpots = items.filter((s) => s.visibility === 'public' && s.userId !== user?.id);

  return (
    <div>
      <div className="section-photo-banner section-photo-banner--spots">
        <div className="section-photo-banner-text">
          <h2>📍 Angelspots</h2>
          <p>Deine Geheimplätze — und die der Community.</p>
        </div>
      </div>

      <div className="page">
        <div className="page-header">
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {mySpots.length} eigene Spots
          </span>
          <button className="btn-primary" onClick={openAdd}>📍 Neuer Spot</button>
        </div>

        {error && <div className="error-msg">{error}</div>}
        {loading && <div className="loading">🗺️ Lade Spots…</div>}

        {!loading && (
          <>
            <div className="section">
              <h3>🔒 Meine Spots ({mySpots.length})</h3>
              {mySpots.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📍</div>
                  <p>Noch keine Spots gespeichert — wo angelst du am liebsten?</p>
                  <button className="btn-primary" onClick={openAdd}>📍 Ersten Spot anlegen</button>
                </div>
              ) : (
                <div className="spot-cards">
                  {mySpots.map((s) => (
                    <SpotCard key={s.id} spot={s} isOwner onEdit={openEdit} onDelete={handleDelete} mapsUrl={mapsUrl} />
                  ))}
                </div>
              )}
            </div>

            {publicSpots.length > 0 && (
              <div className="section">
                <h3>🌐 Community Spots ({publicSpots.length})</h3>
                <div className="spot-cards">
                  {publicSpots.map((s) => (
                    <SpotCard key={s.id} spot={s} isOwner={false} mapsUrl={mapsUrl} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === 'add' ? '📍 Neuer Spot' : '✏️ Spot bearbeiten'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="field">
                <label>Name *</label>
                <input value={form.title} onChange={set('title')} required minLength={2} placeholder="z.B. Geheimspot Ammersee Nordseite" />
              </div>
              <div className="field">
                <label>Beschreibung</label>
                <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Tipps, beste Jahreszeiten, Besonderheiten…" maxLength={1000} />
              </div>
              <div className="field">
                <label>Ort suchen</label>
                <div className="location-search-row">
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); searchLocation(e); } }}
                    placeholder="z.B. Ammersee, Bodensee, Isar München"
                    autoComplete="off"
                  />
                  <button type="button" className="btn-gps" onClick={searchLocation} disabled={searchLoading || !searchQuery.trim()}>
                    {searchLoading ? '⏳' : '🔍 Suchen'}
                  </button>
                </div>
                {searchLoading && (
                  <div className="gps-status gps-loading">⏳ Suche läuft…</div>
                )}
                {searchResults.length > 0 && (
                  <ul className="location-results">
                    {searchResults.map((r) => (
                      <li key={r.place_id} onClick={() => pickResult(r)}>
                        <span className="location-result-name">{r.display_name.split(',').slice(0, 3).join(', ')}</span>
                        <span className="location-result-coords">{Number(r.lat).toFixed(4)}, {Number(r.lon).toFixed(4)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="field">
                <label>Koordinaten *</label>
                <div className="coords-row">
                  <input type="number" step="any" min="-90" max="90" value={form.latitude} onChange={set('latitude')} required placeholder="Breite: 48.1351" />
                  <input type="number" step="any" min="-180" max="180" value={form.longitude} onChange={set('longitude')} required placeholder="Länge: 11.5820" />
                  <button type="button" className="btn-gps" onClick={useGps} disabled={gpsLoading} title="GPS verwenden">
                    {gpsLoading ? '⏳' : '📍 GPS'}
                  </button>
                </div>
                {gpsLoading && (
                  <div className="gps-status gps-loading">⏳ Standort wird ermittelt…</div>
                )}
                {gpsLocation && !gpsLoading && (
                  <div className="gps-status gps-success">
                    📍 {gpsLocation.fresh ? '' : 'Gespeichert: '}{gpsLocation.label}
                  </div>
                )}
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Sichtbarkeit</label>
                  <select value={form.visibility} onChange={set('visibility')}>
                    <option value="private">🔒 Privat</option>
                    <option value="public">🌐 Öffentlich</option>
                  </select>
                </div>
                <div className="field">
                  <label>Zielarten (kommagetrennt)</label>
                  <input value={form.targetSpecies} onChange={set('targetSpecies')} placeholder="Hecht, Barsch, Zander" />
                </div>
              </div>
              {formError && <div className="error-msg">⚠️ {formError}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setModal(null)}>Abbrechen</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? '⏳ Speichern…' : '💾 Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SpotCard({ spot, isOwner, onEdit, onDelete, mapsUrl }) {
  return (
    <div className="spot-card">
      <div className="spot-card-stripe" />
      <div className="spot-card-inner">
        <div className="spot-card-header">
          <span className="spot-title">📍 {spot.title}</span>
          <span className={`badge-visibility ${spot.visibility}`}>
            {spot.visibility === 'public' ? '🌐 Öffentlich' : '🔒 Privat'}
          </span>
        </div>
        {spot.description && <div className="spot-desc">{spot.description}</div>}
        {spot.targetSpecies?.length > 0 && (
          <div className="spot-species">
            {spot.targetSpecies.map((s) => <span key={s} className="species-tag">🐟 {s}</span>)}
          </div>
        )}
        <div className="spot-coords">
          🗺️{' '}
          <a href={mapsUrl(spot.latitude, spot.longitude)} target="_blank" rel="noreferrer">
            {Number(spot.latitude).toFixed(4)}, {Number(spot.longitude).toFixed(4)} — Google Maps öffnen
          </a>
        </div>
      </div>
      {isOwner && (
        <div className="spot-card-actions">
          <button className="btn-ghost" onClick={() => onEdit(spot)}>✏️ Bearbeiten</button>
          <button className="btn-danger-ghost" onClick={() => onDelete(spot.id)}>🗑️ Löschen</button>
        </div>
      )}
    </div>
  );
}
