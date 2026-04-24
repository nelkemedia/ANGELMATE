import { useRef, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

const SKILL_OPTIONS = [
  { value: 'beginner',     label: '🐣 Anfänger' },
  { value: 'intermediate', label: '🎯 Fortgeschritten' },
  { value: 'advanced',     label: '🏆 Profi' },
];

// Center-crop to square, scale down to maxSide, return JPEG data-URL
function resizeToBase64(file, maxSide = 128, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      // Source: center-square in the ORIGINAL pixel space
      const origSide = Math.min(img.width, img.height);
      const srcX = (img.width  - origSide) / 2;
      const srcY = (img.height - origSide) / 2;
      // Destination: cap at maxSide
      const canvasSide = Math.min(origSide, maxSide);
      const canvas = document.createElement('canvas');
      canvas.width  = canvasSide;
      canvas.height = canvasSide;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, srcX, srcY, origSide, origSide, 0, 0, canvasSide, canvasSide);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const fileRef = useRef(null);

  const [avatarPreview, setAvatarPreview] = useState(user?.avatarBase64 ?? null);
  const [avatarSaving,  setAvatarSaving]  = useState(false);
  const [avatarMsg,     setAvatarMsg]     = useState(null);

  const [profileForm, setProfileForm] = useState({
    name:       user?.name       ?? '',
    homeRegion: user?.homeRegion ?? '',
    skillLevel: user?.skillLevel ?? 'beginner',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg,    setProfileMsg]    = useState(null);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg,    setPwMsg]    = useState(null);

  function setP(field) { return (e) => setProfileForm((f) => ({ ...f, [field]: e.target.value })); }
  function setW(field) { return (e) => setPwForm((f) => ({ ...f, [field]: e.target.value })); }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setAvatarSaving(true);
    setAvatarMsg(null);
    try {
      const b64 = await resizeToBase64(file, 128, 0.78);
      setAvatarPreview(b64);
      const data = await api.auth.updateProfile({ avatarBase64: b64 });
      updateUser(data.user);
      setAvatarMsg({ type: 'success', text: '✅ Profilbild gespeichert!' });
    } catch (err) {
      setAvatarMsg({ type: 'error', text: `⚠️ ${err.message ?? 'Bild konnte nicht gespeichert werden.'}` });
    } finally {
      setAvatarSaving(false);
    }
  }

  async function handleAvatarRemove() {
    setAvatarSaving(true);
    setAvatarMsg(null);
    try {
      const data = await api.auth.updateProfile({ avatarBase64: null });
      updateUser(data.user);
      setAvatarPreview(null);
      setAvatarMsg({ type: 'success', text: '✅ Profilbild entfernt.' });
    } catch (err) {
      setAvatarMsg({ type: 'error', text: `⚠️ ${err.message}` });
    } finally {
      setAvatarSaving(false);
    }
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const payload = {
        name:       profileForm.name,
        skillLevel: profileForm.skillLevel,
        homeRegion: profileForm.homeRegion || null,
      };
      const data = await api.auth.updateProfile(payload);
      updateUser(data.user);
      setProfileMsg({ type: 'success', text: '✅ Profil erfolgreich gespeichert!' });
    } catch (e) {
      setProfileMsg({ type: 'error', text: `⚠️ ${e.message}` });
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'error', text: '⚠️ Die neuen Passwörter stimmen nicht überein.' });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await api.auth.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg({ type: 'success', text: '✅ Passwort erfolgreich geändert!' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      setPwMsg({ type: 'error', text: `⚠️ ${e.message}` });
    } finally {
      setPwSaving(false);
    }
  }

  const skillLabel   = SKILL_OPTIONS.find((o) => o.value === user?.skillLevel)?.label ?? user?.skillLevel;
  const memberSince  = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })
    : '–';

  return (
    <div>
      {/* Hero */}
      <div className="profile-hero">
        <div className="profile-avatar-hero-wrap" onClick={() => fileRef.current?.click()} title="Foto ändern">
          <Avatar src={avatarPreview} name={user?.name} size={72} className="profile-avatar-hero" />
          <div className="profile-avatar-edit-badge">📷</div>
        </div>
        <div className="profile-hero-info">
          <h2>{user?.name}</h2>
          <div className="profile-hero-meta">
            <span>{user?.email}</span>
            <span className="profile-hero-dot">·</span>
            <span>{skillLabel}</span>
            {user?.homeRegion && <><span className="profile-hero-dot">·</span><span>📍 {user.homeRegion}</span></>}
          </div>
          <div className="profile-hero-since">Dabei seit {memberSince}</div>
        </div>
      </div>

      <div className="page">

        {/* Avatar upload card */}
        <div className="profile-card">
          <div className="profile-card-header">
            <span className="profile-card-icon">📷</span>
            <div>
              <h3>Profilbild</h3>
              <p>JPG oder PNG · wird auf 128 × 128 px zugeschnitten</p>
            </div>
          </div>

          <div className="avatar-editor">
            <div className="avatar-editor-preview" onClick={() => fileRef.current?.click()} title="Foto auswählen">
              <Avatar src={avatarPreview} name={user?.name} size={96} className="avatar-editor-img" />
              <div className="avatar-editor-overlay">📷</div>
            </div>
            <div className="avatar-editor-actions">
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              <button className="btn-primary" onClick={() => fileRef.current?.click()} disabled={avatarSaving}>
                {avatarSaving ? '⏳ Wird gespeichert…' : '🖼 Foto auswählen'}
              </button>
              {avatarPreview && !avatarSaving && (
                <button className="btn-ghost" onClick={handleAvatarRemove} disabled={avatarSaving}>
                  🗑 Entfernen
                </button>
              )}
            </div>
          </div>

          {avatarMsg && (
            <div className={`${avatarMsg.type === 'success' ? 'success-msg' : 'error-msg'}`} style={{ marginTop: '0.75rem' }}>
              {avatarMsg.text}
            </div>
          )}
        </div>

        {/* Profile fields */}
        <div className="profile-card">
          <div className="profile-card-header">
            <span className="profile-card-icon">👤</span>
            <div>
              <h3>Profil bearbeiten</h3>
              <p>Name, Heimatregion und Erfahrungslevel</p>
            </div>
          </div>
          <form onSubmit={handleProfileSave}>
            <div className="field">
              <label>Name</label>
              <input value={profileForm.name} onChange={setP('name')} required minLength={2} maxLength={80} placeholder="Dein Name" />
            </div>
            <div className="field">
              <label>Heimatregion</label>
              <input value={profileForm.homeRegion} onChange={setP('homeRegion')} maxLength={120} placeholder="z.B. Bayern, Bodensee, Nordsee …" />
            </div>
            <div className="field">
              <label>Erfahrungslevel</label>
              <select value={profileForm.skillLevel} onChange={setP('skillLevel')}>
                {SKILL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {profileMsg && (
              <div className={profileMsg.type === 'success' ? 'success-msg' : 'error-msg'}>{profileMsg.text}</div>
            )}
            <div className="profile-card-actions">
              <button type="submit" className="btn-primary" disabled={profileSaving}>
                {profileSaving ? '⏳ Speichern…' : '💾 Speichern'}
              </button>
            </div>
          </form>
        </div>

        {/* Password */}
        <div className="profile-card">
          <div className="profile-card-header">
            <span className="profile-card-icon">🔒</span>
            <div><h3>Passwort ändern</h3><p>Mindestens 8 Zeichen</p></div>
          </div>
          <form onSubmit={handlePasswordSave}>
            <div className="field">
              <label>Aktuelles Passwort</label>
              <input type="password" value={pwForm.currentPassword} onChange={setW('currentPassword')} required placeholder="••••••••" />
            </div>
            <div className="field">
              <label>Neues Passwort</label>
              <input type="password" value={pwForm.newPassword} onChange={setW('newPassword')} required minLength={8} placeholder="Mindestens 8 Zeichen" />
            </div>
            <div className="field">
              <label>Neues Passwort bestätigen</label>
              <input type="password" value={pwForm.confirmPassword} onChange={setW('confirmPassword')} required minLength={8} placeholder="Passwort wiederholen" />
            </div>
            {pwMsg && (
              <div className={pwMsg.type === 'success' ? 'success-msg' : 'error-msg'}>{pwMsg.text}</div>
            )}
            <div className="profile-card-actions">
              <button type="submit" className="btn-primary" disabled={pwSaving}>
                {pwSaving ? '⏳ Ändern…' : '🔑 Passwort ändern'}
              </button>
            </div>
          </form>
        </div>

        {/* Info */}
        <div className="profile-card profile-card-info">
          <div className="profile-card-header">
            <span className="profile-card-icon">ℹ️</span>
            <div><h3>Konto-Informationen</h3><p>Schreibgeschützte Daten</p></div>
          </div>
          <div className="profile-info-rows">
            <div className="profile-info-row">
              <span className="pir-label">E-Mail</span>
              <span className="pir-value">{user?.email}</span>
            </div>
            <div className="profile-info-row">
              <span className="pir-label">Nutzer-ID</span>
              <span className="pir-value pir-mono">{user?.id}</span>
            </div>
            <div className="profile-info-row">
              <span className="pir-label">Dabei seit</span>
              <span className="pir-value">{memberSince}</span>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="profile-card profile-card-danger">
          <div className="profile-card-header">
            <span className="profile-card-icon">🚪</span>
            <div><h3>Abmelden</h3><p>Du wirst auf die Anmeldeseite weitergeleitet.</p></div>
          </div>
          <button className="btn-danger" onClick={logout}>🚪 Jetzt abmelden</button>
        </div>

      </div>
    </div>
  );
}
