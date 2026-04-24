import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/TranslationContext';
import { toLocaleTag } from '../utils/locale';
import Avatar from '../components/Avatar';
import PhotoLightbox from '../components/PhotoLightbox';

const SKILL_EMOJI = { beginner: '🐣', intermediate: '🎯', advanced: '🏆' };
const MEDAL = ['🥇', '🥈', '🥉'];

export default function Community() {
  const { t } = useT();
  const [tab, setTab] = useState('feed');

  return (
    <div>
      <div className="section-photo-banner section-photo-banner--community">
        <div className="section-photo-banner-text">
          <h2>🌍 {t('community.title')}</h2>
          <p>{t('community.subtitle')}</p>
        </div>
      </div>

      <div className="page">
        <div className="community-tabs">
          <button className={`community-tab ${tab === 'feed' ? 'active' : ''}`} onClick={() => setTab('feed')}>
            📰 {t('community.tab_feed')}
          </button>
          <button className={`community-tab ${tab === 'leaderboard' ? 'active' : ''}`} onClick={() => setTab('leaderboard')}>
            🏆 {t('community.tab_leaderboard')}
          </button>
          <button className={`community-tab ${tab === 'cotw' ? 'active' : ''}`} onClick={() => setTab('cotw')}>
            ⭐ {t('community.tab_cotw')}
          </button>
        </div>

        {tab === 'feed'        && <FeedTab />}
        {tab === 'leaderboard' && <LeaderboardTab />}
        {tab === 'cotw'        && <CotwTab />}
      </div>
    </div>
  );
}

function FeedTab() {
  const { user } = useAuth();
  const { t, locale } = useT();
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
          {t('community.feed_desc_before')}{' '}
          <Link to="/catches">{t('nav.catches')}</Link>
          {' '}{t('community.feed_desc_after')}
        </p>
      </div>

      {error && <div className="error-msg">⚠️ {error}</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🌍</div>
          <p>{t('community.feed_empty')}</p>
          <Link to="/catches" className="btn-primary">🎣 {t('community.share_catch')}</Link>
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

      {loading && <div className="loading">🌍 {t('community.feed_loading')}</div>}

      {!loading && page < pages && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button className="btn-ghost" onClick={() => load(page + 1)}>{t('community.load_more')}</button>
        </div>
      )}
    </>
  );
}

