import { useRef, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/TranslationContext';
import { toLocaleTag } from '../utils/locale';
import Avatar from '../components/Avatar';

function resizeToBase64(file, maxSide = 128, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const origSide = Math.min(img.width, img.height);
      const srcX = (img.width  - origSide) / 2;
      const srcY = (img.height - origSide) / 2;
      const canvasSide = Math.min(origSide, maxSide);
      const canvas = document.createElement('canvas');
      canvas.width  = canvasSide;
      canvas.height = canvasSide;
      canvas.getContext('2d').drawImage(img, srcX, srcY, origSide, origSide, 0, 0, canvasSide, canvasSide);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const { t, locale } = useT();
  const fileRef = useRef(null);

  const [avatarPreview, setAvatarPreview] = useState(user?.avatarBase64 ?? null);
  const [avatarSaving,  setAvatarSaving]  = useState(false);
  const [avatarMsg,     setAvatarMsg]     = useState(null);

  const [profileForm, setProfileForm] = useState({
    name:       user?.name       ?? '',
    homeRegion: user?.homeRegion ?? '',
    skillLevel: user?.skillLevel ?? 'beginner',
    language:   user?.language   ?? 'de',
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
      setAvatarMsg({ type: 'success', text: `✅ ${t('profile.avatar_saved')}` });
    } catch (err) {
      setAvatarMsg({ type: 'error', text: `⚠️ ${err.message ?? t('profile.avatar_error')}` });
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
      setAvatarMsg({ type: 'success', text: `✅ ${t('profile.avatar_removed')}` });
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
        language:   profileForm.language,
      };
      const data = await api.auth.updateProfile(payload);
      updateUser(data.user);
      setProfileMsg({ type: 'success', text: `✅ ${t('profile.saved_ok')}` });
    } catch (e) {
      setProfileMsg({ type: 'error', text: `⚠️ ${e.message}` });
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSave(e) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'error', text: `⚠️ ${t('profile.pw_mismatch')}` });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await api.auth.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg({ type: 'success', text: `✅ ${t('profile.pw_changed_ok')}` });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      setPwMsg({ type: 'error', text: `⚠️ ${e.message}` });
    } finally {
      setPwSaving(false);
    }
  }

  const skillLabel  = t(`skill.${user?.skillLevel ?? 'beginner'}`);
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(toLocaleTag(locale), { year: 'numeric', month: 'long' })
    : '–';

  return (
    <div>
      <div className="profile-hero">
        <div className="profile-avatar-hero-wrap" onClick={() => fileRef.current?.click()} title={t('profile.avatar_change')}>
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
          <div className="profile-hero-since">{t('profile.member_since', { date: memberSince })}</div>
        </div>
      </div>

      <div className="page">

        {/* Avatar */}
        <div className="profile-card">
          <div className="profile-card-header">
            <span className="profile-card-icon">📷</span>
            <div>
              <h3>{t('profile.avatar_title')}</h3>
              <p>{t('profile.avatar_hint')}</p>
            </div>
          </div>
          <div className="avatar-editor">
            <div className="avatar-editor-preview" onClick={() => fileRef.current?.click()} title={t('profile.avatar_select')}>
              <Avatar src={avatarPreview} name={user?.name} size={96} className="avatar-editor-img" />
              <div className="avatar-editor-overlay">📷</div>
            </div>
            <div className="avatar-editor-actions">
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
              <button className="btn-primary" onClick={() => fileRef.current?.click()} disabled={avatarSaving}>
                {avatarSaving ? `⏳ ${t('common.saving')}` : `🖼 ${t('profile.avatar_select')}`}
              </button>
              {avatarPreview && !avatarSaving && (
                <button className="btn-ghost" onClick={handleAvatarRemove} disabled={avatarSaving}>
                  🗑 {t('common.remove')}
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
              <h3>{t('profile.edit_title')}</h3>
              <p>{t('profile.edit_subtitle')}</p>
            </div>
          </div>
          <form onSubmit={handleProfileSave}>
            <div className="field">
              <label>{t('auth.name')}</label>
              <input value={profileForm.name} onChange={setP('name')} required minLength={2} maxLength={80} placeholder={t('auth.name')} />
            </div>
            <div className="field">
              <label>{t('auth.home_region')}</label>
              <input value={profileForm.homeRegion} onChange={setP('homeRegion')} maxLength={120} placeholder={t('auth.home_region_placeholder')} />
            </div>
            <div className="field">
              <label>{t('auth.skill_level')}</label>
              <select value={profileForm.skillLevel} onChange={setP('skillLevel')}>
                <option value="beginner">🐣 {t('skill.beginner')}</option>
                <option value="intermediate">🎯 {t('skill.intermediate')}</option>
                <option value="advanced">🏆 {t('skill.advanced')}</option>
              </select>
            </div>
            <div className="field">
              <label>{t('auth.language')}</label>
              <select value={profileForm.language} onChange={setP('language')}>
                <option value="de">🇩🇪 Deutsch</option>
                <option value="en">🇬🇧 English</option>
                <option value="fr">🇫🇷 Français</option>
              </select>
            </div>
            {profileMsg && (
              <div className={profileMsg.type === 'success' ? 'success-msg' : 'error-msg'}>{profileMsg.text}</div>
            )}
            <div className="profile-card-actions">
              <button type="submit" className="btn-primary" disabled={profileSaving}>
                {profileSaving ? `⏳ ${t('common.saving')}` : `💾 ${t('common.save')}`}
              </button>
            </div>
          </form>
        </div>

        {/* Password */}
        <div className="profile-card">
          <div className="profile-card-header">
            <span className="profile-card-icon">🔒</span>
            <div><h3>{t('profile.pw_title')}</h3><p>{t('profile.pw_subtitle')}</p></div>
          </div>
          <form onSubmit={handlePasswordSave}>
            <div className="field">
              <label>{t('profile.pw_current')}</label>
              <input type="password" value={pwForm.currentPassword} onChange={setW('currentPassword')} required placeholder="••••••••" />
            </div>
            <div className="field">
              <label>{t('profile.pw_new')}</label>
              <input type="password" value={pwForm.newPassword} onChange={setW('newPassword')} required minLength={8} placeholder={t('auth.password_placeholder')} />
            </div>
            <div className="field">
              <label>{t('profile.pw_confirm')}</label>
              <input type="password" value={pwForm.confirmPassword} onChange={setW('confirmPassword')} required minLength={8} placeholder={t('profile.pw_repeat')} />
            </div>
            {pwMsg && (
              <div className={pwMsg.type === 'success' ? 'success-msg' : 'error-msg'}>{pwMsg.text}</div>
            )}
            <div className="profile-card-actions">
              <button type="submit" className="btn-primary" disabled={pwSaving}>
                {pwSaving ? `⏳ ${t('common.saving')}` : `🔑 ${t('profile.pw_btn')}`}
              </button>
            </div>
          </form>
        </div>

        {/* Info */}
        <div className="profile-card profile-card-info">
          <div className="profile-card-header">
            <span className="profile-card-icon">ℹ️</span>
            <div><h3>{t('profile.info_title')}</h3><p>{t('profile.info_subtitle')}</p></div>
          </div>
          <div className="profile-info-rows">
            <div className="profile-info-row">
              <span className="pir-label">{t('auth.email')}</span>
              <span className="pir-value">{user?.email}</span>
            </div>
            <div className="profile-info-row">
              <span className="pir-label">{t('profile.user_id')}</span>
              <span className="pir-value pir-mono">{user?.id}</span>
            </div>
            <div className="profile-info-row">
              <span className="pir-label">{t('profile.member_since_label')}</span>
              <span className="pir-value">{memberSince}</span>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="profile-card profile-card-danger">
          <div className="profile-card-header">
            <span className="profile-card-icon">🚪</span>
            <div><h3>{t('profile.logout_title')}</h3><p>{t('profile.logout_subtitle')}</p></div>
          </div>
          <button className="btn-danger" onClick={logout}>🚪 {t('nav.logout')}</button>
        </div>

      </div>
    </div>
  );
}
