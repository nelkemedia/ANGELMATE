import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import PhotoLightbox from '../components/PhotoLightbox';

const SKILL_EMOJI = { beginner: '🐣', intermediate: '🎯', advanced: '🏆' };
const SKILL_LABEL = { beginner: 'Anfänger', intermediate: 'Fortgeschritten', advanced: 'Profi' };
const MEDAL = ['🥇', '🥈', '🥉'];

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Community() {
  const [tab, setTab] = useState('feed');

  return (
    <div>
      <div className="section-photo-banner section-photo-banner--community">
        <div className="section-photo-banner-text">
          <h2>🌍 Community</h2>
          <p>Fänge teilen · abstimmen · messen</p>
        </div>
      </div>

      <div className="page">
        <div className="community-tabs">
          <button className={`community-tab ${tab === 'feed' ? 'active' : ''}`} onClick={() => setTab('feed')}>
            📰 Feed
          </button>
          <button className={`community-tab ${tab === 'leaderboard' ? 'active' : ''}`} onClick={() => setTab('leaderboard')}>
            🏆 Rangliste
          </button>
          <button className={`community-tab ${tab === 'cotw' ? 'active' : ''}`} onClick={() => setTab('cotw')}>
            ⭐ Fang der Woche
          </button>
        </div>

        {tab === 'feed'        && <FeedTab />}
        {tab === 'leaderboard' && <LeaderboardTab />}
        {tab === 'cotw'        && <CotwTab />}
      </div>
    </div>
  );
}

// ─── Feed tab ─────────────────────────────────────────────────────────────────
function FeedTab() {
  const { user } = useAuth();
  const [items, setItems]     = useState([]);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  async function load(p = 1) {
    setLoading(true);
    try {
      const data = await api.community.feed(p);
      setItems(p === 1 ? data.items : (prev) => [...prev, ...data.items]);
      setPage(data.page);
      setPages(data.pages);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(1); }, []);

  function handleLike(id, likedByMe, likeCount) {
    setItems((prev) => prev.map((c) =>
      c.id === id ? { ...c, likedByMe: !likedByMe, likeCount: likedByMe ? likeCount - 1 : likeCount + 1 } : c
    ));
    api.community.toggleLike(id).catch(() => {
      setItems((prev) => prev.map((c) => c.id === id ? { ...c, likedByMe, likeCount } : c));
    });
  }

  return (
    <>
      <div className="community-header">
        <p className="page-desc" style={{ margin: 0 }}>
          Alle öffentlichen Fänge der AngelMate-Community. Teile deinen eigenen Fang im{' '}
          <Link to="/catches">Fangbuch</Link> mit dem Schalter „Öffentlich sichtbar".
        </p>
      </div>

      {error && <div className="error-msg">⚠️ {error}</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🌍</div>
          <p>Noch keine öffentlichen Fänge. Sei der Erste!</p>
          <Link to="/catches" className="btn-primary">🎣 Fang teilen</Link>
        </div>
      )}

      <div className="feed">
        {items.map((c) => (
          <FeedCard
            key={c.id}
            catch_={c}
            currentUserId={user?.id}
            currentUser={user}
            onLike={handleLike}
            onCommentCountChange={(id, delta) =>
              setItems((prev) => prev.map((x) => x.id === id ? { ...x, commentCount: x.commentCount + delta } : x))
            }
          />
        ))}
      </div>

      {loading && <div className="loading">🌍 Lade Feed…</div>}

      {!loading && page < pages && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button className="btn-ghost" onClick={() => load(page + 1)}>Mehr laden…</button>
        </div>
      )}
    </>
  );
}