function LeaderboardTab() {
  const { user } = useAuth();
  const { t } = useT();
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

  const metricLabels = {
    catches: `🎣 ${t('community.metric_catches')}`,
    weight:  `⚖️ ${t('community.metric_weight')}`,
    record:  `🐋 ${t('community.metric_record')}`
  };

  return (
    <div className="lb-container">
      <div className="lb-controls">
        <div className="lb-scope-btns">
          <button className={`lb-scope-btn ${scope === 'national' ? 'active' : ''}`} onClick={() => setScope('national')}>
            🌍 {t('community.scope_national')}
          </button>
          <button
            className={`lb-scope-btn ${scope === 'local' ? 'active' : ''}`}
            onClick={() => setScope('local')}
            title={user?.homeRegion ? `${t('community.region_label')}: ${user.homeRegion}` : t('community.no_region')}
          >
            📍 {t('community.scope_local')} {user?.homeRegion ? `(${user.homeRegion})` : ''}
          </button>
        </div>
        <div className="lb-metric-select">
          {Object.entries(metricLabels).map(([key, label]) => (
            <button key={key} className={`lb-metric-btn ${metric === key ? 'active' : ''}`} onClick={() => setMetric(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="error-msg">⚠️ {error}</div>}
      {loading && <div className="loading">🏆 {t('community.lb_loading')}</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🏆</div>
          <p>{scope === 'local' && !user?.homeRegion ? t('community.lb_no_region') : t('community.lb_empty')}</p>
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
                  {u.name} {u.id === user?.id && <span className="lb-you-badge">{t('community.lb_you')}</span>}
                </span>
                <span className="lb-meta">
                  {SKILL_EMOJI[u.skillLevel]} {t(`skill.${u.skillLevel}`)}
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

function CotwTab() {
  const { user } = useAuth();
  const { t } = useT();
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
        return { ...prev, nominees, myVotedCatchId: result.voted ? catchId : null, totalVotes: prev.totalVotes + (result.voted ? 1 : -1) };
      });
    } catch { /* ignore */ }
    finally { setVoting(null); }
  }

  const leader = data?.nominees?.[0];
  const formatWeek = (w) => {
    if (!w) return '';
    const [yr, wPart] = w.split('-W');
    return `${t('community.week_abbr')} ${parseInt(wPart)} / ${yr}`;
  };

  return (
    <div className="cotw-container">
      <div className="cotw-header">
        <div className="cotw-header-text">
          <h3>⭐ {t('community.cotw_title')}</h3>
          <p>{t('community.cotw_desc')}</p>
          {data && <span className="cotw-week-badge">{formatWeek(data.week)} · {data.totalVotes} {t('community.votes_total')}</span>}
        </div>
      </div>

      {error  && <div className="error-msg">⚠️ {error}</div>}
      {loading && <div className="loading">⭐ {t('community.cotw_loading')}</div>}

      {!loading && data && (
        <>
          {leader && leader.weekVotes > 0 && (
            <div className="cotw-leader">
              <div className="cotw-leader-crown">👑 {t('community.leading')}</div>
              <CotwCard catch_={leader} myVotedCatchId={data.myVotedCatchId} onVote={handleVote} voting={voting} isLeader user={user} t={t} />
            </div>
          )}

          <div className="cotw-nominees">
            <h4 className="cotw-nominees-title">{t('community.all_nominees')}</h4>
            {data.nominees.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">⭐</div>
                <p>{t('community.cotw_empty')}</p>
                <Link to="/catches" className="btn-primary">🎣 {t('community.share_catch')}</Link>
              </div>
            )}
            <div className="cotw-list">
              {data.nominees.map((c, i) => (
                <CotwCard key={c.id} catch_={c} rank={i + 1} myVotedCatchId={data.myVotedCatchId} onVote={handleVote} voting={voting} user={user} t={t} />
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div className="cotw-history">
              <h4 className="cotw-nominees-title">🏅 {t('community.past_winners')}</h4>
              <div className="cotw-history-list">
                {history.map((h) => (
                  <div key={h.week} className="cotw-history-row">
                    <span className="cotw-history-week">{formatWeek(h.week)}</span>
                    <span className="cotw-history-winner">🥇 {h.winner.fishSpecies} – {h.winner.user?.name}</span>
                    <span className="cotw-history-votes">{h.winner.weekVotes} {t('community.votes')}</span>
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

function CotwCard({ catch_: c, rank, myVotedCatchId, onVote, voting, isLeader, user, t }) {
  const voted = myVotedCatchId === c.id;
  const isMe  = c.user?.id === user?.id;

  return (
    <div className={`cotw-card ${voted ? 'cotw-card-voted' : ''} ${isLeader ? 'cotw-card-leader' : ''}`}>
      {rank && <div className="cotw-card-rank">#{rank}</div>}
      <div className="cotw-card-body">
        <div className="feed-card-header" style={{ marginBottom: '0.5rem' }}>
          <Avatar src={c.user?.avatarBase64} name={c.user?.name} size={36} className="feed-avatar" />
          <div className="feed-user-info">
            <span className="feed-user-name">{c.user?.name} <span className="feed-skill">{SKILL_EMOJI[c.user?.skillLevel]}</span></span>
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
          <span className="cotw-vote-label">{t('community.votes')}</span>
        </div>
        {user && !isMe && (
          <button className={`cotw-vote-btn ${voted ? 'cotw-vote-btn-active' : ''}`} onClick={() => onVote(c.id)} disabled={voting !== null}>
            {voting === c.id ? '⏳' : voted ? `⭐ ${t('community.voted')}` : `☆ ${t('community.vote')}`}
          </button>
        )}
        {!user && <span className="cotw-login-hint">{t('community.login_to_vote')}</span>}
        {isMe  && <span className="cotw-login-hint">{t('community.your_catch')}</span>}
      </div>
    </div>
  );
}

function FeedCard({ catch_: c, currentUserId, currentUser, onLike, onCommentCountChange }) {
  const { t, locale } = useT();
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

  return (
    <div className="feed-card">
      <div className="feed-card-header">
        <Avatar src={c.user?.avatarBase64} name={c.user?.name} size={36} className="feed-avatar" />
        <div className="feed-user-info">
          <span className="feed-user-name">{c.user?.name} {' '}<span className="feed-skill">{SKILL_EMOJI[c.user?.skillLevel]}</span></span>
          {c.user?.homeRegion && <span className="feed-region">📍 {c.user.homeRegion}</span>}
        </div>
        <span className="feed-date">
          {new Date(c.createdAt).toLocaleDateString(toLocaleTag(locale), { day: '2-digit', month: 'short', year: 'numeric' })}
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
          <span>📅 {new Date(c.caughtAt).toLocaleDateString(toLocaleTag(locale))}</span>
          {c.weight && <span>⚖️ {c.weight} kg</span>}
          {c.length && <span>📏 {c.length} cm</span>}
        </div>
        {c.bait && <div className="feed-detail">🪱 {c.bait}{c.technique ? ` · 🎯 ${c.technique}` : ''}</div>}
        {c.notes && <div className="feed-notes">💬 {c.notes}</div>}
      </div>

      <div className="feed-card-actions">
        <button className={`feed-action-btn ${c.likedByMe ? 'feed-action-liked' : ''}`} onClick={() => onLike(c.id, c.likedByMe, c.likeCount)}>
          {c.likedByMe ? '❤️' : '🤍'} {c.likeCount > 0 ? c.likeCount : ''} {t('community.like')}
        </button>
        <button className="feed-action-btn" onClick={openComments}>
          💬 {c.commentCount > 0 ? c.commentCount : ''} {t('community.comment')}
        </button>
      </div>

      {commentsOpen && (
        <div className="feed-comments">
          {commLoading && <div className="feed-comments-loading">{t('community.comments_loading')}</div>}
          {comments?.length === 0 && !commLoading && (
            <div className="feed-comments-empty">{t('community.comments_empty')}</div>
          )}
          {comments?.map((cm) => (
            <div key={cm.id} className="feed-comment">
              <Avatar src={cm.user?.avatarBase64} name={cm.user?.name} size={30} className="feed-comment-avatar" />
              <div className="feed-comment-body">
                <div className="feed-comment-header">
                  <span className="feed-comment-author">{cm.user?.name}</span>
                  <span className="feed-comment-time">
                    {new Date(cm.createdAt).toLocaleDateString(toLocaleTag(locale), { day: '2-digit', month: 'short' })}
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
            <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} placeholder={t('community.comment_placeholder')} maxLength={500} disabled={posting} />
            <button type="submit" className="btn-primary" disabled={posting || !text.trim()}>{posting ? '⏳' : '📨'}</button>
          </form>
        </div>
      )}

      {lightboxSrc && (
        <PhotoLightbox src={lightboxSrc} alt={c.fishSpecies} onClose={() => setLightboxSrc(null)} />
      )}
    </div>
  );
}
