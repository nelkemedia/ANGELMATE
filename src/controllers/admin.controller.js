import prisma from '../config/prisma.js';
import { catchAsync } from '../utils/catch-async.js';
import { AppError } from '../utils/app-error.js';

// ── Reports ──────────────────────────────────────────────────────────────────

export const getReports = catchAsync(async (_req, res) => {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } }
    }
  });
  res.json({ reports });
});

export const resolveReport = catchAsync(async (req, res) => {
  const { id } = req.params;
  const report = await prisma.report.findUnique({ where: { id } });
  if (!report) throw new AppError('Report not found', 404);

  const updated = await prisma.report.update({
    where: { id },
    data: {
      resolved:   !report.resolved,
      resolvedAt: !report.resolved ? new Date() : null
    }
  });
  res.json({ report: updated });
});

export const deleteReport = catchAsync(async (req, res) => {
  const { id } = req.params;
  await prisma.report.delete({ where: { id } }).catch(() => {
    throw new AppError('Report not found', 404);
  });
  res.status(204).end();
});

// ── Users ─────────────────────────────────────────────────────────────────────

export const getUsers = catchAsync(async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      skillLevel: true, homeRegion: true, createdAt: true,
      _count: { select: { catches: true, spots: true, comments: true } }
    },
    orderBy: { createdAt: 'asc' }
  });
  res.json({ users });
});

export const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  // Prevent deleting yourself
  if (id === req.user.id) throw new AppError('Du kannst dein eigenes Konto nicht löschen.', 400);

  await prisma.user.delete({ where: { id } }).catch(() => {
    throw new AppError('User not found', 404);
  });
  res.status(204).end();
});