// ─── Leaderboard tab ──────────────────────────────────────────────────────────
function LeaderboardTab() {
  const { user } = useAuth();
  const [scope,  setScope]   = useState('national');
  const [metric, setMetric]  = useState('catches');
  const [items,  setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,  setError]   = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api.leaderboard.get(scope, metric);
      setItems(data.items);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [scope, metric]);

  const metricLabels = { catches: '🎣 Fänge', weight: '⚖️ Gesamtgewicht', record: '🐋 Rekordfang' };

  return (
    <div className="lb-container">
      <div className="lb-controls">
        <div className="lb-scope-btns">
          <button
            className={`lb-scope-btn ${scope === 'national' ? 'active' : ''}`}
            onClick={() => setScope('national')}
          >🌍 National</button>
          <button
            className={`lb-scope-btn ${scope === 'local' ? 'active' : ''}`}
            onClick={() => setScope('local')}
            title={user?.homeRegion ? `Region: ${user.homeRegion}` : 'Kein Heimatrevier im Profil'}
          >
            📍 Lokal {user?.homeRegion ? `(${user.homeRegion})` : ''}
          </button>
        </div>
        <div className="lb-metric-select">
          {Object.entries(metricLabels).map(([key, label]) => (
            <button
              key={key}
              className={`lb-metric-btn ${metric === key ? 'active' : ''}`}
              onClick={() => setMetric(key)}
            >{label}</button>
          ))}
        </div>
      </div>

      {error && <div className="error-msg">⚠️ {error}</div>}
      {loading && <div className="loading">🏆 Lade Rangliste…</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <p>{scope === 'local' && !user?.homeRegion
            ? 'Lege zuerst dein Heimatrevier im Profil fest.'
            : 'Noch keine Einträge für diesen Bereich.'}
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="lb-list">
          {items.map((u, i) => (
            <div key={u.id} className={`lb-row ${u.id === user?.id ? 'lb-row-me' : ''}`}>
              <div className="lb-rank">
                {i < 3 ? <span className="lb-medal">{MEDAL[i]}</span> : <span className="lb-rank-num">{i + 1}</span>}
              </div>
              <Avatar src={u.avatarBase64} name={u.name} size={42} className="lb-avatar" />
              <div className="lb-info">
                <span className="lb-name">
                  {u.name} {u.id === user?.id && <span className="lb-you-badge">Du</span>}
                </span>
                <span className="lb-meta">
                  {SKILL_EMOJI[u.skillLevel]} {SKILL_LABEL[u.skillLevel]}
                  {u.homeRegion && ` · 📍 ${u.homeRegion}`}
                </span>
              </div>
              <div className="lb-score">{u.scoreLabel}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Catch of the Week tab ────────────────────────────────────────────────────
function CotwTab() {
  const { user } = useAuth();
  const [data, setData]       = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting]   = useState(null);
  const [error, setError]     = useState('');

  async function load() {
    setLoading(true);
    try {
      const [cotw, hist] = await Promise.all([api.cotw.current(), api.cotw.history()]);
      setData(cotw);
      setHistory(hist.history);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleVote(catchId) {
    if (!user) return;
    setVoting(catchId);
    try {
      const result = await api.cotw.vote(catchId);
      setData((prev) => {
        const prevVotedId = prev.myVotedCatchId;
        const nominees = prev.nominees.map((c) => {
          let v = c.weekVotes;
          if (c.id === prevVotedId && prevVotedId !== catchId) v = Math.max(0, v - 1);
          if (c.id === catchId) v = result.voted ? v + 1 : Math.max(0, v - 1);
          return { ...c, weekVotes: v };
        }).sort((a, b) => b.weekVotes - a.weekVotes);
        return {
          ...prev,
          nominees,
          myVotedCatchId: result.voted ? catchId : null,
          totalVotes: prev.totalVotes + (result.voted ? 1 : -1)
        };
      });
    } catch { /* ignore */ }
    finally { setVoting(null); }
  }

  const leader = data?.nominees?.[0];
  const formatWeek = (w) => {
    if (!w) return '';
    const [yr, wPart] = w.split('-W');
    return `KW ${parseInt(wPart)} / ${yr}`;
  };

  return (
    <div className="cotw-container">
      <div className="cotw-header">
        <div className="cotw-header-text">
          <h3>⭐ Fang der Woche</h3>
          <p>Stimme für den besten öffentlichen Fang ab — ein Vote pro Woche.</p>
          {data && <span className="cotw-week-badge">{formatWeek(data.week)} · {data.totalVotes} Votes gesamt</span>}
        </div>
      </div>

      {error  && <div className="error-msg">⚠️ {error}</div>}
      {loading && <div className="loading">⭐ Lade Abstimmung…</div>}

      {!loading && data && (
        <>
          {/* Leader podium */}
          {leader && leader.weekVotes > 0 && (
            <div className="cotw-leader">
              <div className="cotw-leader-crown">👑 Aktuell führend</div>
              <CotwCard
                catch_={leader}
                myVotedCatchId={data.myVotedCatchId}
                onVote={handleVote}
                voting={voting}
                isLeader
                user={user}
              />
            </div>
          )}

          {/* Nomination list */}
          <div className="cotw-nominees">
            <h4 className="cotw-nominees-title">Alle Nominierungen</h4>
            {data.nominees.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">⭐</div>
                <p>Noch keine öffentlichen Fänge zum Abstimmen.</p>
                <Link to="/catches" className="btn-primary">🎣 Fang teilen</Link>
              </div>
            )}
            <div className="cotw-list">
              {data.nominees.map((c, i) => (
                <CotwCard
                  key={c.id}
                  catch_={c}
                  rank={i + 1}
                  myVotedCatchId={data.myVotedCatchId}
                  onVote={handleVote}
                  voting={voting}
                  user={user}
                />
              ))}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div className="cotw-history">
              <h4 className="cotw-nominees-title">🏅 Frühere Gewinner</h4>
              <div className="cotw-history-list">
                {history.map((h) => (
                  <div key={h.week} className="cotw-history-row">
                    <span className="cotw-history-week">{formatWeek(h.week)}</span>
                    <span className="cotw-history-winner">
                      🥇 {h.winner.fishSpecies} – {h.winner.user?.name}
                    </span>
                    <span className="cotw-history-votes">{h.winner.weekVotes} Votes</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── COTW card component ──────────────────────────────────────────────────────
function CotwCard({ catch_: c, rank, myVotedCatchId, onVote, voting, isLeader, user }) {
  const voted = myVotedCatchId === c.id;
  const isMe  = c.user?.id === user?.id;

  return (
    <div className={`cotw-card ${voted ? 'cotw-card-voted' : ''} ${isLeader ? 'cotw-card-leader' : ''}`}>
      {rank && <div className="cotw-card-rank">#{rank}</div>}
      <div className="cotw-card-body">
        <div className="feed-card-header" style={{ marginBottom: '0.5rem' }}>
          <Avatar src={c.user?.avatarBase64} name={c.user?.name} size={36} className="feed-avatar" />
          <div className="feed-user-info">
            <span className="feed-user-name">
              {c.user?.name} <span className="feed-skill">{SKILL_EMOJI[c.user?.skillLevel]}</span>
            </span>
            {c.user?.homeRegion && <span className="feed-region">📍 {c.user.homeRegion}</span>}
          </div>
        </div>
        <div className="feed-fish-name">🐟 {c.fishSpecies}</div>
        <div className="feed-meta-row">
          <span>📍 {c.waterName}</span>
          {c.weight && <span>⚖️ {c.weight} kg</span>}
          {c.length && <span>📏 {c.length} cm</span>}
        </div>
        {c.notes && <div className="feed-notes" style={{ marginTop: '0.4rem' }}>💬 {c.notes}</div>}
      </div>

      <div className="cotw-card-vote">
        <div className="cotw-vote-count">
          <span className="cotw-vote-num">{c.weekVotes}</span>
          <span className="cotw-vote-label">Votes</span>
        </div>
        {user && !isMe && (
          <button
            className={`cotw-vote-btn ${voted ? 'cotw-vote-btn-active' : ''}`}
            onClick={() => onVote(c.id)}
            disabled={voting !== null}
          >
            {voting === c.id ? '⏳' : voted ? '⭐ Gewählt' : '☆ Wählen'}
          </button>
        )}
        {!user && <span className="cotw-login-hint">Einloggen zum Abstimmen</span>}
        {isMe  && <span className="cotw-login-hint">Dein Fang</span>}
      </div>
    </div>
  );
}

// ─── Feed card (unchanged from before) ───────────────────────────────────────
function FeedCard({ catch_: c, currentUserId, currentUser, onLike, onCommentCountChange }) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments]         = useState(null);
  const [commLoading, setCommLoading]   = useState(false);
  const [text, setText]                 = useState('');
  const [posting, setPosting]           = useState(false);
  const [lightboxSrc, setLightboxSrc]   = useState(null);
  const inputRef = useRef(null);

  async function openComments() {
    setCommentsOpen((o) => !o);
    if (comments !== null) return;
    setCommLoading(true);
    try {
      const data = await api.community.getComments(c.id);
      setComments(data.items);
    } catch { setComments([]); }
    finally { setCommLoading(false); }
  }

  async function handlePost(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      const comment = await api.community.addComment(c.id, text.trim());
      setComments((prev) => [...(prev ?? []), comment]);
      onCommentCountChange(c.id, +1);
      setText('');
    } catch { /* ignore */ }
    finally { setPosting(false); }
  }

  async function handleDeleteComment(commentId) {
    await api.community.deleteComment(commentId);
    setComments((prev) => prev.filter((x) => x.id !== commentId));
    onCommentCountChange(c.id, -1);
  }

  const isOwner = c.user?.id === currentUserId;

  return (
    <div className="feed-card">
      <div className="feed-card-header">
        <Avatar src={c.user?.avatarBase64} name={c.user?.name} size={36} className="feed-avatar" />
        <div className="feed-user-info">
          <span className="feed-user-name">
            {c.user?.name} {' '}<span className="feed-skill">{SKILL_EMOJI[c.user?.skillLevel]}</span>
          </span>
          {c.user?.homeRegion && <span className="feed-region">📍 {c.user.homeRegion}</span>}
        </div>
        <span className="feed-date">
          {new Date(c.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {c.imageUrl && (
        <div className="catch-card-photo-wrap" onClick={() => setLightboxSrc(c.imageUrl)}>
          <img src={c.imageUrl} alt={c.fishSpecies} className="catch-card-photo" />
          <div className="catch-card-photo-hint">🔍</div>
        </div>
      )}

      <div className="feed-card-body">
        <div className="feed-fish-name">🐟 {c.fishSpecies}</div>
        <div className="feed-meta-row">
          <span>📍 {c.waterName}</span>
          <span>📅 {new Date(c.caughtAt).toLocaleDateString('de-DE')}</span>
          {c.weight && <span>⚖️ {c.weight} kg</span>}
          {c.length && <span>📏 {c.length} cm</span>}
        </div>
        {c.bait && <div className="feed-detail">🪱 {c.bait}{c.technique ? ` · 🎯 ${c.technique}` : ''}</div>}
        {c.notes && <div className="feed-notes">💬 {c.notes}</div>}
      </div>

      <div className="feed-card-actions">
        <button
          className={`feed-action-btn ${c.likedByMe ? 'feed-action-liked' : ''}`}
          onClick={() => onLike(c.id, c.likedByMe, c.likeCount)}
        >
          {c.likedByMe ? '❤️' : '🤍'} {c.likeCount > 0 ? c.likeCount : ''} Gefällt mir
        </button>
        <button className="feed-action-btn" onClick={openComments}>
          💬 {c.commentCount > 0 ? c.commentCount : ''} Kommentieren
        </button>
      </div>

      {commentsOpen && (
        <div className="feed-comments">
          {commLoading && <div className="feed-comments-loading">Lade Kommentare…</div>}
          {comments?.length === 0 && !commLoading && (
            <div className="feed-comments-empty">Noch keine Kommentare. Schreib den ersten! 👇</div>
          )}
          {comments?.map((cm) => (
            <div key={cm.id} className="feed-comment">
              <Avatar src={cm.user?.avatarBase64} name={cm.user?.name} size={30} className="feed-comment-avatar" />
              <div className="feed-comment-body">
                <div className="feed-comment-header">
                  <span className="feed-comment-author">{cm.user?.name}</span>
                  <span className="feed-comment-time">
                    {new Date(cm.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                  </span>
                  {cm.user?.id === currentUserId && (
                    <button className="feed-comment-delete" onClick={() => handleDeleteComment(cm.id)}>✕</button>
                  )}
                </div>
                <div className="feed-comment-text">{cm.text}</div>
              </div>
            </div>
          ))}
          <form className="feed-comment-form" onSubmit={handlePost}>
            <Avatar src={currentUser?.avatarBase64} name={currentUser?.name} size={30} className="feed-comment-avatar feed-comment-avatar-me" />
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Kommentar schreiben…"
              maxLength={500}
              disabled={posting}
            />
            <button type="submit" className="btn-primary" disabled={posting || !text.trim()}>
              {posting ? '⏳' : '📨'}
            </button>
          </form>
        </div>
      )}

      {lightboxSrc && (
        <PhotoLightbox src={lightboxSrc} alt={c.fishSpecies} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  );
}
