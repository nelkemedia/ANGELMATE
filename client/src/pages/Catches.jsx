import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import PhotoLightbox from '../components/PhotoLightbox';

function useLockBody(active) {
  useEffect(() => {
    if (active) { document.body.classList.add('has-modal'); }
    else { document.body.classList.remove('has-modal'); }
    return () => document.body.classList.remove('has-modal');
  }, [active]);
}

// Resize photo before storage (caps at 1024 px, JPEG 85 %)
function resizePhoto(file, maxSide = 1024) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const w = Math.round(img.width  * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target.result);
      reader.readAsDataURL(file);
    };
    img.src = url;
  });
}

const EMPTY_FORM = {
  fishSpecies: '', weight: '', length: '', caughtAt: '', waterName: '',
  bait: '', technique: '', notes: '', isPublic: false, imageUrl: ''
};

export default function Catches() {
  const [items,     setItems]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [modal,     setModal]     = useState(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [formError, setFormError] = useState('');
  const [photoProcessing, setPhotoProcessing] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const fileRef = useRef(null);
  useLockBody(!!modal);

  async function load() {
    try {
      const data = await api.catches.list();
      setItems(data.items);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm({ ...EMPTY_FORM, caughtAt: new Date().toISOString().slice(0, 16) });
    setFormError('');
    setModal('add');
  }

  function openEdit(item) {
    setForm({
      fishSpecies: item.fishSpecies ?? '',
      weight:      item.weight      ?? '',
      length:      item.length      ?? '',
      caughtAt:    item.caughtAt ? item.caughtAt.slice(0, 16) : '',
      waterName:   item.waterName   ?? '',
      bait:        item.bait        ?? '',
      technique:   item.technique   ?? '',
      notes:       item.notes       ?? '',
      isPublic:    item.isPublic    ?? false,
      imageUrl:    item.imageUrl    ?? ''
    });
    setFormError('');
    setModal(item);
  }

  function set(field) {
    return (e) => {
      const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: val }));
    };
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setPhotoProcessing(true);
    try {
      const dataUrl = await resizePhoto(file, 1024);
      setForm((f) => ({ ...f, imageUrl: dataUrl }));
    } finally {
      setPhotoProcessing(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        fishSpecies: form.fishSpecies,
        waterName:   form.waterName,
        caughtAt:    new Date(form.caughtAt).toISOString(),
        isPublic:    form.isPublic
      };
      if (form.weight    !== '') payload.weight    = parseFloat(form.weight);
      if (form.length    !== '') payload.length    = parseFloat(form.length);
      if (form.bait)              payload.bait      = form.bait;
      if (form.technique)         payload.technique = form.technique;
      if (form.notes)             payload.notes     = form.notes;
      if (form.imageUrl)          payload.imageUrl  = form.imageUrl;

      if (modal === 'add') await api.catches.create(payload);
      else                  await api.catches.update(modal.id, payload);
      setModal(null);
      load();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Fang wirklich löschen? 🗑️')) return;
    try { await api.catches.delete(id); load(); }
    catch (e) { setError(e.message); }
  }

  return (
    <div>
      <div className="section-photo-banner" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1689709105115-e11810b6c425?w=1200&q=80&auto=format&fit=crop)' }}>
        <div className="section-photo-banner-text">
          <h2>📖 Fangbuch</h2>
          <p>Jeder Fang ist eine Geschichte wert.</p>
        </div>
      </div>

      <div className="page">
        <div className="page-header">
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {items.length} {items.length === 1 ? 'Eintrag' : 'Einträge'}
          </span>
          <button className="btn-primary" onClick={openAdd}>🎣 Neuer Fang</button>
        </div>

        {error   && <div className="error-msg">{error}</div>}
        {loading && <div className="loading">🎣 Lade Fänge…</div>}

        {!loading && items.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🐟</div>
            <p>Noch nichts gefangen — oder du hast es nicht aufgeschrieben! 😄</p>
            <button className="btn-primary" onClick={openAdd}>🎣 Ersten Fang eintragen</button>
          </div>
        )}

        {items.length > 0 && (
          <div className="catch-cards">
            {items.map((c) => (
              <div key={c.id} className="catch-card">
                {c.imageUrl && (
                  <div className="catch-card-photo-wrap" onClick={() => setLightboxSrc(c.imageUrl)}>
                    <img src={c.imageUrl} alt={c.fishSpecies} className="catch-card-photo" />
                    <div className="catch-card-photo-hint">🔍</div>
                  </div>
                )}
                <div className="catch-card-stripe" />
                <div className="catch-card-inner">
                  <div className="catch-card-header">
                    <span className="fish-name">🐟 {c.fishSpecies}</span>
                    {c.isPublic && <span className="badge-public">🌐 Öffentlich</span>}
                  </div>
                  <div className="catch-card-body">
                    <div className="catch-detail">📍 {c.waterName}</div>
                    <div className="catch-detail">📅 {new Date(c.caughtAt).toLocaleString('de-DE')}</div>
                    {(c.weight || c.length) && (
                      <div className="catch-detail">
                        {c.weight && `⚖️ ${c.weight} kg`}
                        {c.weight && c.length && '  ·  '}
                        {c.length && `📏 ${c.length} cm`}
                      </div>
                    )}
                    {c.bait      && <div className="catch-detail">🪱 {c.bait}</div>}
                    {c.technique && <div className="catch-detail">🎯 {c.technique}</div>}
                    {c.notes     && <div className="catch-notes">💬 {c.notes}</div>}
                  </div>
                </div>
                <div className="catch-card-actions">
                  <button className="btn-ghost"        onClick={() => openEdit(c)}>✏️ Bearbeiten</button>
                  <button className="btn-danger-ghost" onClick={() => handleDelete(c.id)}>🗑️ Löschen</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === 'add' ? '🎣 Neuer Fang' : '✏️ Fang bearbeiten'}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave}>

              {/* Photo upload */}
              <div className="catch-photo-section">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoChange}
                />
                {form.imageUrl ? (
                  <div className="catch-photo-preview-wrap">
                    <img src={form.imageUrl} alt="Fangfoto" className="catch-photo-preview" />
                    <button
                      type="button"
                      className="catch-photo-remove"
                      onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))}
                      title="Foto entfernen"
                    >✕</button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="catch-photo-btn"
                    onClick={() => fileRef.current?.click()}
                    disabled={photoProcessing}
                  >
                    {photoProcessing ? '⏳ Wird verarbeitet…' : '📷 Foto hinzufügen'}
                  </button>
                )}
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Fischart *</label>
                  <input value={form.fishSpecies} onChange={set('fishSpecies')} required minLength={2} placeholder="z.B. Hecht, Barsch, Zander" />
                </div>
                <div className="field">
                  <label>Gewässer *</label>
                  <input value={form.waterName} onChange={set('waterName')} required minLength={2} placeholder="z.B. Bodensee, Isar" />
                </div>
              </div>
              <div className="field">
                <label>Datum &amp; Uhrzeit *</label>
                <input type="datetime-local" value={form.caughtAt} onChange={set('caughtAt')} required />
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Gewicht (kg)</label>
                  <input type="number" step="0.01" min="0" max="200" value={form.weight} onChange={set('weight')} placeholder="3.5" />
                </div>
                <div className="field">
                  <label>Länge (cm)</label>
                  <input type="number" step="0.1" min="0" max="300" value={form.length} onChange={set('length')} placeholder="65" />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Köder</label>
                  <input value={form.bait} onChange={set('bait')} placeholder="z.B. Wobbler, Wurm, Fliege" />
                </div>
                <div className="field">
                  <label>Technik</label>
                  <input value={form.technique} onChange={set('technique')} placeholder="z.B. Spinnfischen, Floatfischen" />
                </div>
              </div>
              <div className="field">
                <label>Notizen</label>
                <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Wetter, Wassertemperatur, besondere Momente…" maxLength={1000} />
              </div>
              <div className="field-check">
                <label>
                  <input type="checkbox" checked={form.isPublic} onChange={set('isPublic')} />
                  🌐 Fang öffentlich sichtbar machen
                </label>
              </div>
              {formError && <div className="error-msg">⚠️ {formError}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setModal(null)}>Abbrechen</button>
                <button type="submit" className="btn-primary" disabled={saving || photoProcessing}>
                  {saving ? '⏳ Speichern…' : '💾 Speichern'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lightboxSrc && (
        <PhotoLightbox src={lightboxSrc} alt="Fangfoto" onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  );
}
