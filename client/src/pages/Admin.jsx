import { useEffect, useRef, useState } from 'react';
import { api } from '../api/client';

export default function Admin() {
  const [tab, setTab] = useState('reports');

  return (
    <div className="page">
      <div className="admin-header">
        <h1 className="admin-title">🛡 Admin-Bereich</h1>
        <p className="admin-subtitle">Meldungen und Nutzerverwaltung</p>
      </div>

      <div className="community-tabs">
        <button className={`community-tab ${tab === 'reports' ? 'community-tab-active' : ''}`} onClick={() => setTab('reports')}>
          🚩 Meldungen
        </button>
        <button className={`community-tab ${tab === 'users' ? 'community-tab-active' : ''}`} onClick={() => setTab('users')}>
          👥 Nutzer
        </button>
        <button className={`community-tab ${tab === 'smtp' ? 'community-tab-active' : ''}`} onClick={() => setTab('smtp')}>
          📧 E-Mail
        </button>
      </div>

      {tab === 'reports' && <ReportsTab />}
      {tab === 'users'   && <UsersTab />}
      {tab === 'smtp'    && <SmtpTab />}
    </div>
  );
}

// ── Reports Tab ───────────────────────────────────────────────────────────────

function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('open'); // 'open' | 'resolved' | 'all'

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
    if (!window.confirm('Meldung wirklich löschen?')) return;
    try {
      await api.admin.deleteReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (e) { alert(e.message); }
  }

  const visible = reports.filter((r) =>
    filter === 'all'      ? true :
    filter === 'open'     ? !r.resolved :
    /* resolved */          r.resolved
  );

  if (loading) return <div className="loading">Lade Meldungen…</div>;

  return (
    <div className="admin-section">
      <div className="admin-filter-row">
        <span className="admin-count">{reports.filter(r => !r.resolved).length} offen · {reports.filter(r => r.resolved).length} erledigt</span>
        <div className="admin-filter-btns">
          {[['open','Offen'],['resolved','Erledigt'],['all','Alle']].map(([v,l]) => (
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
          {filter === 'open' ? '✅ Keine offenen Meldungen.' : 'Keine Einträge.'}
        </div>
      ) : (
        <div className="admin-cards">
          {visible.map((r) => (
            <div key={r.id} className={`admin-report-card ${r.resolved ? 'admin-report-resolved' : ''}`}>
              <div className="admin-report-meta">
                <span className={`admin-badge ${r.resolved ? 'admin-badge-ok' : 'admin-badge-warn'}`}>
                  {r.resolved ? '✅ Erledigt' : '🔴 Offen'}
                </span>
                <span className="admin-report-date">
                  {new Date(r.createdAt).toLocaleString('de-DE', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                </span>
              </div>

              <div className="admin-report-row">
                <span className="admin-field-label">Von</span>
                <span>{r.senderName} · <a href={`mailto:${r.senderEmail}`} className="app-footer-link">{r.senderEmail}</a></span>
              </div>
              <div className="admin-report-row">
                <span className="admin-field-label">Gegen</span>
                <span className="admin-report-against">{r.against}</span>
              </div>
              <div className="admin-report-row admin-report-reason-row">
                <span className="admin-field-label">Begründung</span>
                <p className="admin-report-reason">{r.reason}</p>
              </div>
              {r.resolvedAt && (
                <div className="admin-report-row">
                  <span className="admin-field-label">Erledigt am</span>
                  <span>{new Date(r.resolvedAt).toLocaleString('de-DE')}</span>
                </div>
              )}

              <div className="admin-report-actions">
                <button
                  className={r.resolved ? 'btn-ghost admin-btn-sm' : 'btn-primary admin-btn-sm'}
                  onClick={() => handleResolve(r.id)}
                >
                  {r.resolved ? '↩ Wieder öffnen' : '✅ Als erledigt markieren'}
                </button>
                <button className="btn-danger admin-btn-sm" onClick={() => handleDelete(r.id)}>
                  🗑 Löschen
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
  const [open, setOpen] = useState(false);
  const [pos,  setPos]  = useState({ top: 0, right: 0 });
  const triggerRef = useRef(null);
  const menuRef    = useRef(null);
  const active = !u.userStatus || u.userStatus.status === 'ACTIVE';

  useEffect(() => {
    if (!open) return;

    // Position the fixed menu relative to the trigger button
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
    // Close on any scroll so the menu doesn't float away from its trigger
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
        aria-label="Aktionen"
      >
        {busy ? '…' : '⋯'}
      </button>
      {open && (
        <div
          ref={menuRef}
          className="user-action-items"
          style={{ top: pos.top, right: pos.right }}
        >
          <button className="user-action-item" onClick={() => act(onStatus)}>
            {active ? '🔴 Konto sperren' : '✅ Konto aktivieren'}
          </button>
          <button className="user-action-item" onClick={() => act(onRole)}>
            {u.role === 'ADMIN' ? '👤 Zu User degradieren' : '🛡 Zu Admin befördern'}
          </button>
          <button className="user-action-item" onClick={() => act(onReset)}>
            📧 Passwort-Reset senden
          </button>
          <div className="user-action-divider" />
          <button className="user-action-item user-action-item--danger" onClick={() => act(onDelete)}>
            🗑 Nutzer löschen
          </button>
        </div>
      )}
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────

function UsersTab() {
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
    const label     = newStatus === 'INACTIVE' ? 'deaktivieren' : 'aktivieren';
    if (!window.confirm(`Konto von "${u.name}" wirklich ${label}?`)) return;
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
    const label   = newRole === 'ADMIN' ? 'Admin' : 'User';
    if (!window.confirm(`Rolle von "${u.name}" auf ${label} ändern?`)) return;
    setActionBusy(u.id);
    try {
      const d = await api.admin.updateUserRole(u.id, newRole);
      setUsers((prev) => prev.map((x) => x.id === u.id ? { ...x, role: d.user.role } : x));
    } catch (e) { alert(e.message); }
    finally { setActionBusy(null); }
  }

  async function handlePasswordReset(u) {
    if (!window.confirm(`Reset-E-Mail an "${u.email}" senden?`)) return;
    setActionBusy(u.id);
    try {
      const d = await api.admin.sendPasswordReset(u.id);
      alert(d.message);
    } catch (e) { alert(e.message); }
    finally { setActionBusy(null); }
  }

  async function handleDelete(u) {
    if (!window.confirm(`Nutzer "${u.name}" wirklich löschen?\n\nAlle Fänge, Spots und Kommentare werden unwiderruflich entfernt.`)) return;
    setActionBusy(u.id);
    try {
      await api.admin.deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (e) { alert(e.message); }
    finally { setActionBusy(null); }
  }

  if (loading) return <div className="loading">Lade Nutzer…</div>;

  const SKILL = { beginner: '🐣 Anfänger', intermediate: '🎯 Fortgeschritten', advanced: '🏆 Profi' };

  const q = search.trim().toLowerCase();
  const visible = q
    ? users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    : users;

  return (
    <div className="admin-section">
      <div className="admin-users-toolbar">
        <span className="admin-count">
          {users.length} Nutzer · {users.filter(u => !isActive(u)).length} deaktiviert
        </span>
        <div className="admin-search-wrap">
          <span className="admin-search-icon">🔍</span>
          <input
            className="admin-search"
            type="search"
            placeholder="Name oder E-Mail suchen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>E-Mail</th>
              <th>Status</th>
              <th>Rolle</th>
              <th>Level</th>
              <th>Fänge</th>
              <th>Spots</th>
              <th>Dabei seit</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={9} className="admin-empty">Keine Nutzer gefunden.</td></tr>
            )}
            {visible.map((u) => {
              const active = isActive(u);
              return (
                <tr key={u.id} className={!active ? 'admin-row-inactive' : ''}>
                  <td data-label="Name"><strong>{u.name}</strong></td>
                  <td data-label="E-Mail"><a href={`mailto:${u.email}`} className="app-footer-link">{u.email}</a></td>
                  <td data-label="Status">
                    <span className={`admin-badge ${active ? 'admin-badge-ok' : 'admin-badge-warn'}`}>
                      {active ? '✅ Aktiv' : '🔴 Inaktiv'}
                    </span>
                  </td>
                  <td data-label="Rolle">
                    <span className={`admin-badge ${u.role === 'ADMIN' ? 'admin-badge-admin' : 'admin-badge-user'}`}>
                      {u.role === 'ADMIN' ? '🛡 Admin' : '👤 User'}
                    </span>
                  </td>
                  <td data-label="Level">{SKILL[u.skillLevel] ?? u.skillLevel}</td>
                  <td data-label="Fänge">{u._count.catches}</td>
                  <td data-label="Spots">{u._count.spots}</td>
                  <td data-label="Dabei seit">{new Date(u.createdAt).toLocaleDateString('de-DE')}</td>
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
  const empty = { host: '', port: 587, user: '', password: '', fromName: 'AngelMate', fromAddress: '', secure: false };
  const [form,    setForm]    = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.admin.getSmtp()
      .then((d) => { if (d.settings) setForm(d.settings); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function set(field) {
    return (e) => {
      setSaved(false);
      const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm((f) => ({ ...f, [field]: val }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const d = await api.admin.saveSmtp(form);
      setForm(d.settings);
      setSaved(true);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="loading">Lade SMTP-Einstellungen…</div>;

  return (
    <div className="admin-section">
      <div className="smtp-card">
        <h3 className="smtp-title">📧 E-Mail / SMTP Konfiguration</h3>
        <p className="admin-count" style={{ marginBottom: '1.5rem' }}>
          Diese Einstellungen werden für den Versand von Passwort-Reset-E-Mails verwendet.
        </p>

        <form onSubmit={handleSubmit} className="smtp-form">
          <div className="smtp-row">
            <div className="field">
              <label>SMTP Host</label>
              <input value={form.host} onChange={set('host')} placeholder="mail.gmx.net" />
            </div>
            <div className="field smtp-field-port">
              <label>Port</label>
              <input type="number" value={form.port} onChange={set('port')} min={1} max={65535} />
            </div>
          </div>

          <div className="smtp-row">
            <div className="field">
              <label>Benutzername</label>
              <input value={form.user} onChange={set('user')} placeholder="user@example.com" autoComplete="off" />
            </div>
            <div className="field">
              <label>Passwort</label>
              <input
                type="password" value={form.password} onChange={set('password')}
                placeholder={form.password === MASK ? 'gesetzt (leer lassen zum Beibehalten)' : 'SMTP-Passwort'}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="smtp-row">
            <div className="field">
              <label>Absender-Name</label>
              <input value={form.fromName} onChange={set('fromName')} placeholder="AngelMate" />
            </div>
            <div className="field">
              <label>Absender-Adresse</label>
              <input type="email" value={form.fromAddress} onChange={set('fromAddress')} placeholder="noreply@example.com" />
            </div>
          </div>

          <label className="smtp-checkbox-label">
            <input type="checkbox" checked={form.secure} onChange={set('secure')} />
            SSL/TLS verwenden (Port 465)
          </label>

          {error  && <div className="error-msg">⚠️ {error}</div>}
          {saved  && <div className="smtp-saved">✅ Einstellungen gespeichert.</div>}

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? '⏳ Speichern…' : '💾 Einstellungen speichern'}
          </button>
        </form>
      </div>
    </div>
  );
}
