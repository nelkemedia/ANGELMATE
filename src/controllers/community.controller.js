import { z } from 'zod';
import prisma from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { catchAsync } from '../utils/catch-async.js';

const USER_SELECT = { id: true, name: true, skillLevel: true, homeRegion: true, avatarBase64: true };

// GET /api/community/feed?page=1&limit=20
export const getFeed = catchAsync(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(50, parseInt(req.query.limit) || 20);
  const skip  = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.catch.findMany({
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: USER_SELECT },
        _count: { select: { comments: true, likes: true } },
        likes: req.user ? { where: { userId: req.user.id }, select: { id: true } } : false
      }
    }),
    prisma.catch.count({ where: { isPublic: true } })
  ]);

  const feed = items.map((c) => ({
    ...c,
    commentCount: c._count.comments,
    likeCount: c._count.likes,
    likedByMe: Array.isArray(c.likes) && c.likes.length > 0,
    _count: undefined,
    likes: undefined
  }));

  res.json({ items: feed, total, page, pages: Math.ceil(total / limit) });
});

// GET /api/community/:catchId/comments
export const getComments = catchAsync(async (req, res) => {
  const item = await prisma.catch.findFirst({
    where: { id: req.params.catchId, isPublic: true }
  });
  if (!item) throw new AppError('Fang nicht gefunden.', 404);

  const comments = await prisma.comment.findMany({
    where: { catchId: req.params.catchId },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: USER_SELECT } }
  });

  res.json({ items: comments });
});

// POST /api/community/:catchId/comments
export const addComment = catchAsync(async (req, res) => {
  const { text } = z.object({ text: z.string().min(1).max(500) }).parse(req.body);

  const item = await prisma.catch.findFirst({
    where: { id: req.params.catchId, isPublic: true }
  });
  if (!item) throw new AppError('Fang nicht gefunden.', 404);

  const comment = await prisma.comment.create({
    data: { text, userId: req.user.id, catchId: req.params.catchId },
    include: { user: { select: USER_SELECT } }
  });

  res.status(201).json(comment);
});

// DELETE /api/community/comments/:commentId
export const deleteComment = catchAsync(async (req, res) => {
  const comment = await prisma.comment.findFirst({
    where: { id: req.params.commentId, userId: req.user.id }
  });
  if (!comment) throw new AppError('Kommentar nicht gefunden.', 404);

  await prisma.comment.delete({ where: { id: req.params.commentId } });
  res.status(204).send();
});

// POST /api/community/:catchId/like  (toggle)
export const toggleLike = catchAsync(async (req, res) => {
  const item = await prisma.catch.findFirst({
    where: { id: req.params.catchId, isPublic: true }
  });
  if (!item) throw new AppError('Fang nicht gefunden.', 404);

  const existing = await prisma.like.findUnique({
    where: { userId_catchId: { userId: req.user.id, catchId: req.params.catchId } }
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { userId: req.user.id, catchId: req.params.catchId } });
  }

  const likeCount = await prisma.like.count({ where: { catchId: req.params.catchId } });
  res.json({ likedByMe: !existing, likeCount });
});
