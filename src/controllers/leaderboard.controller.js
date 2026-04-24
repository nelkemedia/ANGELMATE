import prisma from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { catchAsync } from '../utils/catch-async.js';

const USER_SELECT = { id: true, name: true, skillLevel: true, homeRegion: true, avatarBase64: true };

// Returns e.g. "2025-W17"
function isoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// Returns Mon 00:00 UTC and following Mon 00:00 UTC for a given ISO week string
function weekBounds(weekStr) {
  const [yr, wPart] = weekStr.split('-W');
  const w = parseInt(wPart);
  const jan4 = new Date(Date.UTC(parseInt(yr), 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const start = new Date(jan4);
  start.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (w - 1) * 7);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);
  return { start, end };
}

// GET /api/leaderboard?scope=national&metric=catches&limit=10
export const getLeaderboard = catchAsync(async (req, res) => {
  const scope  = req.query.scope  || 'national'; // national | local
  const metric = req.query.metric || 'catches';  // catches | weight | record
  const limit  = Math.min(25, parseInt(req.query.limit) || 10);

  const userWhere = {};
  if (scope === 'local') {
    const region = req.user?.homeRegion;
    if (!region) return res.json({ items: [], scope, metric, region: null });
    userWhere.homeRegion = region;
  }

  const users = await prisma.user.findMany({
    where: userWhere,
    select: {
      ...USER_SELECT,
      catches: {
        where: { isPublic: true },
        select: { weight: true }
      }
    }
  });

  let ranked;
  if (metric === 'catches') {
    ranked = users.map((u) => ({
      ...u,
      score: u.catches.length,
      scoreLabel: `${u.catches.length} Fänge`
    }));
  } else if (metric === 'weight') {
    ranked = users.map((u) => {
      const total = u.catches.reduce((s, c) => s + (c.weight || 0), 0);
      return { ...u, score: total, scoreLabel: `${total.toFixed(1)} kg` };
    });
  } else if (metric === 'record') {
    ranked = users.map((u) => {
      const max = u.catches.length ? Math.max(...u.catches.map((c) => c.weight || 0)) : 0;
      return { ...u, score: max, scoreLabel: max > 0 ? `${max} kg` : '—' };
    });
  } else {
    throw new AppError('Ungültige Metrik.', 400);
  }

  ranked.sort((a, b) => b.score - a.score);
  const items = ranked.slice(0, limit).map(({ catches, ...u }) => u);

  res.json({ items, scope, metric, region: req.user?.homeRegion || null });
});

// GET /api/cotw/current  — nominees = top voted public catches this week
export const getCurrentCotw = catchAsync(async (req, res) => {
  const week = isoWeek();
  const myVotedCatchId = req.user
    ? (await prisma.weeklyVote.findUnique({
        where: { userId_week: { userId: req.user.id, week } }
      }))?.catchId ?? null
    : null;

  // Count votes per catch for this week
  const voteCounts = await prisma.weeklyVote.groupBy({
    by: ['catchId'],
    where: { week },
    _count: { catchId: true },
    orderBy: { _count: { catchId: 'desc' } },
    take: 20
  });

  const topCatchIds = voteCounts.map((v) => v.catchId);

  // Also pull recent public catches for nominees without votes yet (fill up to 10 slots)
  const recentIds = await prisma.catch.findMany({
    where: { isPublic: true, id: { notIn: topCatchIds } },
    orderBy: { createdAt: 'desc' },
    take: 20 - topCatchIds.length,
    select: { id: true }
  });

  const allIds = [...topCatchIds, ...recentIds.map((c) => c.id)];

  const catches = await prisma.catch.findMany({
    where: { id: { in: allIds }, isPublic: true },
    include: {
      user: { select: USER_SELECT },
      _count: { select: { comments: true, likes: true } }
    }
  });

  const voteMap = Object.fromEntries(voteCounts.map((v) => [v.catchId, v._count.catchId]));

  const nominees = catches
    .map((c) => ({
      ...c,
      commentCount: c._count.comments,
      likeCount: c._count.likes,
      weekVotes: voteMap[c.id] || 0,
      _count: undefined
    }))
    .sort((a, b) => b.weekVotes - a.weekVotes);

  const totalVotes = voteCounts.reduce((s, v) => s + v._count.catchId, 0);

  res.json({ week, nominees, myVotedCatchId, totalVotes });
});

// POST /api/cotw/vote/:catchId  — toggle vote (cast or retract)
export const castVote = catchAsync(async (req, res) => {
  const week    = isoWeek();
  const catchId = req.params.catchId;

  const item = await prisma.catch.findFirst({ where: { id: catchId, isPublic: true } });
  if (!item) throw new AppError('Fang nicht gefunden.', 404);

  const existing = await prisma.weeklyVote.findUnique({
    where: { userId_week: { userId: req.user.id, week } }
  });

  if (existing?.catchId === catchId) {
    // Same catch → retract vote
    await prisma.weeklyVote.delete({ where: { id: existing.id } });
    const weekVotes = await prisma.weeklyVote.count({ where: { catchId, week } });
    return res.json({ voted: false, catchId, weekVotes });
  }

  // New vote or switching to a different catch → upsert
  await prisma.weeklyVote.upsert({
    where: { userId_week: { userId: req.user.id, week } },
    update: { catchId },
    create: { userId: req.user.id, catchId, week }
  });

  const weekVotes = await prisma.weeklyVote.count({ where: { catchId, week } });
  res.json({ voted: true, catchId, weekVotes });
});

// GET /api/cotw/history  — winners of the last 6 weeks (excluding current)
export const getCotwHistory = catchAsync(async (req, res) => {
  const currentWeek = isoWeek();

  // Build last 6 week strings
  const weeks = [];
  const d = new Date();
  for (let i = 1; i <= 6; i++) {
    d.setUTCDate(d.getUTCDate() - 7);
    weeks.push(isoWeek(d));
  }

  const results = await Promise.all(
    weeks.map(async (week) => {
      const top = await prisma.weeklyVote.groupBy({
        by: ['catchId'],
        where: { week },
        _count: { catchId: true },
        orderBy: { _count: { catchId: 'desc' } },
        take: 1
      });
      if (!top.length) return { week, winner: null };

      const winner = await prisma.catch.findFirst({
        where: { id: top[0].catchId, isPublic: true },
        include: { user: { select: USER_SELECT } }
      });
      return { week, winner: winner ? { ...winner, weekVotes: top[0]._count.catchId } : null };
    })
  );

  res.json({ history: results.filter((r) => r.winner !== null) });
});
