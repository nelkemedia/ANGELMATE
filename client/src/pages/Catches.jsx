import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import { useT } from '../context/TranslationContext';
import { toLocaleTag } from '../utils/locale';
import PhotoLightbox from '../components/PhotoLightbox';

function useLockBody(active) {
  useEffect(() => {
    if (active) { document.body.classList.add('has-modal'); }
    else { document.body.classList.remove('has-modal'); }
    return () => document.body.classList.remove('has-modal');
  }, [active]);
}

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
  const { t, locale } = useT();
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
    if (!confirm(t('catches.delete_confirm'))) return;
    try { await api.catches.delete(id); load(); }
    catch (e) { setError(e.message); }
  }

  return (
    <div>
      <div className="section-photo-banner section-photo-banner--catches">
        <div className="section-photo-banner-text">
          <h2>📖 {t('catches.title')}</h2>
          <p>{t('catches.subtitle')}</p>
        </div>
      </div>

      <div className="page">
        <div className="page-header">
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {items.length} {items.length === 1 ? t('catches.entry_one') : t('catches.entry_many')}
          </span>
          <button className="btn-primary" onClick={openAdd}>🎣 {t('catches.add_btn')}</button>
        </div>

        {error   && <div className="error-msg">{error}</div>}
        {loading && <div className="loading">🎣 {t('catches.loading')}</div>}

        {!loading && items.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🐟</div>
            <p>{t('catches.empty')}</p>
            <button className="btn-primary" onClick={openAdd}>🎣 {t('catches.add_first')}</button>
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
                    {c.isPublic && <span className="badge-public">🌐 {t('common.public')}</span>}
                  </div>
                  <div className="catch-card-body">
                    <div className="catch-detail">📍 {c.waterName}</div>
                    <div className="catch-detail">📅 {new Date(c.caughtAt).toLocaleString(toLocaleTag(locale))}</div>
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
                  <button className="btn-ghost"        onClick={() => openEdit(c)}>✏️ {t('common.edit')}</button>
                  <button className="btn-danger-ghost" onClick={() => handleDelete(c.id)}>🗑️ {t('common.delete')}</button>
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
              <h3>{modal === 'add' ? `🎣 ${t('catches.modal_add')}` : `✏️ ${t('catches.modal_edit')}`}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="catch-photo-section">
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
                {form.imageUrl ? (
                  <div className="catch-photo-preview-wrap">
                    <img src={form.imageUrl} alt={t('catches.photo_alt')} className="catch-photo-preview" />
                    <button type="button" className="catch-photo-remove" onClick={() => setForm((f) => ({ ...f, imageUrl: '' }))} title={t('common.remove')}>✕</button>
                  </div>
                ) : (
                  <button type="button" className="catch-photo-btn" onClick={() => fileRef.current?.click()} disabled={photoProcessing}>
                    {photoProcessing ? `⏳ ${t('catches.photo_processing')}` : `📷 ${t('catches.photo_add')}`}
                  </button>
                )}
              </div>

              <div className="form-row">
                <div className="field">
                  <label>{t('catches.field_species')} *</label>
                  <input value={form.fishSpecies} onChange={set('fishSpecies')} required minLength={2} placeholder={t('catches.field_species_ph')} />
                </div>
                <div className="field">
                  <label>{t('catches.field_water')} *</label>
                  <input value={form.waterName} onChange={set('waterName')} required minLength={2} placeholder={t('catches.field_water_ph')} />
                </div>
              </div>
              <div className="field">
                <label>{t('catches.field_datetime')} *</label>
                <input type="datetime-local" value={form.caughtAt} onChange={set('caughtAt')} required />
              </div>
              <div className="form-row">
                <div className="field">
                  <label>{t('catches.field_weight')}</label>
                  <input type="number" step="0.01" min="0" max="200" value={form.weight} onChange={set('weight')} placeholder="3.5" />
                </div>
                <div className="field">
                  <label>{t('catches.field_length')}</label>
                  <input type="number" step="0.1" min="0" max="300" value={form.length} onChange={set('length')} placeholder="65" />
                </div>
              </div>
              <div className="form-row">
                <div className="field">
                  <label>{t('catches.field_bait')}</label>
                  <input value={form.bait} onChange={set('bait')} placeholder={t('catches.field_bait_ph')} />
                </div>
                <div className="field">
                  <label>{t('catches.field_technique')}</label>
                  <input value={form.technique} onChange={set('technique')} placeholder={t('catches.field_technique_ph')} />
                </div>
              </div>
              <div className="field">
                <label>{t('catches.field_notes')}</label>
                <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder={t('catches.field_notes_ph')} maxLength={1000} />
              </div>
              <div className="field-check">
                <label>
                  <input type="checkbox" checked={form.isPublic} onChange={set('isPublic')} />
                  🌐 {t('catches.make_public')}
                </label>
              </div>
              {formError && <div className="error-msg">⚠️ {formError}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setModal(null)}>{t('common.cancel')}</button>
                <button type="submit" className="btn-primary" disabled={saving || photoProcessing}>
                  {saving ? `⏳ ${t('common.saving')}` : `💾 ${t('common.save')}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {lightboxSrc && (
        <PhotoLightbox src={lightboxSrc} alt={t('catches.photo_alt')} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  );
}
