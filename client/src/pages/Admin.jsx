import { useEffect, useRef, useState, lazy, Suspense } from 'react';
const RichEditor = lazy(() => import('../components/RichEditor'));
import { api } from '../api/client';
import { useT } from '../context/TranslationContext';
import { toLocaleTag } from '../utils/locale';

export default function Admin() {
  const { t } = useT();
  const [tab, setTab] = useState('reports');

  return (
    <div className="page">
      <div className="admin-header">
        <h1 className="admin-title">🛡 {t('admin.title')}</h1>
        <p className="admin-subtitle">{t('admin.subtitle')}</p>
      </div>

      <div className="community-tabs">
        <button className={`community-tab ${tab === 'reports'      ? 'community-tab-active' : ''}`} onClick={() => setTab('reports')}>
          🚩 {t('admin.tab_reports')}
        </button>
        <button className={`community-tab ${tab === 'users'        ? 'community-tab-active' : ''}`} onClick={() => setTab('users')}>
          👥 {t('admin.tab_users')}
        </button>
        <button className={`community-tab ${tab === 'smtp'         ? 'community-tab-active' : ''}`} onClick={() => setTab('smtp')}>
          📧 {t('admin.tab_smtp')}
        </button>
        <button className={`community-tab ${tab === 'translations' ? 'community-tab-active' : ''}`} onClick={() => setTab('translations')}>
          🌐 {t('admin.tab_translations')}
        </button>
        <button className={`community-tab ${tab === 'emails' ? 'community-tab-active' : ''}`} onClick={() => setTab('emails')}>
          ✉️ {t('admin.tab_emails')}
        </button>
      </div>

      {tab === 'reports'      && <ReportsTab />}
      {tab === 'users'        && <UsersTab />}
      {tab === 'smtp'         && <SmtpTab />}
      {tab === 'translations' && <TranslationsTab />}
      {tab === 'emails'       && <EmailTemplatesTab />}
    </div>
  );
}

// ── Reports Tab ───────────────────────────────────────────────────────────────

function ReportsTab() {
  const { t, locale } = useT();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('open');

  useEffect(() => {
    api.admin.getReports()
      .then((d) => setReports(d.reports))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleResolve(id) {
    try {
      const d = await api.admin.resolveReport(id);
      setReports((prev) => prev.map((r) => r.id === id ? d.report : r));
    } catch (e) { alert(e.message); }
  }

  async function handleDelete(id) {
    if (!window.confirm(t('admin.confirm_delete_report'))) return;
    try {
      await api.admin.deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (e) { alert(e.message); }
  }

  const visible = reports.filter((r) =>
    filter === 'all'  ? true :
    filter === 'open' ? !r.resolved :
                        r.resolved
  );

  if (loading) return <div className="loading">{t('admin.reports_loading')}</div>;

  return (
    <div className="admin-section">
      <div className="admin-filter-row">
        <span className="admin-count">
          {t('admin.reports_count', { open: reports.filter(r => !r.resolved).length, resolved: reports.filter(r => r.resolved).length })}
        </span>
        <div className="admin-filter-btns">
          {[['open', t('admin.filter_open')], ['resolved', t('admin.filter_resolved')], ['all', t('admin.filter_all')]].map(([v, l]) => (
            <button
              key={v}
              className={`admin-filter-btn ${filter === v ? 'admin-filter-btn-active' : ''}`}
              onClick={() => setFilter(v)}
            >{l}</button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="admin-empty">
          {filter === 'open' ? t('admin.no_open_reports') : t('admin.no_entries')}
        </div>
      ) : (
        <div className="admin-cards">
          {visible.map((r) => (
            <div key={r.id} className={`admin-report-card ${r.resolved ? 'admin-report-resolved' : ''}`}>
              <div className="admin-report-meta">
                <span className={`admin-badge ${r.resolved ? 'admin-badge-ok' : 'admin-badge-warn'}`}>
                  {r.resolved ? t('admin.report_resolved') : t('admin.report_open')}
                </span>
                <span className="admin-report-date">
                  {new Date(r.createdAt).toLocaleString(toLocaleTag(locale), { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="admin-report-row">
                <span className="admin-field-label">{t('admin.field_from')}</span>
                <span>{r.senderName} · <a href={`mailto:${r.senderEmail}`} className="app-footer-link">{r.senderEmail}</a></span>
              </div>
              <div className="admin-report-row">
                <span className="admin-field-label">{t('admin.field_against')}</span>
                <span className="admin-report-against">{r.against}</span>
              </div>
              <div className="admin-report-row admin-report-reason-row">
                <span className="admin-field-label">{t('admin.field_reason')}</span>
                <p className="admin-report-reason">{r.reason}</p>
              </div>
              {r.resolvedAt && (
                <div className="admin-report-row">
                  <span className="admin-field-label">{t('admin.field_resolved_at')}</span>
                  <span>{new Date(r.resolvedAt).toLocaleString(toLocaleTag(locale))}</span>
                </div>
              )}

              <div className="admin-report-actions">
                <button
                  className={r.resolved ? 'btn-ghost admin-btn-sm' : 'btn-primary admin-btn-sm'}
                  onClick={() => handleResolve(r.id)}
                >
                  {r.resolved ? t('admin.btn_reopen') : t('admin.btn_mark_resolved')}
                </button>
                <button className="btn-danger admin-btn-sm" onClick={() => handleDelete(r.id)}>
                  🗑 {t('common.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Action Dropdown ───────────────────────────────────────────────────────────

function ActionDropdown({ u, busy, onStatus, onRole, onReset, onDelete }) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState({ top: 0, right: 0 });
  const triggerRef = useRef(null);
  const menuRef    = useRef(null);
  const active = !u.userStatus || u.userStatus.status === 'ACTIVE';

  useEffect(() => {
    if (!open) return;
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, right: window.innerWidth - r.right });
    }
    function onMouseDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target) &&
          triggerRef.current && !triggerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onScroll() { setOpen(false); }
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  function act(fn) { setOpen(false); fn(); }

  return (
    <div className="user-action-menu">
      <button
        ref={triggerRef}
        className="user-action-trigger"
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        aria-label={t('admin.actions_label')}
      >
        {busy ? '…' : '⋯'}
      </button>
      {open && (
        <div ref={menuRef} className="user-action-items" style={{ top: pos.top, right: pos.right }}>
          <button className="user-action-item" onClick={() => act(onStatus)}>
            {active ? t('admin.action_deactivate') : t('admin.action_activate')}
          </button>
          <button className="user-action-item" onClick={() => act(onRole)}>
            {u.role === 'ADMIN' ? t('admin.action_demote') : t('admin.action_promote')}
          </button>
          <button className="user-action-item" onClick={() => act(onReset)}>
            {t('admin.action_reset')}
          </button>
          <div className="user-action-divider" />
          <button className="user-action-item user-action-item--danger" onClick={() => act(onDelete)}>
            {t('admin.action_delete_user')}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────

function UsersTab() {
  const { t, locale } = useT();
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [actionBusy, setActionBusy] = useState(null);
  const [search,     setSearch]     = useState('');

  useEffect(() => {
    api.admin.getUsers()
      .then((d) => setUsers(d.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function isActive(u) {
    return !u.userStatus || u.userStatus.status === 'ACTIVE';
  }

  async function handleStatusToggle(u) {
    const newStatus = isActive(u) ? 'INACTIVE' : 'ACTIVE';
    const confirmMsg = newStatus === 'INACTIVE'
      ? t('admin.confirm_deactivate', { name: u.name })
      : t('admin.confirm_activate', { name: u.name });
    if (!window.confirm(confirmMsg)) return;
    setActionBusy(u.id);
    try {
      await api.admin.setUserStatus(u.id, newStatus);
      setUsers((prev) => prev.map((x) =>
        x.id === u.id ? { ...x, userStatus: { status: newStatus } } : x
      ));
    } catch (e) { alert(e.message); }
    finally { setActionBusy(null); }
  }

  async function handleRoleToggle(u) {
    const newRole = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!window.confirm(t('admin.confirm_role_change', { name: u.name, role: newRole }))) return;
    setActionBusy(u.id);
    try {
      const d = await api.admin.updateUserRole(u.id, newRole);
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, role: d.user.role } : x));
    } catch (e) { alert(e.message); }
    finally { setActionBusy(null); }
  }

  async function handlePasswordReset(u) {
    if (!window.confirm(t('admin.confirm_reset_email', { email: u.email }))) return;
    setActionBusy(u.id);
    try {
      const d = await api.admin.sendPasswordReset(u.id);
      alert(d.message);
    } catch (e) { alert(e.message); }
    finally { setActionBusy(null); }
  }

  async function handleDelete(u) {
    if (!window.confirm(t('admin.confirm_delete_user', { name: u.name }))) return;
    setActionBusy(u.id);
    try {
      await api.admin.deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (e) { alert(e.message); }
    finally { setActionBusy(null); }
  }

  if (loading) return <div className="loading">{t('admin.users_loading')}</div>;

  const q = search.trim().toLowerCase();
  const visible = q
    ? users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    : users;

  return (
    <div className="admin-section">
      <div className="admin-users-toolbar">
        <span className="admin-count">
          {t('admin.users_count', { total: users.length, inactive: users.filter(u => !isActive(u)).length })}
        </span>
        <div className="admin-search-wrap">
          <span className="admin-search-icon">🔍</span>
          <input
            className="admin-search"
            type="search"
            placeholder={t('admin.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('admin.col_name')}</th>
              <th>{t('admin.col_email')}</th>
              <th>{t('admin.col_status')}</th>
              <th>{t('admin.col_role')}</th>
              <th>{t('admin.col_level')}</th>
              <th>{t('admin.col_catches')}</th>
              <th>{t('admin.col_spots')}</th>
              <th>{t('admin.col_since')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={9} className="admin-empty">{t('admin.no_users_found')}</td></tr>
            )}
            {visible.map((u) => {
              const active = isActive(u);
              return (
                <tr key={u.id} className={!active ? 'admin-row-inactive' : ''}>
                  <td data-label={t('admin.col_name')}><strong>{u.name}</strong></td>
                  <td data-label={t('admin.col_email')}><a href={`mailto:${u.email}`} className="app-footer-link">{u.email}</a></td>
                  <td data-label={t('admin.col_status')}>
                    <span className={`admin-badge ${active ? 'admin-badge-ok' : 'admin-badge-warn'}`}>
                      {active ? t('admin.status_active') : t('admin.status_inactive')}
                    </span>
                  </td>
                  <td data-label={t('admin.col_role')}>
                    <span className={`admin-badge ${u.role === 'ADMIN' ? 'admin-badge-admin' : 'admin-badge-user'}`}>
                      {u.role === 'ADMIN' ? `🛡 ${t('admin.role_admin')}` : `👤 ${t('admin.role_user')}`}
                    </span>
                  </td>
                  <td data-label={t('admin.col_level')}>{t(`skill.${u.skillLevel}`)}</td>
                  <td data-label={t('admin.col_catches')}>{u._count.catches}</td>
                  <td data-label={t('admin.col_spots')}>{u._count.spots}</td>
                  <td data-label={t('admin.col_since')}>{new Date(u.createdAt).toLocaleDateString(toLocaleTag(locale))}</td>
                  <td>
                    <ActionDropdown
                      u={u}
                      busy={actionBusy === u.id}
                      onStatus={() => handleStatusToggle(u)}
                      onRole={()    => handleRoleToggle(u)}
                      onReset={()   => handlePasswordReset(u)}
                      onDelete={()  => handleDelete(u)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── SMTP Tab ──────────────────────────────────────────────────────────────────

const MASK = '••••••••';

function SmtpTab() {
  const { t } = useT();
  const empty = { host: '', port: 587, user: '', password: '', fromName: 'AngelMate', fromAddress: '', secure: false };
  const [form,    setForm]    = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [testing, setTesting] = useState(false);
  const [saveMsg, setSaveMsg] = useState(null);
  const [testMsg, setTestMsg] = useState(null);

  useEffect(() => {
    api.admin.getSmtp()
      .then((d) => { if (d.settings) setForm(d.settings); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function set(field) {
    return (e) => {
      setSaveMsg(null);
      const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((f) => {
        const update = { ...f, [field]: val };
        if (field === 'port') {
          const p = parseInt(val);
          if (p === 465) update.secure = true;
          else if (p === 587 || p === 25) update.secure = false;
        }
        return update;
      });
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveMsg(null); setSaving(true);
    try {
      const d = await api.admin.saveSmtp(form);
      setForm(d.settings);
      setSaveMsg({ ok: true, text: t('admin.smtp_saved') });
    } catch (err) {
      setSaveMsg({ ok: false, text: err.message });
    } finally { setSaving(false); }
  }

  async function handleTest() {
    setTestMsg(null); setTesting(true);
    try {
      const d = await api.admin.testSmtp(form);
      setTestMsg({ ok: true, text: d.message });
    } catch (err) {
      setTestMsg({ ok: false, text: err.message });
    } finally { setTesting(false); }
  }

  if (loading) return <div className="loading">{t('admin.smtp_loading')}</div>;

  return (
    <div className="admin-section">
      <div className="smtp-card">
        <h3 className="smtp-title">📧 {t('admin.smtp_title')}</h3>
        <p className="admin-count" style={{ marginBottom: '1.5rem' }}>
          {t('admin.smtp_desc')}
        </p>

        <form onSubmit={handleSubmit} className="smtp-form">
          <div className="smtp-row smtp-row-3">
            <div className="field" style={{ flex: 2 }}>
              <label>{t('admin.smtp_host')}</label>
              <input value={form.host} onChange={set('host')} placeholder="mail.gmx.net" />
            </div>
            <div className="field">
              <label>{t('admin.smtp_port')} <span className="smtp-port-hint">587 STARTTLS · 465 SSL</span></label>
              <input type="number" value={form.port} onChange={set('port')} min={1} max={65535} />
            </div>
            <div className="field smtp-field-ssl">
              <label>{t('admin.smtp_ssl_label')}</label>
              <label className="smtp-checkbox-label">
                <input type="checkbox" checked={form.secure} onChange={set('secure')} />
                {t('admin.smtp_ssl_check')}
              </label>
            </div>
          </div>

          <div className="smtp-row">
            <div className="field">
              <label>{t('admin.smtp_user')}</label>
              <input value={form.user} onChange={set('user')} placeholder="user@example.com" autoComplete="off" />
            </div>
            <div className="field">
              <label>{t('admin.smtp_password')}</label>
              <input
                type="password" value={form.password} onChange={set('password')}
                placeholder={form.password === MASK ? t('admin.smtp_password_set') : t('admin.smtp_password_ph')}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="smtp-row">
            <div className="field">
              <label>{t('admin.smtp_from_name')}</label>
              <input value={form.fromName} onChange={set('fromName')} placeholder="AngelMate" />
            </div>
            <div className="field">
              <label>{t('admin.smtp_from_address')}</label>
              <input type="email" value={form.fromAddress} onChange={set('fromAddress')} placeholder="noreply@example.com" />
            </div>
          </div>

          {saveMsg && (
            <div className={saveMsg.ok ? 'smtp-msg smtp-msg-ok' : 'smtp-msg smtp-msg-err'}>
              {saveMsg.ok ? '✅' : '⚠️'} {saveMsg.text}
            </div>
          )}

          <div className="smtp-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? `⏳ ${t('admin.smtp_saving')}` : `💾 ${t('admin.smtp_save')}`}
            </button>
            <button type="button" className="btn-ghost smtp-test-btn" onClick={handleTest} disabled={testing || saving}>
              {testing ? `⏳ ${t('admin.smtp_testing')}` : `📨 ${t('admin.smtp_test')}`}
            </button>
          </div>

          {testMsg && (
            <div className={testMsg.ok ? 'smtp-msg smtp-msg-ok' : 'smtp-msg smtp-msg-err'}>
              {testMsg.ok ? '✅' : '⚠️'} {testMsg.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// ── Translations Tab ──────────────────────────────────────────────────────────

function TranslationsTab() {
  const { t, refetch } = useT();
  const [data,      setData]      = useState({});
  const [loading,   setLoading]   = useState(true);
  const [nsFilter,  setNsFilter]  = useState('');
  const [editRow,   setEditRow]   = useState(null);
  const [editVals,  setEditVals]  = useState({ de: '', en: '', fr: '' });
  const [savingRow, setSavingRow] = useState(null);
  const [newKey,    setNewKey]    = useState('');
  const [newVals,   setNewVals]   = useState({ de: '', en: '', fr: '' });
  const [adding,    setAdding]    = useState(false);
  const [addError,  setAddError]  = useState('');

  async function load() {
    setLoading(true);
    try {
      const d = await api.admin.getTranslations();
      setData(d.translations ?? {});
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const namespaces = [...new Set(Object.keys(data).map((k) => k.split('.')[0]))].sort();

  const rows = Object.entries(data)
    .filter(([key]) => !nsFilter || key.startsWith(nsFilter + '.'))
    .sort(([a], [b]) => a.localeCompare(b));

  function startEdit(key, vals) {
    setEditRow(key);
    setEditVals({ de: vals.de ?? '', en: vals.en ?? '', fr: vals.fr ?? '' });
  }

  function cancelEdit() {
    setEditRow(null);
    setEditVals({ de: '', en: '', fr: '' });
  }

  async function saveRow(key) {
    setSavingRow(key);
    try {
      await api.admin.upsertTranslation({ key, translations: editVals });
      setData((prev) => ({ ...prev, [key]: { ...editVals } }));
      setEditRow(null);
      refetch();
    } catch (e) { alert(e.message); }
    finally { setSavingRow(null); }
  }

  async function deleteRow(key) {
    if (!window.confirm(t('admin.trans_confirm_delete', { key }))) return;
    try {
      await api.admin.deleteTranslation(key);
      setData((prev) => { const n = { ...prev }; delete n[key]; return n; });
      if (editRow === key) cancelEdit();
      refetch();
    } catch (e) { alert(e.message); }
  }

  async function handleAdd(e) {
    e.preventDefault();
    const k = newKey.trim();
    if (!k) return;
    if (data[k] !== undefined) { setAddError(t('admin.trans_key_exists')); return; }
    setAdding(true);
    setAddError('');
    try {
      await api.admin.upsertTranslation({ key: k, translations: newVals });
      setData((prev) => ({ ...prev, [k]: { ...newVals } }));
      setNewKey('');
      setNewVals({ de: '', en: '', fr: '' });
      refetch();
    } catch (e) { setAddError(e.message); }
    finally { setAdding(false); }
  }

  if (loading) return <div className="loading">{t('admin.trans_loading')}</div>;

  return (
    <div className="admin-section">

      {/* Add new key */}
      <form onSubmit={handleAdd} className="trans-add-form">
        <h4 className="trans-add-title">➕ {t('admin.trans_new_key')}</h4>
        <div className="trans-add-row">
          <input
            className="trans-add-key"
            value={newKey}
            onChange={(e) => { setNewKey(e.target.value); setAddError(''); }}
            placeholder="nav.example_key"
            required
          />
          <input className="trans-add-val" value={newVals.de} onChange={(e) => setNewVals((v) => ({ ...v, de: e.target.value }))} placeholder="🇩🇪 DE" />
          <input className="trans-add-val" value={newVals.en} onChange={(e) => setNewVals((v) => ({ ...v, en: e.target.value }))} placeholder="🇬🇧 EN" />
          <input className="trans-add-val" value={newVals.fr} onChange={(e) => setNewVals((v) => ({ ...v, fr: e.target.value }))} placeholder="🇫🇷 FR" />
          <button type="submit" className="btn-primary admin-btn-sm" disabled={adding}>
            {adding ? `⏳ ${t('common.saving')}` : `➕ ${t('common.add')}`}
          </button>
        </div>
        {addError && <div className="error-msg" style={{ marginTop: '0.5rem' }}>⚠️ {addError}</div>}
      </form>

      {/* Namespace filter */}
      <div className="trans-filter-row">
        <select className="trans-ns-select" value={nsFilter} onChange={(e) => setNsFilter(e.target.value)}>
          <option value="">{t('admin.trans_all_ns')}</option>
          {namespaces.map((ns) => <option key={ns} value={ns}>{ns}.*</option>)}
        </select>
        <span className="admin-count">{rows.length} {t('admin.trans_keys_count')}</span>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table trans-table">
          <thead>
            <tr>
              <th>{t('admin.trans_col_key')}</th>
              <th>🇩🇪 {t('admin.trans_col_de')}</th>
              <th>🇬🇧 {t('admin.trans_col_en')}</th>
              <th>🇫🇷 {t('admin.trans_col_fr')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5} className="admin-empty">{t('admin.trans_no_results')}</td></tr>
            )}
            {rows.map(([key, vals]) => {
              const isEditing = editRow === key;
              const isSaving  = savingRow === key;
              return (
                <tr key={key} className={isEditing ? 'trans-row-editing' : ''}>
                  <td className="trans-key-cell">
                    <code className="trans-key">{key}</code>
                  </td>
                  {isEditing ? (
                    <>
                      <td><textarea className="trans-cell-input" value={editVals.de} onChange={(e) => setEditVals((v) => ({ ...v, de: e.target.value }))} rows={2} /></td>
                      <td><textarea className="trans-cell-input" value={editVals.en} onChange={(e) => setEditVals((v) => ({ ...v, en: e.target.value }))} rows={2} /></td>
                      <td><textarea className="trans-cell-input" value={editVals.fr} onChange={(e) => setEditVals((v) => ({ ...v, fr: e.target.value }))} rows={2} /></td>
                    </>
                  ) : (
                    <>
                      <td className="trans-val-cell" onClick={() => startEdit(key, vals)}>{vals.de ?? ''}</td>
                      <td className="trans-val-cell" onClick={() => startEdit(key, vals)}>{vals.en ?? ''}</td>
                      <td className="trans-val-cell" onClick={() => startEdit(key, vals)}>{vals.fr ?? ''}</td>
                    </>
                  )}
                  <td className="trans-actions-cell">
                    {isEditing ? (
                      <div className="trans-row-btns">
                        <button className="btn-primary admin-btn-sm" onClick={() => saveRow(key)} disabled={isSaving}>
                          {isSaving ? '⏳' : '💾'}
                        </button>
                        <button className="btn-ghost admin-btn-sm" onClick={cancelEdit}>✕</button>
                      </div>
                    ) : (
                      <div className="trans-row-btns">
                        <button className="btn-ghost admin-btn-sm" onClick={() => startEdit(key, vals)} title={t('common.edit')}>✏️</button>
                        <button className="btn-danger-ghost admin-btn-sm" onClick={() => deleteRow(key)} title={t('common.delete')}>🗑</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Email Templates Tab ───────────────────────────────────────────────────────

const TEMPLATE_META = {
  email_verification: { label: '✅ E-Mail-Bestätigung', vars: ['{{name}}', '{{verifyLink}}'] },
  password_reset:     { label: '🔑 Passwort zurücksetzen', vars: ['{{name}}', '{{resetLink}}'] },
};

function EmailTemplatesTab() {
  const { t } = useT();
  const [templates, setTemplates] = useState({});
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [locale,    setLocale]    = useState('de');
  const [form,      setForm]      = useState({ subject: '', body: '' });
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState(null);

  useEffect(() => {
    api.admin.getEmailTemplates()
      .then((d) => setTemplates(d.templates))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function openTemplate(name) {
    setSelected(name);
    setLocale('de');
    const tpl = templates[name]?.de ?? { subject: '', body: '' };
    setForm({ subject: tpl.subject, body: tpl.body });
    setMsg(null);
  }

  function switchLocale(l) {
    setLocale(l);
    const tpl = templates[selected]?.[l] ?? { subject: '', body: '' };
    setForm({ subject: tpl.subject, body: tpl.body });
    setMsg(null);
  }

  async function handleSave() {
    if (!form.subject.trim()) { setMsg({ type: 'error', text: t('admin.etpl_subject_required') }); return; }
    setSaving(true);
    setMsg(null);
    try {
      await api.admin.upsertEmailTemplate({ name: selected, locale, subject: form.subject, body: form.body });
      setTemplates((prev) => ({
        ...prev,
        [selected]: { ...prev[selected], [locale]: { subject: form.subject, body: form.body } }
      }));
      setMsg({ type: 'success', text: `✅ ${t('admin.etpl_saved')}` });
    } catch (e) {
      setMsg({ type: 'error', text: `⚠️ ${e.message}` });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="loading">{t('common.loading')}</div>;

  const allNames = Array.from(new Set([...Object.keys(TEMPLATE_META), ...Object.keys(templates)]));

  return (
    <div className="admin-section etpl-layout">
      <div className="etpl-sidebar">
        <h3 className="etpl-sidebar-title">{t('admin.etpl_list_title')}</h3>
        {allNames.map((name) => {
          const meta = TEMPLATE_META[name];
          const hasAll = ['de','en','fr'].every((l) => templates[name]?.[l]?.subject);
          return (
            <button
              key={name}
              className={`etpl-item${selected === name ? ' etpl-item-active' : ''}`}
              onClick={() => openTemplate(name)}
            >
              <span className="etpl-item-label">{meta?.label ?? name}</span>
              <span className={`etpl-badge ${hasAll ? 'etpl-badge-ok' : 'etpl-badge-warn'}`}>
                {hasAll ? '✓ 3×' : '⚠'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="etpl-editor">
        {!selected ? (
          <div className="etpl-placeholder">{t('admin.etpl_select_hint')}</div>
        ) : (
          <>
            <div className="etpl-editor-header">
              <h3 className="etpl-editor-title">{TEMPLATE_META[selected]?.label ?? selected}</h3>
              {TEMPLATE_META[selected]?.vars && (
                <div className="etpl-vars">
                  <span className="etpl-vars-label">{t('admin.etpl_vars_label')}</span>
                  {TEMPLATE_META[selected].vars.map((v) => (
                    <code key={v} className="etpl-var">{v}</code>
                  ))}
                </div>
              )}
            </div>

            <div className="etpl-locale-tabs">
              {[['de','🇩🇪 DE'],['en','🇬🇧 EN'],['fr','🇫🇷 FR']].map(([l, label]) => (
                <button
                  key={l}
                  className={`etpl-locale-tab${locale === l ? ' etpl-locale-tab-active' : ''}`}
                  onClick={() => switchLocale(l)}
                >
                  {label}
                  {templates[selected]?.[l]?.subject && <span className="etpl-locale-dot" />}
                </button>
              ))}
            </div>

            <div className="field etpl-subject-field">
              <label>{t('admin.etpl_subject')}</label>
              <input
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                placeholder={t('admin.etpl_subject_ph')}
              />
            </div>

            <div className="etpl-body-label">{t('admin.etpl_body')}</div>
            <div className="etpl-quill-wrap">
              <Suspense fallback={<div className="loading">{t('common.loading')}</div>}>
                <RichEditor
                  key={`${selected}-${locale}`}
                  value={form.body}
                  onChange={(html) => setForm((f) => ({ ...f, body: html }))}
                  placeholder={t('admin.etpl_body_ph')}
                />
              </Suspense>
            </div>

            {msg && (
              <div className={msg.type === 'success' ? 'success-msg' : 'error-msg'} style={{ marginTop: '0.75rem' }}>
                {msg.text}
              </div>
            )}
            <div className="etpl-save-row">
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? `⏳ ${t('common.saving')}` : `💾 ${t('common.save')}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
